import {
  NextRequest,
  NextResponse,
} from 'next/server'

import {
  eq,
} from 'drizzle-orm'

import {
  createClient,
} from '@/lib/supabase/server'

import {
  createAdminClient,
} from '@/lib/supabase/admin'

import {
  getDb,
} from '@/lib/db'

import {
  contractorMedia,
} from '@/lib/db/ownerSchema'

import {
  userOwnsContractor,
} from '@/lib/contractorOwnership'


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
          'Invalid media ID',
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
          'Image not found',
      },
      {
        status: 404,
      }
    )
  }

  if (
    !(await userOwnsContractor(
      user.id,
      media.contractorId
    ))
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

  try {
    const admin =
      createAdminClient()

    const {
      error: storageError,
    } =
      await admin.storage
        .from(
          'contractor-media'
        )
        .remove([
          media.storagePath,
        ])

    if (storageError) {
      console.error(
        'Storage delete warning:',
        storageError
      )
    }

    await db
      .delete(
        contractorMedia
      )
      .where(
        eq(
          contractorMedia.id,
          mediaId
        )
      )

    return NextResponse.json({
      success: true,
    })
  } catch (error) {
    console.error(
      'Media delete error:',
      error
    )

    return NextResponse.json(
      {
        error:
          'Failed to delete image',
      },
      {
        status: 500,
      }
    )
  }
}