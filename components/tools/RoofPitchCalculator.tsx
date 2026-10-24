'use client'

import {
  useMemo,
  useState,
} from 'react'

import {
  ChartNoAxesColumnIncreasing,
  RotateCcw,
} from 'lucide-react'

import {
  roofPitchAngle,
  roofPitchFactor,
} from '@/lib/roofCalculations'

export default function RoofPitchCalculator() {
  const [
    rise,
    setRise,
  ] = useState('6')

  const [
    run,
    setRun,
  ] = useState('12')

  const [
    calculated,
    setCalculated,
  ] = useState(false)

  const result = useMemo(() => {
    const riseValue =
      Number(rise)

    const runValue =
      Number(run)

    if (
      !Number.isFinite(
        riseValue
      ) ||
      !Number.isFinite(
        runValue
      ) ||
      riseValue < 0 ||
      runValue <= 0
    ) {
      return null
    }

    const angle =
      roofPitchAngle(
        riseValue,
        runValue
      )

    const factor =
      roofPitchFactor(
        riseValue,
        runValue
      )

    /*
     * Normalize pitch to a standard x/12 format.
     */
    const normalizedRise =
      (riseValue /
        runValue) *
      12

    const slopePercent =
      (riseValue /
        runValue) *
      100

    return {
      angle,

      factor,

      normalizedRise,

      slopePercent,
    }
  }, [
    rise,
    run,
  ])

  function reset() {
    setRise('6')
    setRun('12')
    setCalculated(false)
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gray-300 bg-white shadow-sm">

      <div className="border-b border-gray-200 bg-blue-700 px-5 py-4 text-white">

        <div className="flex items-center gap-2">

          <ChartNoAxesColumnIncreasing className="h-5 w-5" />

          <h2 className="text-lg font-bold">
            Roof Pitch Calculator
          </h2>
        </div>
      </div>

      <div className="grid lg:grid-cols-[420px_1fr]">

        <div className="border-b border-gray-200 bg-gray-50 p-5 lg:border-b-0 lg:border-r">

          <div className="space-y-4">

            <Field label="Roof Rise">

              <div className="flex">

                <input
                  type="number"
                  min="0"
                  step="0.25"
                  value={rise}
                  onChange={(
                    event
                  ) => {
                    setRise(
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
                  in
                </span>
              </div>
            </Field>

            <Field label="Roof Run">

              <div className="flex">

                <input
                  type="number"
                  min="0.1"
                  step="0.25"
                  value={run}
                  onChange={(
                    event
                  ) => {
                    setRun(
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
                  in
                </span>
              </div>
            </Field>

            <div className="rounded-lg border border-gray-200 bg-white p-4 text-sm leading-6 text-gray-600">
              Roof pitch is the amount the roof rises vertically for a given horizontal run. Residential roof pitch is commonly expressed as rise per 12 inches of run.
            </div>

            <div className="flex gap-2">

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

              <ChartNoAxesColumnIncreasing className="mb-4 h-12 w-12 text-gray-300" />

              <h3 className="font-semibold text-gray-800">
                Calculate roof pitch
              </h3>

              <p className="mt-2 max-w-sm text-sm leading-6 text-gray-500">
                Enter the vertical rise and horizontal run to calculate pitch, angle and slope factor.
              </p>
            </div>
          ) : (
            <div>

              <p className="text-sm font-medium uppercase tracking-wide text-gray-400">
                Standard Roof Pitch
              </p>

              <div className="mt-2 text-5xl font-bold text-blue-700">
                {formatPitch(
                  result.normalizedRise
                )}
                /12
              </div>

              <div className="mt-7 grid gap-3 sm:grid-cols-2">

                <ResultCard
                  label="Roof Pitch"
                  value={`${formatPitch(
                    result.normalizedRise
                  )}/12`}
                />

                <ResultCard
                  label="Roof Angle"
                  value={`${result.angle.toFixed(
                    1
                  )}°`}
                />

                <ResultCard
                  label="Slope Percentage"
                  value={`${result.slopePercent.toFixed(
                    1
                  )}%`}
                />

                <ResultCard
                  label="Roof Area Factor"
                  value={result.factor.toFixed(
                    3
                  )}
                />

                <ResultCard
                  label="Rise"
                  value={`${rise} in`}
                />

                <ResultCard
                  label="Run"
                  value={`${run} in`}
                />
              </div>

              <div className="mt-6 rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm leading-6 text-blue-900">
                The roof area factor estimates how much a sloped roof surface increases relative to its horizontal projection.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function formatPitch(
  value: number
) {
  if (
    Math.abs(
      value -
        Math.round(value)
    ) < 0.001
  ) {
    return String(
      Math.round(value)
    )
  }

  return value.toFixed(2)
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