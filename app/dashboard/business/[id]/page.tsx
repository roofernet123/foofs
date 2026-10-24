import {
  and,
  desc,
  eq,
} from 'drizzle-orm'

import {
  ArrowLeft,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react'

import Link from 'next/link'

import {
  notFound,
  redirect,
} from 'next/navigation'

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
  contractors,
} from '@/lib/db/schema'

import {
  contractorMedia,
  contractorUpdateRequests,
} from '@/lib/db/ownerSchema'

import {
  userOwnsContractor,
} from '@/lib/contractorOwnership'

import {
  contractorToEditableProfile,
} from '@/lib/contractorProfile'

import {
  BusinessProfileEditor,
} from '@/components/business/BusinessProfileEditor'


export const dynamic =
  'force-dynamic'


export default async function ManageBusinessPage({
  params,
}: {
  params: Promise<{
    id: string
  }>
}) {
  const {
    id,
  } = await params

  const contractorId =
    Number(id)

  if (
    !Number.isInteger(
      contractorId
    )
  ) {
    notFound()
  }

  const supabase =
    await createClient()

  const {
    data: { user },
  } =
    await supabase.auth.getUser()

  if (!user) {
    redirect(
      `/auth/login?redirect=/dashboard/business/${contractorId}`
    )
  }

  const owns =
    await userOwnsContractor(
      user.id,
      contractorId
    )

  if (!owns) {
    redirect('/dashboard')
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
    notFound()
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

  const mediaRows =
    await db
      .select()
      .from(
        contractorMedia
      )
      .where(
        eq(
          contractorMedia.contractorId,
          contractorId
        )
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
      mediaRows.map(
        async (item) => {
          if (
            item.status ===
            'rejected'
          ) {
            return {
              ...item,
              signedUrl:
                null,
            }
          }

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

  const canonical =
    contractorToEditableProfile(
      contractor
    )

  const initialProfile = {
    ...canonical,
    ...(pending?.changes ||
      {}),
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto max-w-5xl px-4 py-8">

        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <Link
              href="/dashboard"
              className="mb-3 inline-flex items-center gap-1 text-sm text-blue-600 hover:underline"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to dashboard
            </Link>

            <h1 className="text-3xl font-bold text-gray-900">
              Manage {contractor.name}
            </h1>

            <p className="mt-1 text-gray-500">
              Submit accurate,
              owner-provided information
              for your RooferNet listing.
            </p>
          </div>

          <div className="flex items-center gap-3">

            {contractor.ownershipVerified && (
              <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-3 py-2 text-sm font-medium text-green-700">
                <ShieldCheck className="h-4 w-4" />
                Ownership verified
              </span>
            )}

            {contractor.stateSlug &&
              contractor.slug && (
              <Link
                target="_blank"
                href={`/${contractor.stateSlug}/${contractor.slug}`}
                className="inline-flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm hover:bg-gray-50"
              >
                View listing
                <ExternalLink className="h-4 w-4" />
              </Link>
            )}
          </div>
        </div>

        <BusinessProfileEditor
          contractorId={
            contractor.id
          }
          contractorName={
            contractor.name
          }
          initialProfile={
            initialProfile as any
          }
          initialMedia={
            media
          }
          hasPendingUpdate={
            Boolean(pending)
          }
        />
      </div>
    </main>
  )
}