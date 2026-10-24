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
  contractorMedia,
} from '@/lib/db/ownerSchema'

import {
  createAdminClient,
} from '@/lib/supabase/admin'


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
        contractorMedia.status,
        status
      )
    )
  }

  const rows =
    await db
      .select({
        id:
          contractorMedia.id,

        contractorId:
          contractorMedia.contractorId,

        storagePath:
          contractorMedia.storagePath,

        mediaType:
          contractorMedia.mediaType,

        altText:
          contractorMedia.altText,

        caption:
          contractorMedia.caption,

        status:
          contractorMedia.status,

        uploadedBy:
          contractorMedia.uploadedBy,

        adminNotes:
          contractorMedia.adminNotes,

        createdAt:
          contractorMedia.createdAt,

        contractorName:
          contractors.name,

        city:
          contractors.city,

        state:
          contractors.state,
      })
      .from(
        contractorMedia
      )
      .innerJoin(
        contractors,
        eq(
          contractorMedia.contractorId,
          contractors.id
        )
      )
      .where(
        conditions.length
          ? and(...conditions)
          : undefined
      )
      .orderBy(
        desc(
          contractorMedia.createdAt
        )
      )

  const admin =
    createAdminClient()

  const media =
    await Promise.all(
      rows.map(
        async (item) => {
          const {
            data,
          } =
            await admin.storage
              .from(
                'contractor-media'
              )
              .createSignedUrl(
                item.storagePath,
                3600
              )

          return {
            ...item,

            signedUrl:
              data?.signedUrl ||
              null,
          }
        }
      )
    )

  return NextResponse.json({
    media,
  })
}