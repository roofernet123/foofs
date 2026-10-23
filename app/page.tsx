// app/page.tsx
import Link from 'next/link'
import Image from 'next/image'
import {
  ArrowRight,
  BookOpen,
  Building,
  MapPin,
  Search,
  Star,
} from 'lucide-react'
import { eq, sql } from 'drizzle-orm'

import { generateMetadata } from '@/lib/seo'
import { getDb } from '@/lib/db'
import { contractors } from '@/lib/db/schema'
import { serviceGuides } from '@/lib/serviceGuides'
import { MAX_FEATURED_NATIONAL } from '@/lib/queries/getFeaturedContractors'
import { FeaturedContractors } from '@/components/directory/FeaturedContractors'
import { DirectoryDisclosure } from '@/components/directory/DirectoryDisclosure'
import { FAQSchema } from '@/components/seo/FAQSchema'
import AdvertiseCta from '@/components/business/AdvertiseCta'

export const metadata = generateMetadata({
  title: 'Browse Roofing Contractors Near You',

  description:
    'Browse roofing contractors by state and location. Compare available ratings, contact details and business information.',

  keywords: [
    'roofing contractors',
    'roofing directory',
    'roof repair',
    'roof inspection',
    'roof replacement',
  ],
  canonical: '/',
})

const faqs = [
  {
    question:
      'What information is available in the RooferNet directory?',
    answer:
      'Listings may include a business address, telephone number, website, opening hours, rating information and other available business details. Information varies by listing and can change over time.',
  },
  {
    question:
      'How should I compare roofing contractors?',
    answer:
      'Compare available ratings and business information, then contact more than one contractor. Confirm licensing, insurance, experience, project scope, materials, warranties and payment terms before signing an agreement.',
  },
  {
    question:
      'Does RooferNet verify every contractor and service?',
    answer:
      'No. Unless a listing specifically displays a verified label, visitors should not assume that RooferNet has independently verified its credentials or service specializations. Important details should be confirmed directly.',
  },
  {
    question:
      'What does a featured contractor placement mean?',
    answer:
      'Featured placement is promotional visibility that may be purchased by or for a business. It is advertising and should not be interpreted as an endorsement or guarantee of workmanship.',
  },
]

const serviceIcons: Record<string, string> = {
  'emergency-roof-repair': '🚨',
  'roof-inspection': '🔍',
  'roof-leak-repair': '🔧',
  'roof-maintenance': '🛠️',
  'roof-replacement': '🏗️',
}

interface StateSummary {
  name: string
  slug: string
  abbreviation: string | null
  contractorCount: number
}

interface HomeContentProps {
  stateList: StateSummary[]
  totalContractors: number
  totalStates: number
  totalLocations: number
}

