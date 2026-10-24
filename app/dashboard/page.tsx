// app/dashboard/page.tsx

import Link from 'next/link'

import {
  redirect,
} from 'next/navigation'

import {
  and,
  desc,
  eq,
  inArray,
  or,
} from 'drizzle-orm'

import {
  AlertCircle,
  Building,
  CheckCircle,
  Clock,
  ExternalLink,
  Mail,
  Settings,
  ShieldCheck,
  Star,
  XCircle,
} from 'lucide-react'

import {
  createClient,
} from '@/lib/supabase/server'

import {
  getDb,
} from '@/lib/db'

import {
  appReviews,
  businessClaims,
  contractors,
} from '@/lib/db/schema'

import {
  contractorMedia,
  contractorUsers,
} from '@/lib/db/ownerSchema'

import {
  calculateProfileCompleteness,
  contractorToEditableProfile,
} from '@/lib/contractorProfile'

import {
  DashboardLogoutButton,
} from '@/components/auth/DashboardLogoutButton'


export const dynamic =
  'force-dynamic'


export default async function DashboardPage() {
  const supabase =
    await createClient()

  const {
    data: { user },
  } =
    await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const db = getDb()

  const managedBusinesses =
    await db
      .select({
        id:
          contractors.id,

        name:
          contractors.name,

        slug:
          contractors.slug,

        stateSlug:
          contractors.stateSlug,

        city:
          contractors.city,

        state:
          contractors.state,

        ownershipVerified:
          contractors.ownershipVerified,

        description:
          contractors.description,

        address:
          contractors.address,

        zipCode:
          contractors.zipCode,

        phone:
          contractors.phone,

        email:
          contractors.email,

        website:
          contractors.website,

        licenseNumber:
          contractors.licenseNumber,

        yearsInBusiness:
          contractors.yearsInBusiness,

        servicesOffered:
          contractors.servicesOffered,

        serviceAreas:
          contractors.serviceAreas,

        emergencyService:
          contractors.emergencyService,

        freeEstimates:
          contractors.freeEstimates,

        financingAvailable:
          contractors.financingAvailable,

        warrantyOffered:
          contractors.warrantyOffered,

        openingHours:
          contractors.openingHours,

        priceRange:
          contractors.priceRange,

        pricingNotes:
          contractors.pricingNotes,

        minimumJobPrice:
          contractors.minimumJobPrice,

        priceCurrency:
          contractors.priceCurrency,

        ownerUpdatedAt:
          contractors.ownerUpdatedAt,

        role:
          contractorUsers.role,
      })
      .from(
        contractorUsers
      )
      .innerJoin(
        contractors,
        eq(
          contractorUsers.contractorId,
          contractors.id
        )
      )
      .where(
        and(
          eq(
            contractorUsers.userId,
            user.id
          ),
          eq(
            contractorUsers.status,
            'active'
          )
        )
      )

  const managedIds =
    managedBusinesses.map(
      (item) => item.id
    )

  const approvedMedia =
    managedIds.length
      ? await db
          .select({
            contractorId:
              contractorMedia.contractorId,
          })
          .from(
            contractorMedia
          )
          .where(
            and(
              inArray(
                contractorMedia.contractorId,
                managedIds
              ),
              eq(
                contractorMedia.status,
                'approved'
              )
            )
          )
      : []

  const mediaCounts =
    new Map<number, number>()

  for (
    const item of
      approvedMedia
  ) {
    mediaCounts.set(
      item.contractorId,
      (
        mediaCounts.get(
          item.contractorId
        ) || 0
      ) + 1
    )
  }

  const businesses =
    managedBusinesses.map(
      (business) => {
        const profile =
          contractorToEditableProfile(
            business
          )

        const completeness =
          calculateProfileCompleteness(
            profile,
            mediaCounts.get(
              business.id
            ) || 0
          )

        return {
          ...business,
          completeness,
        }
      }
    )

  const claims =
    await db
      .select({
        id:
          businessClaims.id,

        contractorId:
          businessClaims.contractorId,

        status:
          businessClaims.status,

        message:
          businessClaims.message,

        createdAt:
          businessClaims.createdAt,

        contractorName:
          contractors.name,
      })
      .from(
        businessClaims
      )
      .leftJoin(
        contractors,
        eq(
          businessClaims.contractorId,
          contractors.id
        )
      )
      .where(
        or(
          eq(
            businessClaims.userId,
            user.id
          ),
          eq(
            businessClaims.userEmail,
            user.email!
          )
        )
      )
      .orderBy(
        desc(
          businessClaims.createdAt
        )
      )

  const reviews =
    await db
      .select()
      .from(
        appReviews
      )
      .where(
        eq(
          appReviews.userEmail,
          user.email!
        )
      )
      .orderBy(
        desc(
          appReviews.createdAt
        )
      )


  function statusBadge(
    status: string
  ) {
    const badges: Record<
      string,
      {
        icon: any
        text: string
        className: string
      }
    > = {
      pending: {
        icon: Clock,
        text: 'Pending',
        className:
          'bg-yellow-100 text-yellow-700',
      },

      approved: {
        icon: CheckCircle,
        text: 'Approved',
        className:
          'bg-green-100 text-green-700',
      },

      rejected: {
        icon: XCircle,
        text: 'Rejected',
        className:
          'bg-red-100 text-red-700',
      },

      flagged: {
        icon: AlertCircle,
        text: 'Flagged',
        className:
          'bg-orange-100 text-orange-700',
      },
    }

    const badge =
      badges[status] ||
      badges.pending

    const Icon =
      badge.icon

    return (
      <span
        className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs ${badge.className}`}
      >
        <Icon className="h-3 w-3" />
        {badge.text}
      </span>
    )
  }


  return (
    <div className="container mx-auto max-w-5xl px-4 py-8">

      <div className="mb-8 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-4">

          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-2xl font-bold text-blue-600">
            {user.user_metadata
              ?.full_name?.[0] ||
              user.email?.[0]?.toUpperCase() ||
              'U'}
          </div>

          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {user.user_metadata
                ?.full_name ||
                'User'}
            </h1>

            <p className="flex items-center gap-2 text-gray-600">
              <Mail className="h-4 w-4" />
              {user.email}
            </p>
          </div>

          <div className="ml-auto">
            <DashboardLogoutButton />
          </div>
        </div>
      </div>


      <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
        <StatCard
          label="Managed Businesses"
          value={
            businesses.length
          }
        />

        <StatCard
          label="Claims"
          value={claims.length}
        />

        <StatCard
          label="Reviews"
          value={reviews.length}
        />
      </div>


      <section className="mb-10">
        <div className="mb-4 flex items-center justify-between">

          <h2 className="flex items-center gap-2 text-xl font-bold">
            <Settings className="h-5 w-5 text-blue-600" />
            My Businesses
          </h2>

          <Link
            href="/claim-business"
            className="text-sm text-blue-600 hover:underline"
          >
            Claim another business
          </Link>
        </div>

        {businesses.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-8 text-center">
            <Building className="mx-auto mb-3 h-10 w-10 text-gray-300" />

            <p className="font-medium text-gray-700">
              No managed businesses yet.
            </p>

            <p className="mt-1 text-sm text-gray-500">
              Once a business claim is
              approved, it appears here.
            </p>

            <Link
              href="/claim-business"
              className="mt-4 inline-block rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white"
            >
              Claim a business
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {businesses.map(
              (business) => (
                <article
                  key={business.id}
                  className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
                >
                  <div className="flex flex-col justify-between gap-4 sm:flex-row">

                    <div>
                      <div className="flex flex-wrap items-center gap-2">

                        <h3 className="text-lg font-semibold">
                          {business.name}
                        </h3>

                        {business.ownershipVerified && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-1 text-xs text-green-700">
                            <ShieldCheck className="h-3 w-3" />
                            Owner verified
                          </span>
                        )}
                      </div>

                      <p className="mt-1 text-sm text-gray-500">
                        {[
                          business.city,
                          business.state,
                        ]
                          .filter(Boolean)
                          .join(', ')}
                      </p>

                      <div className="mt-4">
                        <div className="mb-1 flex justify-between text-xs">
                          <span className="text-gray-500">
                            Profile completeness
                          </span>

                          <span className="font-semibold text-blue-600">
                            {
                              business
                                .completeness
                                .score
                            }
                            %
                          </span>
                        </div>

                        <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
                          <div
                            className="h-full bg-blue-600"
                            style={{
                              width:
                                `${business.completeness.score}%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>


                    <div className="flex items-center gap-2">

                      {business.stateSlug &&
                        business.slug && (
                        <Link
                          target="_blank"
                          href={`/${business.stateSlug}/${business.slug}`}
                          className="inline-flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-2 text-sm hover:bg-gray-50"
                        >
                          View
                          <ExternalLink className="h-4 w-4" />
                        </Link>
                      )}

                      <Link
                        href={`/dashboard/business/${business.id}`}
                        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                      >
                        Manage Business
                      </Link>
                    </div>
                  </div>
                </article>
              )
            )}
          </div>
        )}
      </section>


      <section className="mb-10">
        <h2 className="mb-4 flex items-center gap-2 text-xl font-bold">
          <Building className="h-5 w-5 text-blue-600" />
          Your Claims
        </h2>

        {claims.length === 0 ? (
          <p className="rounded-lg bg-gray-50 p-6 text-gray-500">
            You haven't submitted any
            claims yet.
          </p>
        ) : (
          <div className="space-y-3">
            {claims.map(
              (claim) => (
                <div
                  key={claim.id}
                  className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4"
                >
                  <div>
                    <p className="font-medium">
                      {claim.contractorName ||
                        `Business #${claim.contractorId}`}
                    </p>

                    <p className="text-xs text-gray-400">
                      Submitted{' '}
                      {new Date(
                        claim.createdAt
                      ).toLocaleDateString()}
                    </p>
                  </div>

                  {statusBadge(
                    claim.status ||
                      'pending'
                  )}
                </div>
              )
            )}
          </div>
        )}
      </section>


      <section>
        <h2 className="mb-4 flex items-center gap-2 text-xl font-bold">
          <Star className="h-5 w-5 text-yellow-400" />
          Your Reviews
        </h2>

        {reviews.length === 0 ? (
          <p className="rounded-lg bg-gray-50 p-6 text-gray-500">
            You haven't written any
            reviews yet.
          </p>
        ) : (
          <div className="space-y-3">
            {reviews.map(
              (review) => (
                <div
                  key={review.id}
                  className="rounded-lg border border-gray-200 bg-white p-4"
                >
                  <div className="flex items-center justify-between">

                    <div>
                      <p className="font-medium">
                        {review.title ||
                          'Review'}
                      </p>

                      <p className="text-sm text-gray-500">
                        {review.rating}/5
                      </p>
                    </div>

                    {statusBadge(
                      review.status ||
                        'pending'
                    )}
                  </div>
                </div>
              )
            )}
          </div>
        )}
      </section>
    </div>
  )
}


function StatCard({
  label,
  value,
}: {
  label: string
  value: number
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <p className="text-sm text-gray-500">
        {label}
      </p>

      <p className="mt-1 text-3xl font-bold text-gray-900">
        {value}
      </p>
    </div>
  )
}