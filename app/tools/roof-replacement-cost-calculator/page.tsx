import type {
  Metadata,
} from 'next'

import Link from 'next/link'

import {
  ArrowRight,
  Calculator,
} from 'lucide-react'

import RoofReplacementCostCalculator from '@/components/tools/RoofReplacementCostCalculator'
import RelatedRoofingTools from '@/components/tools/RelatedRoofingTools'

export const metadata: Metadata = {
  title:
    'Roof Replacement Cost Calculator',

  description:
    'Estimate roof replacement cost, roof area and roofing squares based on house size, roof pitch, eaves and roofing material.',

  alternates: {
    canonical:
      '/tools/roof-replacement-cost-calculator',
  },

  openGraph: {
    title:
      'Roof Replacement Cost Calculator | RooferNet',

    description:
      'Estimate roof area, roofing squares and a preliminary roof replacement cost range.',
  },
}


export default function RoofReplacementCostCalculatorPage() {
  const faq = [
    {
      question:
        'How is roof replacement cost estimated?',

      answer:
        'The calculator estimates roof surface area from the building footprint and roof pitch, adds a waste allowance, and applies an approximate installed cost range for the selected roofing material.',
    },

    {
      question:
        'What is a roofing square?',

      answer:
        'One roofing square equals 100 square feet of roof surface area.',
    },

    {
      question:
        'Does house square footage equal roof square footage?',

      answer:
        'Not usually. Roof pitch, overhangs and roof shape can make the actual roof surface larger than the building footprint.',
    },

    {
      question:
        'Is this calculator a contractor quote?',

      answer:
        'No. It is a preliminary budgeting estimate. Local labor, tear-off requirements, permits, decking repairs and roof complexity can substantially change a real contractor quote.',
    },
  ]

  const jsonLd = {
    '@context':
      'https://schema.org',

    '@type':
      'WebApplication',

    name:
      'RooferNet Roof Replacement Cost Calculator',

    applicationCategory:
      'UtilitiesApplication',

    operatingSystem:
      'Any',

    url:
      'https://www.roofernet.com/tools/roof-replacement-cost-calculator',

    description:
      'Estimate roof area, roofing squares and roof replacement cost.',
  }


  return (
    <main className="bg-gray-50">

      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">

        {/* Breadcrumb */}
        <nav className="mb-6 text-sm text-gray-500">

          <Link
            href="/"
            className="hover:text-blue-600"
          >
            Home
          </Link>

          <span className="mx-2">
            /
          </span>

          <Link
            href="/tools"
            className="hover:text-blue-600"
          >
            Roofing Tools
          </Link>

          <span className="mx-2">
            /
          </span>

          <span>
            Roof Replacement Cost Calculator
          </span>
        </nav>


        <header className="mb-8">

          <div className="mb-3 flex items-center gap-2 text-blue-600">

            <Calculator className="h-5 w-5" />

            <span className="text-sm font-semibold uppercase tracking-wide">
              Free Roofing Tool
            </span>
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-gray-900 md:text-5xl">
            Roof Replacement Cost Calculator
          </h1>

          <p className="mt-4 max-w-3xl text-lg leading-8 text-gray-600">
            Estimate your roof surface area, roofing squares and a preliminary roof replacement cost based on home size, roof pitch and roofing material.
          </p>
        </header>


        <RoofReplacementCostCalculator />


        {/* Explanation */}
        <article className="mt-12 space-y-10">

          <section className="rounded-xl bg-white p-6 shadow-sm md:p-8">

            <h2 className="text-2xl font-bold text-gray-900">
              How the Roof Replacement Calculator Works
            </h2>

            <p className="mt-4 leading-7 text-gray-600">
              A home's floor or footprint area does not necessarily equal its roof surface area. A pitched roof has more surface area than its horizontal footprint, and eave overhangs can increase that area further.
            </p>

            <p className="mt-4 leading-7 text-gray-600">
              The calculator estimates roof surface area using the selected pitch, applies the chosen waste allowance and then estimates a cost range based on roofing material.
            </p>
          </section>


          <section className="grid gap-6 md:grid-cols-2">

            <InfoSection
              title="Roof Pitch"
              text="Pitch describes how much a roof rises for every 12 inches of horizontal run. A 6/12 roof rises 6 inches for every 12 inches of run. Steeper roofs have greater surface area and may also require additional labor and safety measures."
            />

            <InfoSection
              title="Waste Allowance"
              text="Roofing materials normally require extra material for cuts, valleys, ridges, starter courses and installation waste. Simple roofs may require less waste than complex roofs with many hips and valleys."
            />

            <InfoSection
              title="Roofing Squares"
              text="Roofing contractors commonly measure roofing in squares. One roofing square represents 100 square feet of roof surface."
            />

            <InfoSection
              title="Replacement Cost"
              text="A real replacement quote can also include removal and disposal of old roofing, underlayment, flashing, permits, decking repairs and other project-specific work."
            />
          </section>


          <section className="rounded-xl border border-blue-200 bg-blue-50 p-6 md:p-8">

            <h2 className="text-2xl font-bold text-gray-900">
              Calculator estimate vs. contractor quote
            </h2>

            <p className="mt-3 leading-7 text-gray-700">
              Use this calculator to establish a preliminary budget. A roofing contractor can inspect the actual roof, identify hidden damage and provide pricing based on local material and labor costs.
            </p>

            <Link
              href="/search?q=roof%20replacement"
              className="mt-5 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
            >
              Find Roofers Near You

              <ArrowRight className="h-4 w-4" />
            </Link>
          </section>


          {/* FAQ */}
          <section className="rounded-xl bg-white p-6 md:p-8">

            <h2 className="text-2xl font-bold text-gray-900">
              Roof Replacement Calculator FAQs
            </h2>

            <div className="mt-6 space-y-6">

              {faq.map(
                (item) => (
                  <div
                    key={
                      item.question
                    }
                    className="border-b border-gray-100 pb-6 last:border-0 last:pb-0"
                  >
                    <h3 className="font-semibold text-gray-900">
                      {
                        item.question
                      }
                    </h3>

                    <p className="mt-2 leading-7 text-gray-600">
                      {
                        item.answer
                      }
                    </p>
                  </div>
                )
              )}
            </div>
          </section>
        </article>
      </div>

              
      <RelatedRoofingTools
        currentSlug="roof-replacement-cost-calculator"
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html:
            JSON.stringify(
              jsonLd
            ),
        }}
      />
    </main>
  )
}


function InfoSection({
  title,
  text,
}: {
  title: string
  text: string
}) {
  return (
    <section className="rounded-xl bg-white p-6 shadow-sm">

      <h2 className="text-xl font-bold text-gray-900">
        {title}
      </h2>

      <p className="mt-3 leading-7 text-gray-600">
        {text}
      </p>
    </section>
  )
}