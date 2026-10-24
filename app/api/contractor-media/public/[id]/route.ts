import {
  NextRequest,
  NextResponse,
} from 'next/server'

import {
  and,
  eq,
} from 'drizzle-orm'

import {
  getDb,
} from '@/lib/db'

import {
  contractorMedia,
} from '@/lib/db/ownerSchema'

import {
  createAdminClient,
} from '@/lib/supabase/admin'


export const dynamic =
  'force-dynamic'


export async function GET(
  request: NextRequest,
  {
    params,
  }: {
    params: Promise<{
      id: string
    }>
  }
) {
  const { id } =
    await params

  const mediaId =
    Number(id)

  if (
    !Number.isInteger(
      mediaId
    )
  ) {
    return new NextResponse(
      'Not found',
      {
        status: 404,
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
        and(
          eq(
            contractorMedia.id,
            mediaId
          ),
          eq(
            contractorMedia.status,
            'approved'
          )
        )
      )
      .limit(1)

  if (!media) {
    return new NextResponse(
      'Not found',
      {
        status: 404,
      }
    )
  }

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
      .createSignedUrl(
        media.storagePath,
        300
      )

  if (
    error ||
    !data?.signedUrl
  ) {
    return new NextResponse(
      'Image unavailable',
      {
        status: 404,
      }
    )
  }

  const response =
    NextResponse.redirect(
      data.signedUrl
    )

  response.headers.set(
    'Cache-Control',
    'public, max-age=240'
  )

  return response
}