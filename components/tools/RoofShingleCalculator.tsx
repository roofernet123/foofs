'use client'

import {
  useMemo,
  useState,
} from 'react'

import {
  Boxes,
  RotateCcw,
} from 'lucide-react'

import {
  addWaste,
  formatNumber,
  roofingSquares,
} from '@/lib/roofCalculations'

export default function RoofShingleCalculator() {
  const [
    roofArea,
    setRoofArea,
  ] = useState('2000')

  const [
    waste,
    setWaste,
  ] = useState('10')

  const [
    bundlesPerSquare,
    setBundlesPerSquare,
  ] = useState('3')

  const [
    calculated,
    setCalculated,
  ] = useState(false)

  const result = useMemo(() => {
    const area =
      Number(roofArea)

    const wastePercent =
      Number(waste)

    const bundles =
      Number(
        bundlesPerSquare
      )

    if (
      !Number.isFinite(area) ||
      area <= 0 ||
      !Number.isFinite(bundles) ||
      bundles <= 0
    ) {
      return null
    }

    const adjustedArea =
      addWaste(
        area,
        Number.isFinite(
          wastePercent
        )
          ? wastePercent
          : 0
      )

    const squares =
      roofingSquares(
        adjustedArea
      )

    const bundleCount =
      Math.ceil(
        squares * bundles
      )

    return {
      adjustedArea,

      squares,

      bundles:
        bundleCount,

      originalSquares:
        roofingSquares(
          area
        ),
    }
  }, [
    roofArea,
    waste,
    bundlesPerSquare,
  ])

  function reset() {
    setRoofArea('2000')

    setWaste('10')

    setBundlesPerSquare(
      '3'
    )

    setCalculated(false)
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gray-300 bg-white shadow-sm">

      <div className="border-b border-gray-200 bg-blue-700 px-5 py-4 text-white">

        <div className="flex items-center gap-2">

          <Boxes className="h-5 w-5" />

          <h2 className="text-lg font-bold">
            Roof Shingle Calculator
          </h2>
        </div>
      </div>

      <div className="grid lg:grid-cols-[420px_1fr]">

        <div className="border-b border-gray-200 bg-gray-50 p-5 lg:border-b-0 lg:border-r">

          <div className="space-y-4">

            <Field label="Roof Area">

              <div className="flex">

                <input
                  type="number"
                  min="1"
                  step="50"
                  value={
                    roofArea
                  }
                  onChange={(
                    event
                  ) => {
                    setRoofArea(
                      event.target
                        .value
                    )

                    setCalculated(
                      false
                    )
                  }}
                  className="w-full rounded-l-md border border-gray-300 px-3 py-2.5 outline-none focus:border-blue-500"
                />

                <span className="flex items-center rounded-r-md border border-l-0 border-gray-300 bg-gray-100 px-3 text-sm text-gray-500">
                  ft²
                </span>
              </div>
            </Field>

            <Field label="Waste Allowance">

              <select
                value={waste}
                onChange={(
                  event
                ) => {
                  setWaste(
                    event.target
                      .value
                  )

                  setCalculated(
                    false
                  )
                }}
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2.5"
              >
                <option value="0">
                  0%
                </option>

                <option value="5">
                  5%
                </option>

                <option value="10">
                  10%
                </option>

                <option value="15">
                  15%
                </option>

                <option value="20">
                  20%
                </option>
              </select>
            </Field>

            <Field label="Bundles Per Roofing Square">

              <input
                type="number"
                min="1"
                step="0.1"
                value={
                  bundlesPerSquare
                }
                onChange={(
                  event
                ) => {
                  setBundlesPerSquare(
                    event.target
                      .value
                  )

                  setCalculated(
                    false
                  )
                }}
                className="w-full rounded-md border border-gray-300 px-3 py-2.5 outline-none focus:border-blue-500"
              />

              <p className="mt-1 text-xs leading-5 text-gray-500">
                Many asphalt shingle products use about 3 bundles per roofing square, but always check the manufacturer's coverage.
              </p>
            </Field>

            <div className="flex gap-2 pt-2">

              <button
                type="button"
                onClick={() =>
                  setCalculated(
                    true
                  )
                }
                className="flex-1 rounded-md bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
              >
                Calculate
              </button>

              <button
                type="button"
                onClick={reset}
                className="rounded-md border border-gray-300 bg-white px-4 text-gray-600 hover:bg-gray-100"
                title="Reset calculator"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="p-5 md:p-7">

          {!calculated ||
          !result ? (
            <div className="flex min-h-[320px] flex-col items-center justify-center text-center">

              <Boxes className="mb-4 h-12 w-12 text-gray-300" />

              <h3 className="font-semibold text-gray-800">
                Estimate shingle quantities
              </h3>

              <p className="mt-2 max-w-sm text-sm leading-6 text-gray-500">
                Enter the roof area and waste allowance to calculate roofing squares and estimated bundles.
              </p>
            </div>
          ) : (
            <div>

              <p className="text-sm font-medium uppercase tracking-wide text-gray-400">
                Estimated Shingle Bundles
              </p>

              <div className="mt-2 text-5xl font-bold text-blue-700">
                {result.bundles}
              </div>

              <p className="mt-2 text-sm text-gray-500">
                Estimated bundles including your selected waste allowance.
              </p>

              <div className="mt-7 grid gap-3 sm:grid-cols-2">

                <ResultCard
                  label="Original Roof Area"
                  value={`${formatNumber(
                    Number(
                      roofArea
                    )
                  )} ft²`}
                />

                <ResultCard
                  label="Original Squares"
                  value={formatNumber(
                    result.originalSquares,
                    1
                  )}
                />

                <ResultCard
                  label="Area With Waste"
                  value={`${formatNumber(
                    result.adjustedArea
                  )} ft²`}
                />

                <ResultCard
                  label="Squares With Waste"
                  value={formatNumber(
                    result.squares,
                    1
                  )}
                />

                <ResultCard
                  label="Bundles Per Square"
                  value={
                    bundlesPerSquare
                  }
                />

                <ResultCard
                  label="Total Bundles"
                  value={String(
                    result.bundles
                  )}
                />
              </div>

              <div className="mt-6 rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-sm leading-6 text-yellow-900">
                Bundle coverage varies by manufacturer and shingle style. Verify the package coverage before ordering materials.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function Field({
  label,
  children,
}: {
  label: string
  children:
    React.ReactNode
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-gray-700">
        {label}
      </label>

      {children}
    </div>
  )
}

function ResultCard({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">

      <div className="text-xs font-medium uppercase tracking-wide text-gray-400">
        {label}
      </div>

      <div className="mt-1 text-xl font-bold text-gray-900">
        {value}
      </div>
    </div>
  )
}