import {
  NextRequest,
  NextResponse,
} from 'next/server'

import {
  eq,
} from 'drizzle-orm'

import { getDb } from '@/lib/db'

import {
  businessSubmissions,
} from '@/lib/db/schema'

import {
  createClient,
} from '@/lib/supabase/server'

import {
  createAdminClient,
} from '@/lib/supabase/admin'


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

// Supabase recommends resumable uploads
// for files larger than 6MB.
const MAX_FILE_SIZE =
  6 * 1024 * 1024


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
      ) ||
      submissionId <= 0
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

    const body =
      await request.json()

    const filename =
      String(
        body.filename || ''
      ).trim()

    const contentType =
      String(
        body.contentType || ''
      ).trim()

    const size =
      Number(body.size)

    if (
      !filename ||
      !ALLOWED_TYPES.includes(
        contentType
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

    if (
      !Number.isFinite(size) ||
      size <= 0 ||
      size > MAX_FILE_SIZE
    ) {
      return NextResponse.json(
        {
          error:
            'Each image must be 6MB or smaller.',
        },
        {
          status: 400,
        }
      )
    }

    const extension =
      filename
        .split('.')
        .pop()
        ?.toLowerCase() ||
      ''

    if (
      !ALLOWED_EXTENSIONS.includes(
        extension
      )
    ) {
      return NextResponse.json(
        {
          error:
            'Invalid image extension.',
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
            'This submission is no longer accepting uploads.',
        },
        {
          status: 409,
        }
      )
    }

    const path =
      `submissions/${user.id}/${submissionId}/${crypto.randomUUID()}.${extension}`

    const admin =
      createAdminClient()

    const {
      data,
      error,
    } =
      await admin.storage
        .from(
          'contractor-media'
        )
        .createSignedUploadUrl(
          path,
          {
            upsert: false,
          }
        )

    if (
      error ||
      !data?.token
    ) {
      console.error(
        'Signed upload URL error:',
        error
      )

      return NextResponse.json(
        {
          error:
            'Unable to prepare image upload.',
        },
        {
          status: 500,
        }
      )
    }

    return NextResponse.json({
      path,
      token:
        data.token,
    })
  } catch (error) {
    console.error(
      'Upload URL error:',
      error
    )

    return NextResponse.json(
      {
        error:
          'Unable to prepare upload.',
      },
      {
        status: 500,
      }
    )
  }
}