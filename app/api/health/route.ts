
import { NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { sql } from 'drizzle-orm'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const db = getDb()

    await db.execute(sql`SELECT 1 AS healthy`)

    const contractorCount = await db.execute(
      sql`SELECT COUNT(*) AS count FROM contractors WHERE published = true`
    )

    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      counts: {
        contractors: Number(contractorCount.rows[0]?.count ?? 0),
      },
    })
  } catch (error) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        error: (error as Error).message,
      },
      { status: 500 }
    )
  }
}
