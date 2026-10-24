'use client'

import {
  useMemo,
  useState,
} from 'react'

import {
  Calculator,
  RotateCcw,
} from 'lucide-react'

import {
  addWaste,
  estimateRoofArea,
  formatNumber,
  roofPitchAngle,
  roofPitchFactor,
  roofingSquares,
} from '@/lib/roofCalculations'

const PITCHES = [
  0,
  1,
  2,
  3,
  4,
  5,
  6,
  7,
  8,
  9,
  10,
  11,
  12,
  14,
  16,
  18,
  20,
  24,
]

export default function RoofAreaCalculator() {
  const [
    baseArea,
    setBaseArea,
  ] = useState('1800')

  const [
    pitchRise,
    setPitchRise,
  ] = useState('6')

  const [
    eaves,
    setEaves,
  ] = useState('1')

  const [
    waste,
    setWaste,
  ] = useState('10')

  const [
    calculated,
    setCalculated,
  ] = useState(false)

  const result = useMemo(() => {
    const base =
      Number(baseArea)

    const rise =
      Number(pitchRise)

    const overhang =
      Number(eaves)

    const wastePercent =
      Number(waste)

    if (
      !Number.isFinite(base) ||
      base <= 0
    ) {
      return null
    }

    const roofArea =
      estimateRoofArea({
        baseArea: base,

        pitchRise:
          Number.isFinite(rise)
            ? rise
            : 0,

        eaveOverhang:
          Number.isFinite(
            overhang
          )
            ? overhang
            : 0,
      })

    const adjustedArea =
      addWaste(
        roofArea,
        Number.isFinite(
          wastePercent
        )
          ? wastePercent
          : 0
      )

    return {
      roofArea,

      adjustedArea,

      squares:
        roofingSquares(
          adjustedArea
        ),

      factor:
        roofPitchFactor(
          rise || 0,
          12
        ),

      angle:
        roofPitchAngle(
          rise || 0,
          12
        ),
    }
  }, [
    baseArea,
    pitchRise,
    eaves,
    waste,
  ])

  function reset() {
    setBaseArea('1800')

    setPitchRise('6')

    setEaves('1')

    setWaste('10')

    setCalculated(false)
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gray-300 bg-white shadow-sm">

      <div className="border-b border-gray-200 bg-blue-700 px-5 py-4 text-white">

        <div className="flex items-center gap-2">

          <Calculator className="h-5 w-5" />

          <h2 className="text-lg font-bold">
            Roof Area Calculator
          </h2>
        </div>
      </div>

      <div className="grid lg:grid-cols-[420px_1fr]">

        {/* Inputs */}
        <div className="border-b border-gray-200 bg-gray-50 p-5 lg:border-b-0 lg:border-r">

          <div className="space-y-4">

            <Field label="House Base Area">

              <div className="flex">

                <input
                  type="number"
                  min="100"
                  step="50"
                  value={
                    baseArea
                  }
                  onChange={(
                    event
                  ) => {
                    setBaseArea(
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

            <Field label="Roof Pitch">

              <div className="flex items-center gap-3">

                <select
                  value={
                    pitchRise
                  }
                  onChange={(
                    event
                  ) => {
                    setPitchRise(
                      event.target
                        .value
                    )

                    setCalculated(
                      false
                    )
                  }}
                  className="w-full rounded-md border border-gray-300 bg-white px-3 py-2.5 outline-none focus:border-blue-500"
                >

                  {PITCHES.map(
                    (rise) => (
                      <option
                        key={rise}
                        value={rise}
                      >
                        {rise}/12
                      </option>
                    )
                  )}
                </select>

                <span className="min-w-16 text-sm text-gray-500">
                  {roofPitchAngle(
                    Number(
                      pitchRise
                    ),
                    12
                  ).toFixed(1)}
                  °
                </span>
              </div>
            </Field>

            <Field label="Eave Overhang">

              <div className="flex">

                <input
                  type="number"
                  min="0"
                  step="0.25"
                  value={eaves}
                  onChange={(
                    event
                  ) => {
                    setEaves(
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
                  ft
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

        {/* Results */}
        <div className="p-5 md:p-7">

          {!calculated ||
          !result ? (
            <EmptyState
              title="Calculate your roof area"
              text="Enter the approximate building footprint, roof pitch and eave overhang."
            />
          ) : (
            <div>

              <p className="text-sm font-medium uppercase tracking-wide text-gray-400">
                Estimated Roof Surface Area
              </p>

              <div className="mt-2 text-4xl font-bold text-blue-700">
                {formatNumber(
                  result.roofArea
                )}{' '}
                ft²
              </div>

              <div className="mt-7 grid gap-3 sm:grid-cols-2">

                <ResultCard
                  label="Roof Area"
                  value={`${formatNumber(
                    result.roofArea
                  )} ft²`}
                />

                <ResultCard
                  label="Area With Waste"
                  value={`${formatNumber(
                    result.adjustedArea
                  )} ft²`}
                />

                <ResultCard
                  label="Roofing Squares"
                  value={formatNumber(
                    result.squares,
                    1
                  )}
                />

                <ResultCard
                  label="Pitch Factor"
                  value={result.factor.toFixed(
                    3
                  )}
                />

                <ResultCard
                  label="Roof Angle"
                  value={`${result.angle.toFixed(
                    1
                  )}°`}
                />
              </div>

              <div className="mt-6 rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm leading-6 text-blue-900">
                One roofing square equals 100 square feet of roof surface.
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

function EmptyState({
  title,
  text,
}: {
  title: string
  text: string
}) {
  return (
    <div className="flex min-h-[320px] flex-col items-center justify-center text-center">

      <Calculator className="mb-4 h-12 w-12 text-gray-300" />

      <h3 className="font-semibold text-gray-800">
        {title}
      </h3>

      <p className="mt-2 max-w-sm text-sm leading-6 text-gray-500">
        {text}
      </p>
    </div>
  )
}