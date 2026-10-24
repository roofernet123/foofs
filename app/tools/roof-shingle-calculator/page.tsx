import type {
  Metadata,
} from 'next'

import Link from 'next/link'

import {
  ArrowRight,
} from 'lucide-react'

import RoofShingleCalculator from '@/components/tools/RoofShingleCalculator'
import RelatedRoofingTools from '@/components/tools/RelatedRoofingTools'

export const metadata: Metadata = {
  title:
    'Roof Shingle Calculator',

  description:
    'Calculate roofing squares and estimate how many shingle bundles are needed based on roof area and waste allowance.',

  alternates: {
    canonical:
      '/tools/roof-shingle-calculator',
  },
}

export default function RoofShingleCalculatorPage() {
  return (
    <main className="bg-gray-50">

      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">

        <Breadcrumb title="Roof Shingle Calculator" />

        <header className="mb-8">

          <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">
            Free Roofing Calculator
          </p>

          <h1 className="mt-2 text-3xl font-bold text-gray-900 md:text-5xl">
            Roof Shingle Calculator
          </h1>

          <p className="mt-4 max-w-3xl text-lg leading-8 text-gray-600">
            Estimate roofing squares and the number of shingle bundles required for a roofing project.
          </p>
        </header>

        <RoofShingleCalculator />

        <div className="mt-12 space-y-8">

          <section className="rounded-xl bg-white p-6 shadow-sm md:p-8">

            <h2 className="text-2xl font-bold text-gray-900">
              How many shingles do I need?
            </h2>

            <p className="mt-4 leading-7 text-gray-600">
              Start with the total roof surface area, convert that area into roofing squares, add an allowance for cuts and waste, and then multiply by the number of bundles required per roofing square.
            </p>
          </section>

          <section className="rounded-xl bg-white p-6 shadow-sm md:p-8">

            <h2 className="text-2xl font-bold text-gray-900">
              Why add extra material?
            </h2>

            <p className="mt-4 leading-7 text-gray-600">
              Roofing materials may be lost to cuts, valleys, hips, ridges, starter courses and installation waste. More complicated roof shapes can require a larger allowance.
            </p>
          </section>

          <section className="rounded-xl border border-blue-200 bg-blue-50 p-6 md:p-8">

            <h2 className="text-2xl font-bold text-gray-900">
              Don't know your roof area yet?
            </h2>

            <p className="mt-3 leading-7 text-gray-700">
              Use the Roof Area Calculator first to estimate the roof surface from your building footprint and pitch.
            </p>

            <Link
              href="/tools/roof-area-calculator"
              className="mt-5 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
            >
              Calculate Roof Area

              <ArrowRight className="h-4 w-4" />
            </Link>
          </section>
        </div>
      </div>
    </main>
  )
}

<RelatedRoofingTools
  currentSlug="roof-shingle-calculator"
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