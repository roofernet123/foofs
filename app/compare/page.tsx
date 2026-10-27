// app/compare/page.tsx

'use client'

import { Suspense, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  ExternalLink,
  GitCompareArrows,
  MapPin,
  Phone,
  ShieldCheck,
  Star,
  Trash2,
} from 'lucide-react'

const STORAGE_KEY = 'roofernet-compare-ids'
const MAX_COMPARE = 3

interface Contractor {
  id: number
  name: string
  slug: string
  stateSlug: string | null
  description: string | null
  address: string | null
  city: string | null
  state: string | null
  stateAbbrev: string | null
  zipCode: string | null
  phone: string | null
  email: string | null
  website: string | null
  rating: string | number | null
  reviewCount: number | null
  licenseNumber: string | null
  insuranceVerified: boolean | null
  yearsInBusiness: number | null
  servicesOffered: string[] | null
  serviceAreas: string[] | null
  emergencyService: boolean | null
  freeEstimates: boolean | null
  financingAvailable: boolean | null
  warrantyOffered: boolean | null
  verified: boolean | null
  ownershipVerified: boolean | null
  openingHours: string | null
  priceRange: string | null
  pricingNotes: string | null
  minimumJobPrice: string | number | null
  priceCurrency: string | null
  ownerUpdatedAt: string | null
  updatedAt: string | null
}

function parseIds(value: string | null): number[] {
  if (!value) return []

  return [
    ...new Set(
      value
        .split(',')
        .map((part) => part.trim())
        .filter((part) => /^\d+$/.test(part))
        .map(Number)
        .filter((id) => Number.isSafeInteger(id) && id > 0)
    ),
  ].slice(0, MAX_COMPARE)
}

function readStoredIds(): number[] {
  try {
    const value = localStorage.getItem(STORAGE_KEY)
    const parsed: unknown = value ? JSON.parse(value) : []

    if (!Array.isArray(parsed)) return []

    return [
      ...new Set(
        parsed.filter(
          (id): id is number =>
            typeof id === 'number' &&
            Number.isSafeInteger(id) &&
            id > 0
        )
      ),
    ].slice(0, MAX_COMPARE)
  } catch {
    return []
  }
}

function cleanText(value: unknown): string | null {
  if (typeof value !== 'string') return null
  const cleaned = value.trim()
  return cleaned.length ? cleaned : null
}

function displayBoolean(value: boolean | null | undefined): string {
  // The database uses false defaults for these fields. False may mean
  // "not recorded", rather than a verified absence of the service.
  return value === true ? 'Yes / listed' : 'Not confirmed'
}

