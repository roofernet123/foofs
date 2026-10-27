'use client'

import Link from 'next/link'
import {
  AlertCircle,
  CheckCircle,
  Clock,
  Globe,
  MapPin,
  Phone,
  Shield,
  Wallet,
} from 'lucide-react'
import { getUsefulContractorDescription } from '@/lib/contractorContent'
import { RatingStars } from './RatingStars'

interface ContractorCardProps {
  contractor: any
  stateSlug: string
  citySlug?: string
  variant?: 'summary' | 'detailed'
}

export function ContractorCard({
  contractor,
  stateSlug,
  variant = 'summary',
}: ContractorCardProps) {
  const isSummary = variant === 'summary'

  const contractorName =
    contractor.businessName || contractor.name || 'Roofing Contractor'

  const usefulDescription = getUsefulContractorDescription(
    contractor.description
  )

  // Preserve the existing contractor profile URL structure.
  const contractorUrl = `/${stateSlug}/${contractor.slug}`

  const hasCoordinates =
    contractor.latitude !== null &&
    contractor.latitude !== undefined &&
    contractor.longitude !== null &&
    contractor.longitude !== undefined &&
    contractor.latitude !== '' &&
    contractor.longitude !== '' &&
    Number.isFinite(Number(contractor.latitude)) &&
    Number.isFinite(Number(contractor.longitude))

  const coordinates = hasCoordinates
    ? `${contractor.latitude},${contractor.longitude}`
    : null

  const mapsUrl = coordinates
    ? `https://www.google.com/maps?q=${encodeURIComponent(coordinates)}`
    : contractor.address
      ? `https://www.google.com/maps?q=${encodeURIComponent(
          contractor.address
        )}`
      : null

  const directionsUrl = coordinates
    ? `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
        coordinates
      )}`
    : mapsUrl

  const location = [
    typeof contractor.city === 'string'
      ? contractor.city
      : contractor.city?.name,
    contractor.stateAbbrev ||
      contractor.state_abbrev ||
      contractor.state?.abbreviation ||
      (typeof contractor.state === 'string' ? contractor.state : null),
  ]
    .filter(Boolean)
    .join(', ')

  const services: string[] = Array.isArray(contractor.servicesOffered)
    ? Array.from(
        new Set(
          contractor.servicesOffered
            .filter(
              (service: unknown): service is string =>
                typeof service === 'string' &&
                service.trim().length > 0
            )
            .map((service: string) => service.trim())
        )
      )
    : []

  const rating = Number(contractor.rating) || 0
  const reviewCount = Number(contractor.reviewCount) || 0
  const yearsInBusiness = Number(contractor.yearsInBusiness) || 0

  const websiteUrl =
    typeof contractor.website === 'string' &&
    contractor.website.trim()
      ? /^https?:\/\//i.test(contractor.website.trim())
        ? contractor.website.trim()
        : `https://${contractor.website.trim()}`
      : null

  const phone =
    typeof contractor.phone === 'string' && contractor.phone.trim()
      ? contractor.phone.trim()
      : null

  type Fact = { icon: typeof Clock; label: string; value: string }

  const facts = [
    yearsInBusiness > 0
      ? {
          icon: Clock,
          label: 'Experience',
          value: `${yearsInBusiness} ${
            yearsInBusiness === 1 ? 'year' : 'years'
          }`,
        }
      : null,
    contractor.freeEstimates
      ? {
          icon: CheckCircle,
          label: 'Estimates',
          value: 'Free quotes',
        }
      : null,
    contractor.warrantyOffered
      ? {
          icon: Shield,
          label: 'Warranty',
          value: 'Offered',
        }
      : null,
    contractor.financingAvailable
      ? {
          icon: Wallet,
          label: 'Payment',
          value: 'Financing',
        }
      : null,
  ].filter(Boolean) as Fact[]

  // Detailed profile: ONE fact grid. It adds the license and insurance record,
  // which used to live in separate "Business details" / "Business information" blocks.
  // Emergency service is shown once, as a badge next to the rating.
  const detailFacts: Fact[] = [
    ...facts,
    contractor.licenseNumber
      ? {
          icon: Shield,
          label: 'License no.',
          value: String(contractor.licenseNumber),
        }
      : null,
    contractor.insuranceVerified
      ? {
          icon: CheckCircle,
          label: 'Insurance',
          value: 'Marked verified',
        }
      : null,
  ].filter(Boolean) as Fact[]

  if (isSummary) {
    return (
      <article className="flex h-full flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md">
        <div className="flex-1 p-4 sm:p-5">
          {/* Identity, location and rating */}
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
              <Shield className="h-5 w-5" />
            </div>

            <div className="min-w-0 flex-1">
              <Link
                href={contractorUrl}
                className="group"
                aria-label={`View ${contractorName} roofing contractor profile`}
              >
                <h3 className="line-clamp-2 text-base font-bold leading-snug text-gray-900 group-hover:text-blue-700 sm:text-lg">
                  {contractorName}
                </h3>
              </Link>

              {(location || contractor.address) && (
                <p className="mt-1 flex items-start gap-1.5 text-xs leading-5 text-gray-500">
                  <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-blue-600" />
                  <span className="line-clamp-2">
                    {contractor.address || location}
                  </span>
                </p>
              )}

              {(rating > 0 || reviewCount > 0) && (
                <div className="mt-2 flex flex-wrap items-center gap-x-1.5 gap-y-1">
                  {rating > 0 && (
                    <>
                      <RatingStars rating={rating} />
                      <span className="text-sm font-bold text-gray-800">
                        {rating.toFixed(1)}
                      </span>
                    </>
                  )}

                  {reviewCount > 0 && (
                    <span className="text-xs text-gray-500">
                      {reviewCount.toLocaleString()} Google{' '}
                      {reviewCount === 1 ? 'review' : 'reviews'}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Trust and service indicators */}
          {(contractor.verified ||
            contractor.emergencyService ||
            contractor.insuranceVerified) && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {contractor.verified && (
                <span
                  className="inline-flex items-center gap-1 rounded-md bg-green-50 px-2 py-1 text-xs font-semibold text-green-800"
                  title="Verified contractor listing"
                >
                  <CheckCircle className="h-3.5 w-3.5" />
                  Verified listing
                </span>
              )}

              {contractor.emergencyService && (
                <span className="inline-flex items-center gap-1 rounded-md bg-orange-50 px-2 py-1 text-xs font-medium text-orange-800">
                  <AlertCircle className="h-3.5 w-3.5" />
                  Emergency service
                </span>
              )}

              {contractor.insuranceVerified && (
                <span className="inline-flex items-center gap-1 rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-800">
                  <Shield className="h-3.5 w-3.5" />
                  Insurance verified
                </span>
              )}
            </div>
          )}

          {/* Useful, concise business description */}
          {usefulDescription && (
            <p className="mt-3 line-clamp-3 text-sm leading-5 text-gray-600">
              {usefulDescription}
            </p>
          )}

          {/* Business facts in a compact grid */}
          {facts.length > 0 && (
            <div className="mt-3 grid grid-cols-2 gap-2">
              {facts.map(({ icon: Icon, label, value }) => (
                <div
                  key={label}
                  className="flex min-w-0 items-start gap-2 rounded-lg bg-gray-50 px-2.5 py-2"
                >
                  <Icon className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
                  <div className="min-w-0">
                    <p className="text-[11px] leading-4 text-gray-500">
                      {label}
                    </p>
                    <p className="break-words text-xs font-semibold text-gray-900">
                      {value}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Roofing services */}
          {services.length > 0 && (
            <div className="mt-3 border-t border-gray-100 pt-3">
              <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-gray-500">
                Roofing services
              </p>

              <div className="flex flex-wrap gap-1.5">
                {services.slice(0, 4).map((service) => (
                  <span
                    key={service}
                    className="max-w-full rounded-md border border-blue-100 bg-blue-50 px-2 py-1 text-xs font-medium text-blue-800"
                  >
                    {service}
                  </span>
                ))}

                {services.length > 4 && (
                  <span className="rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600">
                    +{services.length - 4} more
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Useful links, shown only when available */}
          {(websiteUrl || contractor.licenseNumber) && (
            <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-gray-100 pt-3 text-xs">
              {websiteUrl && (
                <a
                  href={websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex max-w-full items-center gap-1 font-medium text-blue-700 hover:text-blue-900"
                >
                  <Globe className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">Visit website</span>
                </a>
              )}

              {contractor.licenseNumber && (
                <span className="inline-flex items-center gap-1 text-gray-600">
                  <Shield className="h-3.5 w-3.5 shrink-0" />
                  License details available
                </span>
              )}
            </div>
          )}
        </div>

        {/* Consistent actions at the bottom */}
        <div className="flex items-center gap-2 border-t border-gray-100 bg-gray-50/70 p-3 sm:p-4">
          <Link
            href={contractorUrl}
            className="inline-flex min-h-10 flex-1 items-center justify-center rounded-lg bg-blue-700 px-3 py-2 text-sm font-semibold text-white transition hover:bg-blue-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
          >
            View full profile
          </Link>

          {mapsUrl && (
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-10 min-w-10 items-center justify-center rounded-lg border border-gray-300 bg-white px-3 text-gray-700 transition hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
              title="Open location in Google Maps"
              aria-label={`Open ${contractorName} in Google Maps`}
            >
              <MapPin className="h-4 w-4" />
            </a>
          )}

          {phone && (
            <a
              href={`tel:${phone}`}
              className="inline-flex min-h-10 min-w-10 items-center justify-center rounded-lg border border-green-200 bg-white px-3 text-green-700 transition hover:bg-green-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-600"
              title="Call contractor"
              aria-label={`Call ${contractorName}`}
            >
              <Phone className="h-4 w-4" />
            </a>
          )}
        </div>
      </article>
    )
  }

  // Detailed contractor profile.
  return (
    <article className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="p-5 sm:p-7">
        {/* Profile heading */}
        <div className="flex items-start gap-3">
          <div className="hidden h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700 sm:flex">
            <Shield className="h-7 w-7" />
          </div>

          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-bold leading-tight text-gray-900 sm:text-3xl">
              {contractorName}
            </h1>

            {(location || contractor.address) && (
              <p className="mt-2 flex items-start gap-2 text-sm text-gray-600">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
                <span>{contractor.address || location}</span>
              </p>
            )}

            {(rating > 0 ||
              reviewCount > 0 ||
              contractor.verified ||
              contractor.emergencyService) && (
              <div className="mt-3 flex flex-wrap items-center gap-2">
                {rating > 0 && (
                  <span className="inline-flex items-center gap-1.5 rounded-lg bg-amber-50 px-2.5 py-1.5">
                    <RatingStars rating={rating} />
                    <span className="text-sm font-bold text-gray-900">
                      {rating.toFixed(1)}
                    </span>
                  </span>
                )}

                {reviewCount > 0 && (
                  <span className="text-sm text-gray-500">
                    {reviewCount.toLocaleString()} Google{' '}
                    {reviewCount === 1 ? 'review' : 'reviews'}
                  </span>
                )}

                {contractor.verified && (
                  <span className="inline-flex items-center gap-1 rounded-md bg-green-50 px-2 py-1 text-xs font-semibold text-green-800">
                    <CheckCircle className="h-3.5 w-3.5" />
                    Verified listing
                  </span>
                )}

                {contractor.emergencyService && (
                  <span className="inline-flex items-center gap-1 rounded-md bg-orange-50 px-2 py-1 text-xs font-medium text-orange-800">
                    <AlertCircle className="h-3.5 w-3.5" />
                    Emergency service
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* About the business */}
        {usefulDescription && (
          <section className="mt-6 border-t border-gray-100 pt-5">
            <h2 className="mb-2 text-lg font-bold text-gray-900">
              About {contractorName}
            </h2>
            <p className="whitespace-pre-line text-sm leading-7 text-gray-700 sm:text-base">
              {usefulDescription}
            </p>
          </section>
        )}

        {/* Key facts: the single place for experience, estimates, warranty, financing, license, insurance */}
        {detailFacts.length > 0 && (
          <section className="mt-5">
            <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-gray-500">
              Key facts
            </h2>

            <div
              className={`grid grid-cols-2 gap-2 ${
                detailFacts.length > 4 ? 'sm:grid-cols-3' : 'sm:grid-cols-4'
              }`}
            >
              {detailFacts.map(({ icon: Icon, label, value }) => (
                <div
                  key={label}
                  className="rounded-lg border border-gray-200 p-3"
                >
                  <Icon className="mb-2 h-5 w-5 text-blue-700" />
                  <p className="text-xs text-gray-500">{label}</p>
                  <p className="mt-1 break-words text-sm font-semibold text-gray-900">
                    {value}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Services (the only place they are listed) */}
        {services.length > 0 && (
          <section className="mt-6 border-t border-gray-100 pt-5">
            <h2 className="mb-3 text-lg font-bold text-gray-900">
              Roofing services offered
            </h2>

            <div className="flex flex-wrap gap-2">
              {services.map((service) => (
                <span
                  key={service}
                  className="rounded-lg border border-blue-100 bg-blue-50 px-3 py-2 text-sm font-medium text-blue-800"
                >
                  {service}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* Contact actions (phone, website and hours also appear in the sidebar) */}
        <div className="mt-6 flex flex-wrap gap-3 border-t border-gray-100 pt-5">
          {phone && (
            <a
              href={`tel:${phone}`}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-green-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-green-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-600 focus-visible:ring-offset-2"
            >
              <Phone className="h-5 w-5" />
              Call contractor
            </a>
          )}

          {websiteUrl && (
            <a
              href={websiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-gray-100 px-5 py-3 text-sm font-semibold text-gray-800 transition hover:bg-gray-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2"
            >
              <Globe className="h-5 w-5" />
              Visit website
            </a>
          )}

          {directionsUrl && (
            <a
              href={directionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-blue-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
            >
              <MapPin className="h-5 w-5" />
              Get directions
            </a>
          )}
        </div>
      </div>
    </article>
  )
}