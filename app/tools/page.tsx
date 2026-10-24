import type {
  Metadata,
} from 'next'

import Link from 'next/link'

import {
  ArrowRight,
  Calculator,
} from 'lucide-react'

import {
  roofingTools,
} from '@/data/roofing-tools'


export const metadata: Metadata = {
  title:
    'Free Roofing Calculators & Tools',

  description:
    'Free roofing calculators for estimating roof replacement cost, roof area, shingles, roofing squares and roof pitch.',

  alternates: {
    canonical: '/tools',
  },
}


export default function RoofingToolsPage() {
  return (
    <main className="bg-gray-50">

      <section className="border-b border-gray-200 bg-white">

        <div className="mx-auto max-w-7xl px-4 py-14 text-center sm:px-6">

          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-blue-100 text-blue-600">

            <Calculator className="h-7 w-7" />
          </div>

          <h1 className="text-4xl font-bold tracking-tight text-gray-900 md:text-5xl">
            Free Roofing Calculators & Tools
          </h1>

          <p className="mx-auto mt-5 max-w-3xl text-lg leading-8 text-gray-600">
            Estimate roof replacement costs, roof area, roofing materials and pitch before speaking with a contractor.
          </p>
        </div>
      </section>


      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">

        <div className="grid gap-6 md:grid-cols-2">

          {roofingTools.map(
            (tool) => {
              const Icon =
                tool.icon

              return (
                <Link
                  key={
                    tool.slug
                  }
                  href={`/tools/${tool.slug}`}
                  className={`group rounded-xl border bg-white p-6 transition hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-lg ${
                    tool.featured
                      ? 'border-blue-300 md:col-span-2'
                      : 'border-gray-200'
                  }`}
                >

                  <div className="flex items-start gap-4">

                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">

                      <Icon className="h-6 w-6" />
                    </div>


                    <div>

                      {tool.featured && (
                        <span className="mb-2 inline-block rounded-full bg-blue-100 px-2.5 py-1 text-xs font-semibold text-blue-700">
                          Most Popular
                        </span>
                      )}

                      <h2 className="text-xl font-bold text-gray-900 group-hover:text-blue-600">
                        {tool.title}
                      </h2>

                      <p className="mt-2 leading-7 text-gray-600">
                        {
                          tool.description
                        }
                      </p>

                      <span className="mt-4 inline-flex items-center gap-1 font-semibold text-blue-600">
                        Open Calculator

                        <ArrowRight className="h-4 w-4" />
                      </span>
                    </div>
                  </div>
                </Link>
              )
            }
          )}
        </div>


        <div className="mt-12 rounded-xl border border-gray-200 bg-white p-6 md:p-8">

          <h2 className="text-2xl font-bold text-gray-900">
            Planning a Roofing Project?
          </h2>

          <p className="mt-3 max-w-3xl leading-7 text-gray-600">
            RooferNet calculators provide preliminary estimates for planning and comparison. Actual roofing requirements and prices depend on the property, materials, local labor costs and project conditions.
          </p>

          <Link
            href="/search"
            className="mt-5 inline-flex rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
          >
            Find Roofing Contractors
          </Link>
        </div>
      </section>
    </main>
  )
}