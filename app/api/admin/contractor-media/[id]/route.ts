import {
  NextRequest,
  NextResponse,
} from 'next/server'

import {
  eq,
} from 'drizzle-orm'

import {
  revalidatePath,
} from 'next/cache'

import {
  getCurrentUser,
  isAdmin,
} from '@/lib/admin'

import {
  getDb,
} from '@/lib/db'

import {
  contractors,
} from '@/lib/db/schema'

import {
  contractorMedia,
} from '@/lib/db/ownerSchema'

import {
  createAdminClient,
} from '@/lib/supabase/admin'


export async function PATCH(
  request: NextRequest,
  {
    params,
  }: {
    params: Promise<{
      id: string
    }>
  }
) {
  if (!(await isAdmin())) {
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

  const adminUser =
    await getCurrentUser()

  if (!adminUser) {
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

  const { id } =
    await params

  const mediaId =
    Number(id)

  if (
    !Number.isInteger(
      mediaId
    )
  ) {
    return NextResponse.json(
      {
        error:
          'Invalid media',
      },
      {
        status: 400,
      }
    )
  }

  const body =
    await request.json()

  const status =
    String(body.status || '')

  if (
    ![
      'approved',
      'rejected',
    ].includes(status)
  ) {
    return NextResponse.json(
      {
        error:
          'Invalid status',
      },
      {
        status: 400,
      }
    )
  }

  const db = getDb()

  const [media] =
    await db
      .select()
      .from(
        contractorMedia
      )
      .where(
        eq(
          contractorMedia.id,
          mediaId
        )
      )
      .limit(1)

  if (!media) {
    return NextResponse.json(
      {
        error:
          'Media not found',
      },
      {
        status: 404,
      }
    )
  }

  const [contractor] =
    await db
      .select()
      .from(contractors)
      .where(
        eq(
          contractors.id,
          media.contractorId
        )
      )
      .limit(1)

  await db
    .update(
      contractorMedia
    )
    .set({
      status,

      adminNotes:
        body.adminNotes ||
        null,

      reviewedBy:
        adminUser.id,

      reviewedAt:
        new Date(),
    })
    .where(
      eq(
        contractorMedia.id,
        mediaId
      )
    )

  if (
    status === 'rejected'
  ) {
    const admin =
      createAdminClient()

    const {
      error,
    } =
      await admin.storage
        .from(
          'contractor-media'
        )
        .remove([
          media.storagePath,
        ])

    if (error) {
      console.error(
        'Rejected media cleanup failed:',
        error
      )
    }
  }

  if (
    contractor?.stateSlug &&
    contractor.slug
  ) {
    revalidatePath(
      `/${contractor.stateSlug}/${contractor.slug}`
    )
  }

  revalidatePath(
    `/dashboard/business/${media.contractorId}`
  )

  return NextResponse.json({
    success: true,
  })
}