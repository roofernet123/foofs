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
  contractorUpdateRequests,
} from '@/lib/db/ownerSchema'

import {
  contractorToEditableProfile,
  sanitizeProfileChanges,
  valuesEqual,
} from '@/lib/contractorProfile'


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
        error: 'Unauthorized',
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
        error: 'Unauthorized',
      },
      {
        status: 401,
      }
    )
  }

  const { id } =
    await params

  const requestId =
    Number(id)

  if (
    !Number.isInteger(
      requestId
    )
  ) {
    return NextResponse.json(
      {
        error:
          'Invalid update request',
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

  const [updateRequest] =
    await db
      .select()
      .from(
        contractorUpdateRequests
      )
      .where(
        eq(
          contractorUpdateRequests.id,
          requestId
        )
      )
      .limit(1)

  if (!updateRequest) {
    return NextResponse.json(
      {
        error:
          'Update request not found',
      },
      {
        status: 404,
      }
    )
  }

  if (
    updateRequest.status !==
    'pending'
  ) {
    return NextResponse.json(
      {
        error:
          'This update has already been reviewed.',
      },
      {
        status: 409,
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
          updateRequest.contractorId
        )
      )
      .limit(1)

  if (!contractor) {
    return NextResponse.json(
      {
        error:
          'Contractor not found',
      },
      {
        status: 404,
      }
    )
  }

  if (
    status === 'rejected'
  ) {
    await db
      .update(
        contractorUpdateRequests
      )
      .set({
        status:
          'rejected',

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
          contractorUpdateRequests.id,
          requestId
        )
      )

    return NextResponse.json({
      success: true,
    })
  }

  let changes

  try {
    changes =
      sanitizeProfileChanges(
        updateRequest.changes
      )
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Invalid profile data',
      },
      {
        status: 400,
      }
    )
  }

  const previous =
    updateRequest.previousValues ||
    {}

  const current =
    contractorToEditableProfile(
      contractor
    )

  const conflicts:
    string[] = []

  for (
    const [
      key,
      previousValue,
    ] of Object.entries(previous)
  ) {
    const currentValue =
      (
        current as any
      )[key]

    if (
      !valuesEqual(
        currentValue,
        previousValue
      )
    ) {
      conflicts.push(key)
    }
  }

  if (
    conflicts.length &&
    !body.force
  ) {
    return NextResponse.json(
      {
        error:
          'The contractor profile changed after this request was submitted.',

        conflicts,
      },
      {
        status: 409,
      }
    )
  }

  await db.transaction(
    async (tx) => {
      await tx
        .update(contractors)
        .set({
          ...(changes as any),

          ownerUpdatedAt:
            new Date(),

          updatedAt:
            new Date(),
        })
        .where(
          eq(
            contractors.id,
            contractor.id
          )
        )

      await tx
        .update(
          contractorUpdateRequests
        )
        .set({
          status:
            'approved',

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
            contractorUpdateRequests.id,
            requestId
          )
        )
    }
  )

  if (
    contractor.stateSlug &&
    contractor.slug
  ) {
    revalidatePath(
      `/${contractor.stateSlug}/${contractor.slug}`
    )
  }

  revalidatePath(
    '/dashboard'
  )

  revalidatePath(
    `/dashboard/business/${contractor.id}`
  )

  return NextResponse.json({
    success: true,
  })
}