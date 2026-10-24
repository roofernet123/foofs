import {
  NextRequest,
  NextResponse,
} from 'next/server'

import {
  and,
  desc,
  eq,
} from 'drizzle-orm'

import {
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
  contractorUsers,
} from '@/lib/db/ownerSchema'


export async function GET(
  request: NextRequest
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

  const status =
    request.nextUrl.searchParams.get(
      'status'
    ) || 'pending'

  const db = getDb()

  const conditions = []

  if (status !== 'all') {
    conditions.push(
      eq(
        contractorUpdateRequests.status,
        status
      )
    )
  }

  const updates =
    await db
      .select({
        id:
          contractorUpdateRequests.id,

        contractorId:
          contractorUpdateRequests.contractorId,

        submittedBy:
          contractorUpdateRequests.submittedBy,

        changes:
          contractorUpdateRequests.changes,

        previousValues:
          contractorUpdateRequests.previousValues,

        status:
          contractorUpdateRequests.status,

        adminNotes:
          contractorUpdateRequests.adminNotes,

        createdAt:
          contractorUpdateRequests.createdAt,

        reviewedAt:
          contractorUpdateRequests.reviewedAt,

        contractorName:
          contractors.name,

        city:
          contractors.city,

        state:
          contractors.state,

        userEmail:
          contractorUsers.userEmail,
      })
      .from(
        contractorUpdateRequests
      )
      .innerJoin(
        contractors,
        eq(
          contractorUpdateRequests.contractorId,
          contractors.id
        )
      )
      .leftJoin(
        contractorUsers,
        and(
          eq(
            contractorUsers.contractorId,
            contractorUpdateRequests.contractorId
          ),
          eq(
            contractorUsers.userId,
            contractorUpdateRequests.submittedBy
          )
        )
      )
      .where(
        conditions.length
          ? and(...conditions)
          : undefined
      )
      .orderBy(
        desc(
          contractorUpdateRequests.createdAt
        )
      )

  return NextResponse.json({
    updates,
  })
}