function displayDate(value: string | null | undefined): string {
  if (!value) return 'Not provided'

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Not provided'

  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function displayPrice(contractor: Contractor): string {
  const minimum = contractor.minimumJobPrice
  const currency = contractor.priceCurrency || 'USD'

  if (minimum !== null && minimum !== undefined && minimum !== '') {
    const amount = Number(minimum)

    if (Number.isFinite(amount)) {
      try {
        return `Minimum listed price: ${new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency,
          maximumFractionDigits: 2,
        }).format(amount)}`
      } catch {
        return `Minimum listed price: ${amount} ${currency}`
      }
    }
  }

  if (contractor.priceRange?.trim()) {
    return contractor.priceRange.trim()
  }

  return 'Contact contractor for pricing'
}

function servicesList(value: string[] | null | undefined): string {
  if (!Array.isArray(value)) return 'Not provided'

  const cleaned = value
    .filter((item): item is string => typeof item === 'string')
    .map((item) => item.trim())
    .filter(Boolean)

  return cleaned.length ? cleaned.join(', ') : 'Not provided'
}

function Row({
  label,
  values,
}: {
  label: string
  values: string[]
}) {
  return (
    <tr className="border-b border-gray-100 align-top last:border-0">
      <th
        scope="row"
        className="w-44 min-w-40 bg-gray-50 px-4 py-3 text-left text-sm font-semibold text-gray-700 sm:w-56"
      >
        {label}
      </th>

      {values.map((value, index) => (
        <td
          key={`${label}-${index}`}
          className="min-w-48 px-4 py-3 text-sm leading-6 text-gray-700"
        >
          {value}
        </td>
      ))}
    </tr>
  )
}

function CompareContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const idsParam = searchParams.get('ids')

  const [ids, setIds] = useState<number[]>([])
  const [contractors, setContractors] = useState<Contractor[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [retryCount, setRetryCount] = useState(0)

  useEffect(() => {
    const urlIds = parseIds(idsParam)

    if (urlIds.length > 0) {
      setIds(urlIds)

      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(urlIds))
      } catch {
        // URL-based comparison still works if browser storage is unavailable.
      }

      return
    }

    const storedIds = readStoredIds()
    setIds(storedIds)

    if (storedIds.length > 0) {
      router.replace(`/compare?ids=${storedIds.join(',')}`)
    } else {
      setLoading(false)
      setContractors([])
    }
  }, [idsParam, router])

  useEffect(() => {
    let cancelled = false

    async function loadContractors() {
      if (ids.length === 0) {
        setContractors([])
        setLoading(false)
        setError('')
        return
      }

      setLoading(true)
      setError('')

      try {
        const response = await fetch(
          `/api/compare?ids=${ids.join(',')}`,
          { cache: 'no-store' }
        )

        const data = await response.json()

        if (!response.ok) {
          throw new Error(
            data?.error || 'Unable to load the comparison.'
          )
        }

        if (!cancelled) {
          const results: Contractor[] = Array.isArray(data.contractors)
            ? data.contractors
            : []

          setContractors(results)

          // Drop removed, unpublished or otherwise unavailable IDs.
          const validIds = results.map((item) => item.id)
          setIds(validIds)

          try {
            localStorage.setItem(
              STORAGE_KEY,
              JSON.stringify(validIds)
            )
          } catch {
            // The comparison itself remains usable.
          }

          if (validIds.length !== ids.length) {
            router.replace(
              validIds.length
                ? `/compare?ids=${validIds.join(',')}`
                : '/compare'
            )
          }
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : 'Unable to load the comparison.'
          )
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void loadContractors()

    return () => {
      cancelled = true
    }
  }, [ids.join(','), retryCount, router])

  function removeContractor(id: number) {
    const nextIds = ids.filter((item) => item !== id)

    setIds(nextIds)
    setContractors((current) =>
      current.filter((item) => item.id !== id)
    )

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(nextIds))
    } catch {
      // URL is the fallback source of truth.
    }

    router.push(
      nextIds.length ? `/compare?ids=${nextIds.join(',')}` : '/compare'
    )
  }

  function clearComparison() {
    setIds([])
    setContractors([])

    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch {
      // Clearing the URL still clears this view.
    }

    router.push('/compare')
  }

  const rows: {
    label: string
    getValue: (contractor: Contractor) => string
  }[] = [
    {
      label: 'Location',
      getValue: (c) =>
        [
          c.address,
          [c.city, c.stateAbbrev || c.state, c.zipCode]
            .filter(Boolean)
            .join(', '),
        ]
          .filter(Boolean)
          .join(' · ') || 'Not provided',
    },
    {
      label: 'Rating',
      getValue: (c) => {
        const rating = Number(c.rating)
        if (!Number.isFinite(rating) || rating <= 0) {
          return 'No rating provided'
        }

        const reviews = Number(c.reviewCount) || 0

        return `${rating.toFixed(1)} / 5 (${reviews.toLocaleString()} ${
          reviews === 1 ? 'review' : 'reviews'
        })`
      },
    },
    {
      label: 'Years in business',
      getValue: (c) =>
        c.yearsInBusiness && c.yearsInBusiness > 0
          ? `${c.yearsInBusiness} ${
              c.yearsInBusiness === 1 ? 'year' : 'years'
            }`
          : 'Not provided',
    },
    {
      label: 'RooferNet listing verification',
      getValue: (c) => displayBoolean(c.verified),
    },
    {
      label: 'Ownership verification',
      getValue: (c) => displayBoolean(c.ownershipVerified),
    },
    {
      label: 'Insurance verification',
      getValue: (c) => displayBoolean(c.insuranceVerified),
    },
    {
      label: 'License number',
      getValue: (c) => cleanText(c.licenseNumber) || 'Not provided',
    },
    {
      label: 'Services',
      getValue: (c) => servicesList(c.servicesOffered),
    },
    {
      label: 'Service areas',
      getValue: (c) => servicesList(c.serviceAreas),
    },
    {
      label: 'Emergency service',
      getValue: (c) => displayBoolean(c.emergencyService),
    },
    {
      label: 'Free estimates',
      getValue: (c) => displayBoolean(c.freeEstimates),
    },
    {
      label: 'Financing',
      getValue: (c) => displayBoolean(c.financingAvailable),
    },
    {
      label: 'Warranty offered',
      getValue: (c) => displayBoolean(c.warrantyOffered),
    },
    {
      label: 'Pricing information',
      getValue: displayPrice,
    },
    {
      label: 'Pricing notes',
      getValue: (c) => cleanText(c.pricingNotes) || 'Not provided',
    },
    {
      label: 'Opening hours',
      getValue: (c) => cleanText(c.openingHours) || 'Not provided',
    },
    {
      label: 'Last owner update',
      getValue: (c) => displayDate(c.ownerUpdatedAt),
    },
    {
      label: 'Listing updated',
      getValue: (c) => displayDate(c.updatedAt),
    },
    {
        label: 'Phone',
        getValue: (c) => cleanText(c.phone) || 'Not provided',
        },
        {
        label: 'Email',
        getValue: (c) => cleanText(c.email) || 'Not provided',
        },
        {
        label: 'Website',
        getValue: (c) => cleanText(c.website) || 'Not provided',
        },
  ]

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <Link
          href="/search"
          className="inline-flex items-center gap-2 text-sm font-medium text-blue-700 hover:text-blue-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Find contractors
        </Link>
      </div>

      <header className="mb-8">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1.5 text-sm font-semibold text-blue-800">
          <GitCompareArrows className="h-4 w-4" />
          RooferNet comparison tool
        </div>

        <h1 className="text-3xl font-bold tracking-tight text-gray-950 sm:text-4xl">
          Compare roofing contractors
        </h1>

        <p className="mt-3 max-w-3xl text-base leading-7 text-gray-600">
          Compare the available information side by side before contacting
          contractors. Ratings, verification details, services and pricing
          disclosures can help you decide which businesses to contact for
          quotes.
        </p>
      </header>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gray-200 bg-white p-4">
        <p className="text-sm text-gray-600">
          <strong className="text-gray-900">
            {contractors.length} of {MAX_COMPARE}
          </strong>{' '}
          contractors selected
        </p>

        <div className="flex flex-wrap gap-2">
          <Link
            href="/search"
            className="inline-flex min-h-10 items-center justify-center rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800"
          >
            Add contractors
          </Link>

          {contractors.length > 0 && (
            <button
              type="button"
              onClick={clearComparison}
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              <Trash2 className="h-4 w-4" />
              Clear all
            </button>
          )}
        </div>
      </div>

      {loading && (
        <div className="rounded-xl border border-gray-200 bg-white p-8 text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-700" />
          <p className="mt-3 text-sm text-gray-600">
            Loading contractor comparisons…
          </p>
        </div>
      )}

      {!loading && error && (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 p-5 text-red-800"
        >
          <p className="font-semibold">Unable to load comparison</p>
          <p className="mt-1 text-sm">{error}</p>
          <button
            type="button"
            onClick={() => setRetryCount((count) => count + 1)}
            className="mt-3 rounded-lg border border-red-300 px-3 py-2 text-sm font-semibold hover:bg-red-100"
          >
            Try again
          </button>
        </div>
      )}

      {!loading && !error && contractors.length === 0 && (
        <section className="rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-12 text-center">
          <GitCompareArrows className="mx-auto h-12 w-12 text-gray-400" />

          <h2 className="mt-4 text-xl font-bold text-gray-900">
            Start your comparison
          </h2>

          <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-gray-600">
            Browse the directory and select up to three roofing contractors.
            Their available information will appear here side by side.
          </p>

          <Link
            href="/search"
            className="mt-5 inline-flex min-h-11 items-center justify-center rounded-lg bg-blue-700 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-800"
          >
            Browse contractors
          </Link>
        </section>
      )}

      {!loading && !error && contractors.length > 0 && (
        <>
          <div className="mb-4 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
            <p>
              <strong>How to read this comparison:</strong> “Not confirmed”
              means the directory does not confirm that feature; it does not
              necessarily mean the contractor lacks it. Ask contractors to
              confirm licensing, insurance, warranties and the terms of any
              estimate directly. Ratings and review counts are not guarantees
              of workmanship.
            </p>
          </div>

          <div className="w-full overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
  <table className="w-full table-fixed border-collapse text-left">
    <colgroup>
      <col className="w-[22%] sm:w-[19%] lg:w-[16%]" />
      {contractors.map((contractor) => (
        <col key={contractor.id} />
      ))}
    </colgroup>

    <thead>
      <tr className="border-b border-gray-200">
        <th className="bg-gray-50 px-2 py-3 text-xs font-semibold text-gray-700 sm:px-3 sm:text-sm">
          Compare
        </th>

        {contractors.map((contractor) => (
          <th
            key={contractor.id}
            className="min-w-0 border-l border-gray-100 px-2 py-3 align-top sm:px-3 sm:py-4"
          >
            <div className="flex h-full min-w-0 flex-col">
              <h2 className="break-words text-sm font-bold leading-5 text-gray-950 sm:text-base">
                {contractor.name}
              </h2>

              <p className="mt-1 break-words text-xs font-normal leading-4 text-gray-500">
                {[
                  contractor.city,
                  contractor.stateAbbrev || contractor.state,
                ]
                  .filter(Boolean)
                  .join(', ') || 'Location not provided'}
              </p>

              <div className="mt-3 flex flex-col gap-2">
                <Link
                  href={
                    contractor.stateSlug
                      ? `/${contractor.stateSlug}/${contractor.slug}`
                      : '/search'
                  }
                  className="inline-flex min-h-9 items-center justify-center rounded-md bg-blue-700 px-2 py-2 text-center text-xs font-semibold text-white hover:bg-blue-800 sm:text-sm"
                >
                  View profile
                </Link>

                {contractor.phone && (
                  <a
                    href={`tel:${contractor.phone}`}
                    className="inline-flex min-h-9 items-center justify-center rounded-md border border-gray-300 px-2 py-2 text-center text-xs font-semibold text-gray-700 hover:bg-gray-50 sm:text-sm"
                  >
                    Call
                  </a>
                )}

                <button
                  type="button"
                  onClick={() => removeContractor(contractor.id)}
                  className="inline-flex min-h-9 items-center justify-center rounded-md px-1 py-2 text-xs font-medium text-gray-500 hover:bg-red-50 hover:text-red-700"
                >
                  Remove
                </button>
              </div>
            </div>
          </th>
        ))}
      </tr>
    </thead>

    <tbody>
      {rows.map((row) => (
        <tr
          key={row.label}
          className="border-b border-gray-100 align-top last:border-0"
        >
          <th
            scope="row"
            className="break-words bg-gray-50 px-2 py-3 text-xs font-semibold leading-5 text-gray-700 sm:px-3 sm:text-sm"
          >
            {row.label}
          </th>

          {contractors.map((contractor) => (
            <td
              key={`${row.label}-${contractor.id}`}
              className="min-w-0 break-words border-l border-gray-100 px-2 py-3 text-xs leading-5 text-gray-700 [overflow-wrap:anywhere] sm:px-3 sm:text-sm"
            >
              {row.getValue(contractor)}
            </td>
          ))}
        </tr>
      ))}
    </tbody>
  </table>
</div>

          <section className="mt-6 rounded-xl border border-gray-200 bg-white p-5">
            <h2 className="text-lg font-bold text-gray-900">
              Before choosing a contractor
            </h2>

            <ul className="mt-3 space-y-2 text-sm leading-6 text-gray-600">
              <li className="flex gap-2">
                <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-blue-700" />
                Request written estimates for the same scope of work.
              </li>
              <li className="flex gap-2">
                <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-blue-700" />
                Check license requirements with the relevant state or local authority.
              </li>
              <li className="flex gap-2">
                <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-blue-700" />
                Ask for proof of insurance and written warranty terms.
              </li>
              <li className="flex gap-2">
                <ShieldCheck className="mt-1 h-4 w-4 shrink-0 text-blue-700" />
                Compare ratings alongside review counts, experience and the
                details you can independently verify.
              </li>
            </ul>
          </section>
        </>
      )}
    </main>
  )
}

export default function ComparePage() {
  return (
    <Suspense
      fallback={
        <main className="mx-auto max-w-7xl px-4 py-12 text-center text-sm text-gray-600">
          Loading comparison tool…
        </main>
      }
    >
      <CompareContent />
    </Suspense>
  )
}