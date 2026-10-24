import type {
  Metadata,
} from 'next'

import Link from 'next/link'

import {
  ArrowRight,
} from 'lucide-react'

import RoofPitchCalculator from '@/components/tools/RoofPitchCalculator'
import RelatedRoofingTools from '@/components/tools/RelatedRoofingTools'

export const metadata: Metadata = {
  title:
    'Roof Pitch Calculator',

  description:
    'Calculate roof pitch, roof angle, slope percentage and roof area multiplier from roof rise and run.',

  alternates: {
    canonical:
      '/tools/roof-pitch-calculator',
  },
}

export default function RoofPitchCalculatorPage() {
  return (
    <main className="bg-gray-50">

      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">

        <Breadcrumb title="Roof Pitch Calculator" />

        <header className="mb-8">

          <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">
            Free Roofing Calculator
          </p>

          <h1 className="mt-2 text-3xl font-bold text-gray-900 md:text-5xl">
            Roof Pitch Calculator
          </h1>

          <p className="mt-4 max-w-3xl text-lg leading-8 text-gray-600">
            Convert roof rise and run into standard roof pitch, roof angle, slope percentage and surface-area correction factor.
          </p>
        </header>

        <RoofPitchCalculator />

        <div className="mt-12 space-y-8">

          <section className="rounded-xl bg-white p-6 shadow-sm md:p-8">

            <h2 className="text-2xl font-bold text-gray-900">
              What does 6/12 roof pitch mean?
            </h2>

            <p className="mt-4 leading-7 text-gray-600">
              A 6/12 roof rises 6 inches vertically for every 12 inches of horizontal run. Increasing the rise makes the roof steeper.
            </p>
          </section>

          <section className="rounded-xl bg-white p-6 shadow-sm md:p-8">

            <h2 className="text-2xl font-bold text-gray-900">
              Why roof pitch matters
            </h2>

            <p className="mt-4 leading-7 text-gray-600">
              Pitch affects roof surface area, material requirements, drainage and installation difficulty. Steeper roofs generally have greater surface area than their horizontal footprint.
            </p>
          </section>

          <section className="rounded-xl border border-blue-200 bg-blue-50 p-6 md:p-8">

            <h2 className="text-2xl font-bold text-gray-900">
              Use your pitch to estimate roof area
            </h2>

            <p className="mt-3 leading-7 text-gray-700">
              Once you know the pitch, use RooferNet's roof area calculator to estimate the total roof surface.
            </p>

            <Link
              href="/tools/roof-area-calculator"
              className="mt-5 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
            >
              Roof Area Calculator

              <ArrowRight className="h-4 w-4" />
            </Link>
          </section>
        </div>
      </div>
    </main>
  )
}

<RelatedRoofingTools
  currentSlug="roof-pitch-calculator"
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