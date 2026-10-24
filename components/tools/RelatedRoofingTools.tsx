// components/tools/RelatedRoofingTools.tsx

import Link from 'next/link'

import {
  ArrowRight,
} from 'lucide-react'

import {
  roofingTools,
} from '@/data/roofing-tools'

type Props = {
  currentSlug: string
  limit?: number
}

export default function RelatedRoofingTools({
  currentSlug,
  limit = 3,
}: Props) {
  const relatedTools =
    roofingTools
      .filter(
        (tool) =>
          tool.slug !==
          currentSlug
      )
      .slice(
        0,
        limit
      )

  if (
    relatedTools.length ===
    0
  ) {
    return null
  }

  return (
    <section className="mt-12">

      <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">

        <div>

          <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">
            More Free Tools
          </p>

          <h2 className="mt-1 text-2xl font-bold text-gray-900 md:text-3xl">
            Related Roofing Calculators
          </h2>

          <p className="mt-2 max-w-2xl text-gray-600">
            Continue planning your roofing project with these related RooferNet calculators.
          </p>
        </div>

        <Link
          href="/tools"
          className="inline-flex items-center gap-1 text-sm font-semibold text-blue-600 hover:text-blue-700 hover:underline"
        >
          View all tools

          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>


      <div className="grid gap-5 md:grid-cols-3">

        {relatedTools.map(
          (tool) => {
            const Icon =
              tool.icon

            return (
              <Link
                key={
                  tool.slug
                }
                href={`/tools/${tool.slug}`}
                className="group rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md"
              >

                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-50 text-blue-600">

                  <Icon className="h-5 w-5" />
                </div>

                <h3 className="mt-4 text-lg font-bold text-gray-900 transition group-hover:text-blue-600">
                  {
                    tool.shortTitle
                  }
                </h3>

                <p className="mt-2 text-sm leading-6 text-gray-600">
                  {
                    tool.description
                  }
                </p>

                <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-blue-600">
                  Open Calculator

                  <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                </span>
              </Link>
            )
          }
        )}
      </div>
    </section>
  )
}