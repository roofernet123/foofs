import { and, eq } from 'drizzle-orm'

import { getDb } from '@/lib/db'

import {
  contractorUsers,
} from '@/lib/db/ownerSchema'

export async function getActiveOwnership(
  userId: string,
  contractorId: number
) {
  const db = getDb()

  const [ownership] =
    await db
      .select()
      .from(contractorUsers)
      .where(
        and(
          eq(
            contractorUsers.userId,
            userId
          ),
          eq(
            contractorUsers.contractorId,
            contractorId
          ),
          eq(
            contractorUsers.status,
            'active'
          )
        )
      )
      .limit(1)

  return ownership ?? null
}

export async function userOwnsContractor(
  userId: string,
  contractorId: number
) {
  return Boolean(
    await getActiveOwnership(
      userId,
      contractorId
    )
  )
}