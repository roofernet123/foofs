import {
  NextResponse,
} from 'next/server'

import {
  and,
  eq,
  or,
  sql,
} from 'drizzle-orm'

import {
  createClient,
} from '@/lib/supabase/server'

import {
  createAdminClient,
} from '@/lib/supabase/admin'

import {
  getDb,
} from '@/lib/db'

import {
  contractorMedia,
} from '@/lib/db/ownerSchema'

import {
  userOwnsContractor,
} from '@/lib/contractorOwnership'


const ALLOWED_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
]

const ALLOWED_EXTENSIONS = [
  'jpg',
  'jpeg',
  'png',
  'webp',
]

const ALLOWED_MEDIA_TYPES = [
  'logo',
  'gallery',
  'project',
  'team',
  'vehicle',
  'office',
]


export async function POST(
  request: Request
) {
  let uploadedPath:
    string | null = null

  try {
    const supabase =
      await createClient()

    const {
      data: { user },
    } =
      await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        {
          error:
            'Unauthorized',
        },
        {
          status: 401,
        }
      )
    }

    const formData =
      await request.formData()

    const contractorId =
      Number(
        formData.get(
          'contractorId'
        )
      )

    const file =
      formData.get('file')

    if (
      !Number.isInteger(
        contractorId
      )
    ) {
      return NextResponse.json(
        {
          error:
            'Invalid contractor',
        },
        {
          status: 400,
        }
      )
    }

    if (
      !(file instanceof File)
    ) {
      return NextResponse.json(
        {
          error:
            'No image supplied',
        },
        {
          status: 400,
        }
      )
    }

    if (
      !(await userOwnsContractor(
        user.id,
        contractorId
      ))
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

    const extension =
      file.name
        .split('.')
        .pop()
        ?.toLowerCase() ||
      ''

    if (
      !ALLOWED_TYPES.includes(
        file.type
      ) ||
      !ALLOWED_EXTENSIONS.includes(
        extension
      )
    ) {
      return NextResponse.json(
        {
          error:
            'Only JPG, PNG and WebP images are allowed.',
        },
        {
          status: 400,
        }
      )
    }

    const maxSize =
      8 * 1024 * 1024

    if (
      file.size > maxSize
    ) {
      return NextResponse.json(
        {
          error:
            'Image must be smaller than 8MB.',
        },
        {
          status: 400,
        }
      )
    }

    const db = getDb()

    const [
      mediaCountResult,
    ] =
      await db
        .select({
          count:
            sql<number>`COUNT(*)`,
        })
        .from(
          contractorMedia
        )
        .where(
          and(
            eq(
              contractorMedia.contractorId,
              contractorId
            ),
            or(
              eq(
                contractorMedia.status,
                'pending'
              ),
              eq(
                contractorMedia.status,
                'approved'
              )
            )
          )
        )

    const mediaCount =
      Number(
        mediaCountResult?.count ||
          0
      )

    if (mediaCount >= 20) {
      return NextResponse.json(
        {
          error:
            'A business can have a maximum of 20 active images.',
        },
        {
          status: 400,
        }
      )
    }

    let mediaType =
      String(
        formData.get(
          'mediaType'
        ) ||
          'gallery'
      )

    if (
      !ALLOWED_MEDIA_TYPES.includes(
        mediaType
      )
    ) {
      mediaType =
        'gallery'
    }

    const altText =
      String(
        formData.get(
          'altText'
        ) ||
          ''
      )
        .trim()
        .slice(0, 255) ||
      null

    const caption =
      String(
        formData.get(
          'caption'
        ) ||
          ''
      )
        .trim()
        .slice(0, 1000) ||
      null

    uploadedPath =
      `${user.id}/${contractorId}/${crypto.randomUUID()}.${extension}`

    const admin =
      createAdminClient()

    const {
      error: uploadError,
    } =
      await admin.storage
        .from(
          'contractor-media'
        )
        .upload(
          uploadedPath,
          file,
          {
            contentType:
              file.type,
            upsert:
              false,
          }
        )

    if (uploadError) {
      throw uploadError
    }

    try {
      const [media] =
        await db
          .insert(
            contractorMedia
          )
          .values({
            contractorId,

            storagePath:
              uploadedPath,

            mediaType,

            altText,

            caption,

            status:
              'pending',

            uploadedBy:
              user.id,
          })
          .returning()

      const {
        data: signed,
      } =
        await admin.storage
          .from(
            'contractor-media'
          )
          .createSignedUrl(
            uploadedPath,
            3600
          )

      return NextResponse.json(
        {
          success: true,

          media: {
            ...media,

            signedUrl:
              signed?.signedUrl ||
              null,
          },
        },
        {
          status: 201,
        }
      )
    } catch (dbError) {
      await admin.storage
        .from(
          'contractor-media'
        )
        .remove([
          uploadedPath,
        ])

      throw dbError
    }
  } catch (error) {
    console.error(
      'Contractor media upload error:',
      error
    )

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Failed to upload image',
      },
      {
        status: 500,
      }
    )
  }
}