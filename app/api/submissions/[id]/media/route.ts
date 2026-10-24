import {
  NextRequest,
  NextResponse,
} from 'next/server'

import {
  and,
  eq,
  sql,
} from 'drizzle-orm'

import { getDb } from '@/lib/db'

import {
  businessSubmissions,
} from '@/lib/db/schema'

import {
  businessSubmissionMedia,
} from '@/lib/db/ownerSchema'

import {
  createClient,
} from '@/lib/supabase/server'

import {
  createAdminClient,
} from '@/lib/supabase/admin'


const ALLOWED_MEDIA_TYPES = [
  'logo',
  'gallery',
  'project',
  'team',
  'vehicle',
  'office',
]


export async function POST(
  request: NextRequest,
  {
    params,
  }: {
    params: Promise<{
      id: string
    }>
  }
) {
  const supabase =
    await createClient()

  const {
    data: { user },
  } =
    await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json(
      {
        error: 'Unauthorized',
      },
      {
        status: 401,
      }
    )
  }

  const { id } =
    await params

  const submissionId =
    Number(id)

  if (
    !Number.isInteger(
      submissionId
    )
  ) {
    return NextResponse.json(
      {
        error:
          'Invalid submission ID',
      },
      {
        status: 400,
      }
    )
  }

  try {
    const body =
      await request.json()

    const storagePath =
      String(
        body.storagePath || ''
      ).trim()

    const expectedPrefix =
      `submissions/${user.id}/${submissionId}/`

    if (
      !storagePath.startsWith(
        expectedPrefix
      ) ||
      storagePath.includes('..')
    ) {
      return NextResponse.json(
        {
          error:
            'Invalid image path',
        },
        {
          status: 400,
        }
      )
    }

    const db = getDb()

    const [submission] =
      await db
        .select()
        .from(
          businessSubmissions
        )
        .where(
          eq(
            businessSubmissions.id,
            submissionId
          )
        )
        .limit(1)

    if (!submission) {
      return NextResponse.json(
        {
          error:
            'Submission not found',
        },
        {
          status: 404,
        }
      )
    }

    if (
      submission.userId !==
      user.id
    ) {
      return NextResponse.json(
        {
          error:
            'Forbidden',
        },
        {
          status: 403,
        }
      )
    }

    if (
      submission.status !==
      'processing'
    ) {
      return NextResponse.json(
        {
          error:
            'Submission is no longer accepting photos.',
        },
        {
          status: 409,
        }
      )
    }

    const [
      countResult,
    ] =
      await db
        .select({
          count:
            sql<number>`COUNT(*)`,
        })
        .from(
          businessSubmissionMedia
        )
        .where(
          eq(
            businessSubmissionMedia.submissionId,
            submissionId
          )
        )

    if (
      Number(
        countResult?.count || 0
      ) >= 10
    ) {
      return NextResponse.json(
        {
          error:
            'Maximum 10 business photos allowed.',
        },
        {
          status: 400,
        }
      )
    }

    const [existing] =
      await db
        .select({
          id:
            businessSubmissionMedia.id,
        })
        .from(
          businessSubmissionMedia
        )
        .where(
          and(
            eq(
              businessSubmissionMedia.submissionId,
              submissionId
            ),
            eq(
              businessSubmissionMedia.storagePath,
              storagePath
            )
          )
        )
        .limit(1)

    if (existing) {
      return NextResponse.json({
        success: true,
        mediaId:
          existing.id,
      })
    }


    // Verify the file really exists in Storage
    const parts =
      storagePath.split('/')

    const filename =
      parts.pop()!

    const folder =
      parts.join('/')

    const admin =
      createAdminClient()

    const {
      data: objects,
      error: listError,
    } =
      await admin.storage
        .from(
          'contractor-media'
        )
        .list(
          folder,
          {
            search:
              filename,

            limit: 10,
          }
        )

    if (listError) {
      console.error(
        'Storage verification error:',
        listError
      )

      return NextResponse.json(
        {
          error:
            'Unable to verify uploaded image.',
        },
        {
          status: 500,
        }
      )
    }

    const exists =
      objects?.some(
        (object) =>
          object.name ===
          filename
      )

    if (!exists) {
      return NextResponse.json(
        {
          error:
            'Uploaded image was not found.',
        },
        {
          status: 400,
        }
      )
    }

    const requestedType =
      String(
        body.mediaType ||
          'gallery'
      )

    const mediaType =
      ALLOWED_MEDIA_TYPES.includes(
        requestedType
      )
        ? requestedType
        : 'gallery'

    try {
      const [media] =
        await db
          .insert(
            businessSubmissionMedia
          )
          .values({
            submissionId,

            storagePath,

            mediaType,

            altText:
              String(
                body.altText ||
                  ''
              )
                .trim()
                .slice(
                  0,
                  255
                ) ||
              null,

            caption:
              String(
                body.caption ||
                  ''
              )
                .trim()
                .slice(
                  0,
                  1000
                ) ||
              null,
          })
          .returning()

      return NextResponse.json(
        {
          success: true,
          media,
        },
        {
          status: 201,
        }
      )
    } catch (dbError) {
      // Don't leave an orphan if DB registration fails.
      await admin.storage
        .from(
          'contractor-media'
        )
        .remove([
          storagePath,
        ])

      throw dbError
    }
  } catch (error) {
    console.error(
      'Register submission media error:',
      error
    )

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Unable to register image.',
      },
      {
        status: 500,
      }
    )
  }
}