function HomeContent({
  stateList,
  totalContractors,
  totalStates,
  totalLocations,
}: HomeContentProps) {
  const serviceEntries = Object.entries(serviceGuides)

  return (
    <>
      <FAQSchema faqs={faqs} />
      
      <section className="relative flex min-h-[600px] items-center overflow-hidden">
        <div className="container relative z-10 mx-auto px-4">
          <div className="max-w-4xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm">
              <Building className="h-4 w-4" />
              United States roofing contractor directory
            </div>

            <h1 className="text-4xl font-bold text-white md:text-5xl lg:text-6xl">
              Browse Roofing Contractors Near You
            </h1>

            <p className="mt-6 max-w-3xl text-xl leading-relaxed text-blue-100 md:text-2xl">
              Explore contractor listings by state and location.
              Compare available ratings, contact details and business
              information before contacting a provider.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/states"
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700"
              >
                <MapPin className="h-5 w-5" />
                Browse by state
              </Link>

              <Link
                href="/search"
                className="inline-flex items-center gap-2 rounded-lg border border-white/40 bg-white/10 px-6 py-3 font-semibold text-white backdrop-blur-sm transition hover:bg-white/20"
              >
                <Search className="h-5 w-5" />
                Search listings
              </Link>

              <Link
                href="/services"
                className="inline-flex items-center gap-2 rounded-lg border border-white/40 bg-white/10 px-6 py-3 font-semibold text-white backdrop-blur-sm transition hover:bg-white/20"
              >
                <BookOpen className="h-5 w-5" />
                Roofing guides
              </Link>
            </div>
          </div>
        </div>

        <div className="absolute inset-0 z-0">
          <Image
            src="/hero.webp"
            alt="Roofing contractor working on a residential roof"
            fill
            className="object-cover"
            priority
            sizes="100vw"
            quality={80}
          />

          <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/65 to-black/40" />

          <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-white to-transparent" />
        </div>
      </section>

      <section
        aria-label="Directory statistics"
        className="bg-gray-50 py-12"
      >
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 gap-8 text-center sm:grid-cols-3">
            <div>
              <div className="text-3xl font-bold text-blue-600">
                {totalContractors.toLocaleString('en-US')}
              </div>

              <div className="mt-1 text-gray-600">
                Published Listings
              </div>
            </div>

            <div>
              <div className="text-3xl font-bold text-blue-600">
                {totalStates.toLocaleString('en-US')}
              </div>

              <div className="mt-1 text-gray-600">
                States Represented
              </div>
            </div>

            <div>
              <div className="text-3xl font-bold text-blue-600">
                {totalLocations.toLocaleString('en-US')}
              </div>

              <div className="mt-1 text-gray-600">
                Locations Represented
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold text-gray-900">
              A More Transparent Way to Browse
            </h2>

            <p className="mt-5 leading-relaxed text-gray-600">
              RooferNet organizes roofing contractor information by
              state and location. Instead of assuming that every
              business provides the same services, use the available
              listing details as a starting point and confirm project
              requirements directly with each contractor.
            </p>

            <p className="mt-4 leading-relaxed text-gray-600">
              Business details can change. Check credentials applicable
              to your location, request a written project scope and
              compare more than one estimate before making a decision.
            </p>

            <Link
              href="/how-roofernet-works"
              className="mt-6 inline-flex items-center gap-2 font-medium text-blue-600 hover:underline"
            >
              Learn how RooferNet listings work
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">
                Roofing Service Guides
              </h2>

              <p className="mt-3 max-w-2xl text-gray-600">
                Learn what common roofing work may involve and which
                questions to ask before authorizing a project.
              </p>
            </div>

            <Link
              href="/services"
              className="inline-flex items-center gap-2 font-medium text-blue-600 hover:underline"
            >
              View all service guides
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-5">
            {serviceEntries.map(([slug, guide]) => (
              <Link
                key={slug}
                href={`/services/${slug}`}
                className="group rounded-xl border border-gray-200 bg-white p-5 transition hover:border-blue-300 hover:shadow-md"
              >
                <div className="text-3xl" aria-hidden="true">
                  {serviceIcons[slug] || '🔧'}
                </div>

                <h3 className="mt-4 font-semibold text-gray-900 transition group-hover:text-blue-600">
                  {guide.title.replace(/ Guide$/, '')}
                </h3>

                <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-gray-600">
                  {guide.summary}
                </p>

                <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-blue-600">
                  Read guide
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                </span>
              </Link>
            ))}
          </div>

          <p className="mt-5 text-center text-sm text-gray-500">
            These pages explain roofing services generally. RooferNet
            does not currently verify service specialization for every
            listed contractor.
          </p>
        </div>
      </section>

      <section className="py-16">
        <FeaturedContractors
          limit={MAX_FEATURED_NATIONAL}
          title="Featured Contractor Listings"
          showAdvertiseCta
        />

        <div className="container mx-auto mt-4 px-4">
          <p className="text-center text-sm text-gray-500">
            Featured placement is promotional advertising and does not
            represent a RooferNet endorsement.
          </p>
        </div>
      </section>

      <AdvertiseCta />

      <section className="py-16">
        <div className="container mx-auto max-w-5xl px-4">
          <h2 className="text-center text-3xl font-bold text-gray-900">
            How to Use the Directory
          </h2>

          <div className="mt-10 grid grid-cols-1 gap-8 md:grid-cols-3">
            <div className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-2xl font-bold text-blue-700">
                1
              </div>

              <h3 className="mt-4 font-semibold text-gray-900">
                Browse
              </h3>

              <p className="mt-2 text-sm leading-relaxed text-gray-600">
                Browse published contractor listings by state and
                location.
              </p>
            </div>

            <div className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-2xl font-bold text-blue-700">
                2
              </div>

              <h3 className="mt-4 font-semibold text-gray-900">
                Compare
              </h3>

              <p className="mt-2 text-sm leading-relaxed text-gray-600">
                Review available ratings, contact details, locations and
                business information.
              </p>
            </div>

            <div className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-2xl font-bold text-blue-700">
                3
              </div>

              <h3 className="mt-4 font-semibold text-gray-900">
                Confirm
              </h3>

              <p className="mt-2 text-sm leading-relaxed text-gray-600">
                Contact businesses directly and verify credentials,
                availability, scope and project terms.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">
                Browse Contractors by State
              </h2>

              <p className="mt-3 text-gray-600">
                Start with states containing the largest number of
                published listings.
              </p>
            </div>

            <Link
              href="/states"
              className="inline-flex items-center gap-2 font-medium text-blue-600 hover:underline"
            >
              View all states
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {stateList.length > 0 ? (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
              {stateList.slice(0, 24).map((state) => (
                <Link
                  key={state.slug}
                  href={`/${state.slug}`}
                  className="group rounded-lg border border-gray-200 bg-white p-4 text-center transition hover:border-blue-300 hover:shadow-md"
                >
                  <span className="font-semibold text-gray-800 transition group-hover:text-blue-600">
                    {state.name}
                  </span>

                  <span className="mt-1 block text-xs text-gray-500">
                    {state.contractorCount.toLocaleString('en-US')}{' '}
                    {state.contractorCount === 1
                      ? 'listing'
                      : 'listings'}
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500">
              No published contractor locations are currently available.
            </p>
          )}
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto max-w-5xl px-4">
          <DirectoryDisclosure />
        </div>
      </section>

      <section className="pb-16 pt-8">
        <div className="container mx-auto max-w-4xl px-4">
          <h2 className="text-center text-3xl font-bold text-gray-900">
            Frequently Asked Questions
          </h2>

          <div className="mt-8 space-y-4">
            {faqs.map((faq) => (
              <details
                key={faq.question}
                className="group rounded-lg border border-gray-200 bg-white p-6"
              >
                <summary className="cursor-pointer list-none font-semibold text-gray-900">
                  <span className="flex items-center justify-between gap-4">
                    {faq.question}

                    <span className="text-blue-600 transition group-open:rotate-45">
                      +
                    </span>
                  </span>
                </summary>

                <p className="mt-4 leading-relaxed text-gray-600">
                  {faq.answer}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}

export default async function HomePage() {
  const db = getDb()

  const [stateResults, totalsResult] = await Promise.all([
    db
      .select({
        state: contractors.state,
        stateSlug: contractors.stateSlug,
        stateAbbrev: contractors.state_abbrev,
        contractorCount: sql<number>`
          COUNT(*)
        `.as('contractor_count'),
      })
      .from(contractors)
      .where(eq(contractors.published, true))
      .groupBy(
        contractors.state,
        contractors.stateSlug,
        contractors.state_abbrev
      )
      .orderBy(sql`COUNT(*) DESC`),

    db
      .select({
        totalContractors: sql<number>`COUNT(*)`,

        totalStates: sql<number>`
          COUNT(
            DISTINCT ${contractors.stateSlug}
          )
        `,

        totalLocations: sql<number>`
          COUNT(
            DISTINCT (
              ${contractors.stateSlug},
              ${contractors.citySlug}
            )
          )
        `,
      })
      .from(contractors)
      .where(eq(contractors.published, true)),
  ])

  const stateList: StateSummary[] = stateResults
    .filter(
      (
        state
      ): state is typeof state & {
        state: string
        stateSlug: string
      } => Boolean(state.state && state.stateSlug)
    )
    .map((state) => ({
      name: state.state,
      slug: state.stateSlug,
      abbreviation: state.stateAbbrev,
      contractorCount:
        Number(state.contractorCount) || 0,
    }))

  return (
    <HomeContent
      stateList={stateList}
      totalContractors={
        Number(
          totalsResult[0]?.totalContractors
        ) || 0
      }
      totalStates={
        Number(
          totalsResult[0]?.totalStates
        ) || 0
      }
      totalLocations={
        Number(
          totalsResult[0]?.totalLocations
        ) || 0
      }
    />
  )
}