// app/[state]/[slug]/page.tsx
import { generateMetadata as generateSeoMetadata } from '@/lib/seo'
import { getDb } from '@/lib/db'
import { contractors } from '@/lib/db/schema'
import { and, desc, eq, sql } from 'drizzle-orm'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { LocalRoofingWeather } from '@/components/directory/LocalRoofingWeather'
import {
  Award,
  CheckCircle2,
  Clock,
  ExternalLink,
  MapPin,
  Phone,
} from 'lucide-react'

import { ContractorCard } from '@/components/directory/ContractorCard'
import Map from '@/components/directory/Map'
import { RelatedContent } from '@/components/directory/RelatedContent'
import { ReviewList } from '@/components/reviews/ReviewList'
import { ReviewForm } from '@/components/reviews/ReviewForm'
import { ClaimBusinessButton } from '@/components/business/ClaimBusinessButton'
import AdvertiseCta from '@/components/business/AdvertiseCta'
import { ListingAccuracyPanel } from '@/components/directory/ListingAccuracyPanel'
import {
  getContractorMetaDescription,
  shouldIndexContractor,
} from '@/lib/contractorContent'

export const revalidate = 3600

// Must match the canonical host used in generateSeoMetadata.
const SITE_URL = 'https://www.roofernet.com'

interface ContractorPageProps {
  params: Promise<{
    state: string
    slug: string
  }>
}

interface OpeningHour {
  day: string
  hours: string
}

function humanizeSlug(value: string) {
  return value
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase())
}

function createSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function getStringArray(value: unknown): string[] {
  if (!value) return []

  if (Array.isArray(value)) {
    return value
      .filter((item): item is string => typeof item === 'string')
      .map((item) => item.trim())
      .filter(Boolean)
  }

  if (typeof value === 'string') {
    try {
      return getStringArray(JSON.parse(value))
    } catch {
      return value
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean)
    }
  }

  return []
}

function formatOpeningHours(value: unknown): OpeningHour[] {
  if (!value) return []

  let parsedValue: unknown = value

  if (typeof value === 'string') {
    try {
      parsedValue = JSON.parse(value)
    } catch {
      return value
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean)
        .map((line) => {
          const separatorIndex = line.indexOf(':')
          if (separatorIndex === -1) {
            return {
              day: '',
              hours: line,
            }
          }
          return {
            day: line.slice(0, separatorIndex).trim(),
            hours: line.slice(separatorIndex + 1).trim(),
          }
        })
    }
  }

  if (Array.isArray(parsedValue)) {
    return parsedValue
      .map((item): OpeningHour | null => {
        if (typeof item === 'string') {
          const separatorIndex = item.indexOf(':')

          return separatorIndex === -1
            ? { day: '', hours: item.trim() }
            : {
                day: item.slice(0, separatorIndex).trim(),
                hours: item.slice(separatorIndex + 1).trim(),
              }
        }

        if (!item || typeof item !== 'object') return null

        const record = item as Record<string, unknown>
        const day = String(record.day ?? record.Day ?? '').trim()
        const open = String(record.open ?? record.Open ?? '').trim()
        const close = String(record.close ?? record.Close ?? '').trim()
        const hours = String(record.hours ?? record.Hours ?? '').trim()

        if (!day && !open && !close && !hours) return null

        return {
          day,
          hours: hours || [open, close].filter(Boolean).join(' – '),
        }
      })
      .filter((item): item is OpeningHour => item !== null)
  }

  if (typeof parsedValue === 'object' && parsedValue !== null) {
    return Object.entries(parsedValue)
      .map(([day, value]): OpeningHour | null => {
        if (typeof value === 'string') {
          return {
            day: humanizeSlug(day),
            hours: value,
          }
        }

        if (!value || typeof value !== 'object') return null

        const record = value as Record<string, unknown>
        const open = String(record.open ?? record.Open ?? '').trim()
        const close = String(record.close ?? record.Close ?? '').trim()
        const hours = String(record.hours ?? record.Hours ?? '').trim()

        return {
          day: humanizeSlug(day),
          hours: hours || [open, close].filter(Boolean).join(' – '),
        }
      })
      .filter((item): item is OpeningHour => item !== null)
  }

  return []
}

function getSafeWebsiteUrl(value: string | null) {
  if (!value) return null

  try {
    const url = new URL(value)

    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
      return null
    }

    return url.toString()
  } catch {
    try {
      return new URL(`https://${value}`).toString()
    } catch {
      return null
    }
  }
}

