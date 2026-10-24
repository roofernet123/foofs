import {
  NextResponse,
} from 'next/server'

import {
  and,
  desc,
  eq,
} from 'drizzle-orm'

import {
  createClient,
} from '@/lib/supabase/server'

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
  userOwnsContractor,
} from '@/lib/contractorOwnership'

import {
  contractorToEditableProfile,
  diffProfile,
  sanitizeProfileChanges,
} from '@/lib/contractorProfile'


export async function POST(
  request: Request
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
          error:
            'Unauthorized',
        },
        {
          status: 401,
        }
      )
    }

    const body =
      await request.json()

    const contractorId =
      Number(
        body.contractorId
      )

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

    const owns =
      await userOwnsContractor(
        user.id,
        contractorId
      )

    if (!owns) {
      return NextResponse.json(
        {
          error:
            'You do not have permission to manage this business.',
        },
        {
          status: 403,
        }
      )
    }

    let requested

    try {
      requested =
        sanitizeProfileChanges(
          body.changes
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

    const db = getDb()

    const [contractor] =
      await db
        .select()
        .from(contractors)
        .where(
          eq(
            contractors.id,
            contractorId
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

    const current =
      contractorToEditableProfile(
        contractor
      )

    const {
      changes,
      previousValues,
    } =
      diffProfile(
        current,
        requested
      )

    if (
      Object.keys(changes)
        .length === 0
    ) {
      return NextResponse.json(
        {
          error:
            'There are no changes to submit.',
        },
        {
          status: 400,
        }
      )
    }

    const [pending] =
      await db
        .select()
        .from(
          contractorUpdateRequests
        )
        .where(
          and(
            eq(
              contractorUpdateRequests.contractorId,
              contractorId
            ),
            eq(
              contractorUpdateRequests.submittedBy,
              user.id
            ),
            eq(
              contractorUpdateRequests.status,
              'pending'
            )
          )
        )
        .orderBy(
          desc(
            contractorUpdateRequests.createdAt
          )
        )
        .limit(1)

    if (pending) {
      const [updated] =
        await db
          .update(
            contractorUpdateRequests
          )
          .set({
            changes,
            previousValues,
            adminNotes:
              null,
          })
          .where(
            eq(
              contractorUpdateRequests.id,
              pending.id
            )
          )
          .returning()

      return NextResponse.json({
        success: true,
        request:
          updated,
        replaced:
          true,
      })
    }

    const [created] =
      await db
        .insert(
          contractorUpdateRequests
        )
        .values({
          contractorId,

          submittedBy:
            user.id,

          changes,

          previousValues,

          status:
            'pending',
        })
        .returning()

    return NextResponse.json(
      {
        success: true,
        request:
          created,
      },
      {
        status: 201,
      }
    )
  } catch (error) {
    console.error(
      'Profile update request error:',
      error
    )

    return NextResponse.json(
      {
        error:
          'Failed to submit profile update.',
      },
      {
        status: 500,
      }
    )
  }
}