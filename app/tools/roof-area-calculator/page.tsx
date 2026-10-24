import type {
  Metadata,
} from 'next'

import Link from 'next/link'

import {
  ArrowRight,
} from 'lucide-react'

import RoofAreaCalculator from '@/components/tools/RoofAreaCalculator'
import RelatedRoofingTools from '@/components/tools/RelatedRoofingTools'

export const metadata: Metadata = {
  title:
    'Roof Area Calculator',

  description:
    'Estimate roof surface area, roofing squares and material allowance from building footprint, roof pitch and eave overhang.',

  alternates: {
    canonical:
      '/tools/roof-area-calculator',
  },
}

export default function RoofAreaCalculatorPage() {
  return (
    <main className="bg-gray-50">

      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">

        <Breadcrumb title="Roof Area Calculator" />

        <header className="mb-8">

          <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">
            Free Roofing Calculator
          </p>

          <h1 className="mt-2 text-3xl font-bold text-gray-900 md:text-5xl">
            Roof Area Calculator
          </h1>

          <p className="mt-4 max-w-3xl text-lg leading-8 text-gray-600">
            Estimate the approximate surface area of a pitched roof using the building footprint, roof pitch and eave overhang.
          </p>
        </header>

        <RoofAreaCalculator />

        <div className="mt-12 space-y-8">

          <section className="rounded-xl bg-white p-6 shadow-sm md:p-8">

            <h2 className="text-2xl font-bold text-gray-900">
              Why roof area is larger than floor area
            </h2>

            <p className="mt-4 leading-7 text-gray-600">
              Roof surface area increases as roof pitch increases. Eave overhangs also extend beyond the exterior walls, which can make the actual roofing area larger than the building footprint.
            </p>
          </section>

          <section className="rounded-xl bg-white p-6 shadow-sm md:p-8">

            <h2 className="text-2xl font-bold text-gray-900">
              What is a roofing square?
            </h2>

            <p className="mt-4 leading-7 text-gray-600">
              Roofing contractors commonly use squares when estimating materials. One roofing square equals 100 square feet of roof surface.
            </p>
          </section>

          <section className="rounded-xl border border-blue-200 bg-blue-50 p-6 md:p-8">

            <h2 className="text-2xl font-bold text-gray-900">
              Estimating a replacement project?
            </h2>

            <p className="mt-3 leading-7 text-gray-700">
              Once you know your approximate roof area, use the RooferNet replacement cost calculator to estimate a preliminary project budget.
            </p>

            <Link
              href="/tools/roof-replacement-cost-calculator"
              className="mt-5 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
            >
              Roof Replacement Calculator

              <ArrowRight className="h-4 w-4" />
            </Link>
          </section>
        </div>
      </div>
    </main>
  )
}

<RelatedRoofingTools
  currentSlug="roof-area-calculator"
/>

function Breadcrumb({
  title,
}: {
  title: string
}) {
  return (
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
        {title}
      </span>
    </nav>
  )
}