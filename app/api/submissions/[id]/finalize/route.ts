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
  businessSubmissionMedia,
} from '@/lib/db/ownerSchema'

import {
  createClient,
} from '@/lib/supabase/server'

import {
  createAdminClient,
} from '@/lib/supabase/admin'


async function getOwnedSubmission(
  submissionId: number,
  userId: string
) {
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

  if (
    !submission ||
    submission.userId !==
      userId
  ) {
    return null
  }

  return submission
}


// Mark upload complete and expose it to admin review
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
      { error: 'Unauthorized' },
      { status: 401 }
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
          'Invalid submission',
      },
      {
        status: 400,
      }
    )
  }

  const submission =
    await getOwnedSubmission(
      submissionId,
      user.id
    )

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
    submission.status !==
    'processing'
  ) {
    return NextResponse.json(
      {
        error:
          'Submission has already been finalized.',
      },
      {
        status: 409,
      }
    )
  }

  const db = getDb()

  const [updated] =
    await db
      .update(
        businessSubmissions
      )
      .set({
        status:
          'pending',

        updatedAt:
          new Date(),
      })
      .where(
        eq(
          businessSubmissions.id,
          submissionId
        )
      )
      .returning()

  return NextResponse.json({
    success: true,
    submission:
      updated,
  })
}


// Cancel a failed in-progress submission
export async function DELETE(
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
      { error: 'Unauthorized' },
      { status: 401 }
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
          'Invalid submission',
      },
      {
        status: 400,
      }
    )
  }

  const submission =
    await getOwnedSubmission(
      submissionId,
      user.id
    )

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
    submission.status !==
    'processing'
  ) {
    return NextResponse.json(
      {
        error:
          'Only incomplete submissions can be cancelled.',
      },
      {
        status: 409,
      }
    )
  }

  let extraPaths:
    string[] = []

  try {
    const body =
      await request.json()

    if (
      Array.isArray(
        body.extraPaths
      )
    ) {
      extraPaths =
        body.extraPaths.filter(
          (
            value: unknown
          ): value is string =>
            typeof value ===
              'string'
        )
    }
  } catch {
    // DELETE body is optional
  }

  const allowedPrefix =
    `submissions/${user.id}/${submissionId}/`

  extraPaths =
    extraPaths.filter(
      (path) =>
        path.startsWith(
          allowedPrefix
        ) &&
        !path.includes('..')
    )

  const db = getDb()

  const media =
    await db
      .select()
      .from(
        businessSubmissionMedia
      )
      .where(
        eq(
          businessSubmissionMedia.submissionId,
          submissionId
        )
      )

  const paths =
    Array.from(
      new Set([
        ...media.map(
          (item) =>
            item.storagePath
        ),
        ...extraPaths,
      ])
    )

  if (paths.length) {
    const admin =
      createAdminClient()

    const {
      error,
    } =
      await admin.storage
        .from(
          'contractor-media'
        )
        .remove(paths)

    if (error) {
      console.error(
        'Draft cleanup storage warning:',
        error
      )
    }
  }

  await db
    .delete(
      businessSubmissions
    )
    .where(
      eq(
        businessSubmissions.id,
        submissionId
      )
    )

  return NextResponse.json({
    success: true,
  })
}