function getDisplayDomain(value: string) {
  try {
    return new URL(value).hostname.replace(/^www\./, '')
  } catch {
    return value.replace(/^https?:\/\//, '').replace(/^www\./, '')
  }
}

export async function generateMetadata({
  params,
}: ContractorPageProps) {
  const { state, slug } = await params
  const db = getDb()

  const result = await db
    .select()
    .from(contractors)
    .where(
      and(
        eq(contractors.slug, slug),
        eq(contractors.stateSlug, state),
        eq(contractors.published, true)
      )
    )
    .limit(1)

  if (!result.length) {
    return {
      title: 'Contractor Not Found',
      robots: {
        index: false,
        follow: false,
      },
    }
  }

  const contractor = result[0]
  const fallbackStateName = humanizeSlug(state)

  const isIndexable = shouldIndexContractor({
    name: contractor.name,
    description: contractor.description,
    address: contractor.address,
    phone: contractor.phone,
    website: contractor.website,
    city: contractor.city,
    state: contractor.state,
    stateAbbrev: contractor.state_abbrev,
    latitude: contractor.latitude,
    longitude: contractor.longitude,
    openingHours:
      typeof contractor.openingHours === 'string'
        ? contractor.openingHours
        : contractor.openingHours
          ? JSON.stringify(contractor.openingHours)
          : null,
    servicesOffered: contractor.servicesOffered,
    rating: contractor.rating,
    reviewCount: contractor.reviewCount,
    verified: contractor.verified,
    licenseNumber: contractor.licenseNumber,
    insuranceVerified: contractor.insuranceVerified,
  })

  const metadata = generateSeoMetadata({
    title: `${contractor.name} – Roofing Contractor in ${
      contractor.city || contractor.state || fallbackStateName
    }`,
    description: getContractorMetaDescription({
      name: contractor.name,
      description: contractor.description,
      city: contractor.city,
      state: contractor.state,
      stateAbbrev: contractor.state_abbrev,
    }),
    keywords: [
      contractor.name,
      'roofing contractor',
      contractor.city
        ? `roofing contractor ${contractor.city}`
        : `roofing contractor ${contractor.state || fallbackStateName}`,
    ],
    canonical: `/${state}/${contractor.slug}`,
  })

  return {
    ...metadata,
    robots: {
      index: isIndexable,
      follow: true,
    },
  }
}

export default async function ContractorPage({
  params,
}: ContractorPageProps) {
  const { state, slug } = await params
  const db = getDb()

  const result = await db
    .select()
    .from(contractors)
    .where(
      and(
        eq(contractors.slug, slug),
        eq(contractors.stateSlug, state),
        eq(contractors.published, true)
      )
    )
    .limit(1)

  if (!result.length) notFound()

  const contractor = result[0]
  const stateName = contractor.state || humanizeSlug(state)
  const citySlug =
    contractor.citySlug ||
    (contractor.city ? createSlug(contractor.city) : '')

  const relatedConditions = [
    eq(contractors.published, true),
    eq(contractors.stateSlug, state),
    sql`${contractors.id} <> ${contractor.id}`,
  ]

  if (contractor.city) {
    relatedConditions.push(eq(contractors.city, contractor.city))
  }

  const relatedContractors = await db
    .select({
      id: contractors.id,
      name: contractors.name,
      slug: contractors.slug,
      city: contractors.city,
      state: contractors.state,
      rating: contractors.rating,
      reviewCount: contractors.reviewCount,
    })
    .from(contractors)
    .where(and(...relatedConditions))
    .orderBy(
      desc(contractors.featured),
      desc(contractors.reviewCount),
      desc(contractors.rating)
    )
    .limit(4)

  const nearbyCitiesResult = await db
    .select({
      city: contractors.city,
      citySlug: contractors.citySlug,
      count: sql<number>`COUNT(*)`.as('count'),
    })
    .from(contractors)
    .where(
      and(
        eq(contractors.published, true),
        eq(contractors.stateSlug, state),
        sql`${contractors.city} IS NOT NULL`,
        sql`BTRIM(${contractors.city}) <> ''`,
        contractor.city
          ? sql`${contractors.city} <> ${contractor.city}`
          : sql`TRUE`
      )
    )
    .groupBy(contractors.city, contractors.citySlug)
    .orderBy(desc(sql<number>`COUNT(*)`))
    .limit(6)

  const nearbyCities = nearbyCitiesResult
    .filter((row: { city: string | null }) => row.city)
    .map((row: { city: string | null; citySlug: string | null; count: unknown }) => ({
      city: row.city || '',
      citySlug: row.citySlug || createSlug(row.city || ''),
      count: Number(row.count) || 0,
    }))

  const openingHours = formatOpeningHours(contractor.openingHours)
  const serviceAreas = getStringArray(contractor.serviceAreas)
  const websiteUrl = getSafeWebsiteUrl(contractor.website)

  const latitude =
    contractor.latitude !== null && contractor.latitude !== undefined
      ? Number(contractor.latitude)
      : null

  const longitude =
    contractor.longitude !== null && contractor.longitude !== undefined
      ? Number(contractor.longitude)
      : null

  const hasCoordinates =
    latitude !== null &&
    longitude !== null &&
    Number.isFinite(latitude) &&
    Number.isFinite(longitude)

  const locationText = [
    contractor.city,
    contractor.state_abbrev || contractor.state,
  ]
    .filter(Boolean)
    .join(', ')

  // Note: no aggregateRating here on purpose. The rating comes from a public
  // listing source (Google), not from reviews collected on this site, and
  // Google's structured-data guidelines don't allow marking that up as your own.
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'RoofingContractor',
    '@id': `${SITE_URL}/${state}/${contractor.slug}#business`,
    name: contractor.name,
    url: `${SITE_URL}/${state}/${contractor.slug}`,
    ...(contractor.description
      ? { description: contractor.description }
      : {}),
    ...(contractor.phone
      ? { telephone: contractor.phone }
      : {}),
    ...(websiteUrl
      ? { sameAs: [websiteUrl] }
      : {}),
    ...(contractor.address ||
    contractor.city ||
    contractor.state ||
    contractor.zipCode
      ? {
          address: {
            '@type': 'PostalAddress',
            ...(contractor.address
              ? { streetAddress: contractor.address }
              : {}),
            ...(contractor.city
              ? { addressLocality: contractor.city }
              : {}),
            ...(contractor.state_abbrev || contractor.state
              ? {
                  addressRegion:
                    contractor.state_abbrev || contractor.state,
                }
              : {}),
            ...(contractor.zipCode
              ? { postalCode: contractor.zipCode }
              : {}),
            addressCountry: 'US',
          },
        }
      : {}),
    ...(hasCoordinates
      ? {
          geo: {
            '@type': 'GeoCoordinates',
            latitude,
            longitude,
          },
        }
      : {}),
  }

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData).replace(/</g, '\\u003c'),
        }}
      />

      <nav
        aria-label="Breadcrumb"
        className="mb-8 text-sm text-gray-600"
      >
        <Link href="/" className="hover:text-blue-600">
          Home
        </Link>
        <span className="mx-2">/</span>

        <Link href={`/${state}`} className="hover:text-blue-600">
          {stateName}
        </Link>

        {contractor.city && citySlug && (
          <>
            <span className="mx-2">/</span>
            <Link
              href={`/${state}?city=${citySlug}`}
              className="hover:text-blue-600"
            >
              {contractor.city}
            </Link>
          </>
        )}

        <span className="mx-2">/</span>
        <span className="text-gray-800">{contractor.name}</span>
      </nav>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <main className="lg:col-span-2">
          {/* Hero, about, key facts, services and contact actions: each shown once */}
          <ContractorCard
            contractor={{
              ...contractor,
              city: contractor.city || '',
              state: stateName,
            }}
            stateSlug={state}
            citySlug={citySlug}
            variant="detailed"
          />

          {/* Last-updated date, correction link and "how listings work" link */}
          <ListingAccuracyPanel
            contractorName={contractor.name}
            updatedAt={contractor.updatedAt}
            verified={contractor.verified}
          />

          {serviceAreas.length > 0 && (
            <section className="mt-6 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="mb-3 text-xl font-bold text-gray-900">
                Areas served
              </h2>

              <div className="flex flex-wrap gap-2">
                {serviceAreas.map((area) => (
                  <span
                    key={area}
                    className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700"
                  >
                    {area}
                  </span>
                ))}
              </div>
            </section>
          )}

          <LocalRoofingWeather
            city={contractor.city || ''}
            state={stateName}
            latitude={hasCoordinates ? latitude : null}
            longitude={hasCoordinates ? longitude : null}
          />

          <section className="mt-6 rounded-lg border border-blue-100 bg-blue-50 p-6">
            <h2 className="mb-4 text-xl font-bold text-gray-900">
              Before contacting {contractor.name}
            </h2>

            <p className="mb-4 text-sm leading-relaxed text-gray-700">
              RooferNet provides directory information rather than roofing
              services. Before hiring any contractor, confirm the details that
              matter for your project directly with the business.
            </p>

            <ul className="space-y-3 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-600" />
                <span>
                  Ask for a written estimate describing labor, materials,
                  cleanup, timing, and payment terms.
                </span>
              </li>

              <li className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-600" />
                <span>
                  Verify licensing, insurance, permits, and warranty coverage
                  where applicable.
                </span>
              </li>

              <li className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-600" />
                <span>
                  Confirm that the business serves {locationText || 'your area'}{' '}
                  and handles your type of roofing project.
                </span>
              </li>

              <li className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-600" />
                <span>
                  Compare more than one estimate and avoid relying only on
                  ratings or directory placement.
                </span>
              </li>
            </ul>
          </section>

          <section className="mt-6">
            <ReviewList contractorId={contractor.id} />

            <ReviewForm
              contractorId={contractor.id}
              className="mt-6"
            />
          </section>

          <RelatedContent
            city={contractor.city || ''}
            state={stateName}
            service="Roofing Contractors"
            relatedContractors={relatedContractors}
            nearbyCities={nearbyCities}
          />
        </main>

        <aside className="space-y-6">
          {/* Keep the paid-placement disclosure: it used to live inside the rating box */}
          {contractor.featured && (
            <section className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
              <p className="flex items-center gap-2 text-sm font-medium text-yellow-800">
                <Award className="h-4 w-4" />
                Paid featured placement
              </p>
            </section>
          )}

          <AdvertiseCta />

          {(contractor.phone || websiteUrl || openingHours.length > 0) && (
            <section className="rounded-lg bg-white p-6 shadow">
              <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
                <Phone className="h-5 w-5 text-blue-500" />
                {openingHours.length > 0 ? 'Contact and hours' : 'Contact'}
              </h2>

              {(contractor.phone || websiteUrl) && (
                <div className="space-y-3">
                  {contractor.phone && (
                    <a
                      href={`tel:${contractor.phone}`}
                      className="flex items-center gap-3 rounded-lg p-3 text-gray-700 transition hover:bg-blue-50 hover:text-blue-600"
                    >
                      <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-blue-100">
                        <Phone className="h-4 w-4 text-blue-600" />
                      </span>

                      <span className="font-medium">
                        {contractor.phone}
                      </span>
                    </a>
                  )}

                  {websiteUrl && (
                    <a
                      href={websiteUrl}
                      target="_blank"
                      rel="noopener noreferrer nofollow"
                      className="flex items-center gap-3 rounded-lg p-3 text-gray-700 transition hover:bg-purple-50 hover:text-blue-600"
                    >
                      <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-purple-100">
                        <ExternalLink className="h-4 w-4 text-purple-600" />
                      </span>

                      <span className="min-w-0 flex-1 truncate font-medium">
                        {getDisplayDomain(websiteUrl)}
                      </span>
                    </a>
                  )}
                </div>
              )}

              {openingHours.length > 0 && (
                <div
                  className={
                    contractor.phone || websiteUrl
                      ? 'mt-5 border-t border-gray-100 pt-4'
                      : ''
                  }
                >
                  <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-700">
                    <Clock className="h-4 w-4 text-blue-500" />
                    Business hours
                  </h3>

                  <div className="space-y-1 text-sm">
                    {openingHours.slice(0, 7).map((item, index) => (
                      <div
                        key={`${item.day}-${index}`}
                        className="flex justify-between gap-4 border-b border-gray-50 py-1 last:border-0"
                      >
                        <span className="text-gray-600">
                          {item.day || 'Hours'}
                        </span>
                        <span className="text-right font-medium text-gray-800">
                          {item.hours || 'Not provided'}
                        </span>
                      </div>
                    ))}
                  </div>

                  <p className="mt-3 text-xs text-gray-500">
                    Confirm hours before visiting.
                  </p>
                </div>
              )}
            </section>
          )}

          {(contractor.address || hasCoordinates) && (
            <section className="rounded-lg bg-white p-4 shadow">
              <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold">
                <MapPin className="h-5 w-5 text-blue-500" />
                Listed location
              </h2>

              <Map
                businessName={contractor.name}
                address={contractor.address || undefined}
                city={contractor.city || ''}
                state={stateName}
                latitude={hasCoordinates ? latitude : undefined}
                longitude={hasCoordinates ? longitude : undefined}
              />
            </section>
          )}

          <ClaimBusinessButton
            contractorId={contractor.id}
            contractorName={contractor.name}
            variant="button"
          />
        </aside>
      </div>
    </div>
  )
}