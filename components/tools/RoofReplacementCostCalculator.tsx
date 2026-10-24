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
  formatMoney,
  formatNumber,
  roofPitchAngle,
  roofPitchFactor,
  roofingSquares,
} from '@/lib/roofCalculations'


type MaterialKey =
  | 'asphalt'
  | 'metal'
  | 'wood'
  | 'tile'
  | 'slate'
  | 'custom'


const MATERIALS: Record<
  MaterialKey,
  {
    label: string
    min: number
    max: number
  }
> = {
  asphalt: {
    label:
      'Asphalt Shingles',
    min: 4,
    max: 8,
  },

  metal: {
    label:
      'Metal Roofing',
    min: 7,
    max: 15,
  },

  wood: {
    label:
      'Wood Shake',
    min: 6,
    max: 14,
  },

  tile: {
    label:
      'Clay / Concrete Tile',
    min: 10,
    max: 20,
  },

  slate: {
    label:
      'Slate',
    min: 15,
    max: 30,
  },

  custom: {
    label:
      'Custom Price',
    min: 0,
    max: 0,
  },
}


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


export default function RoofReplacementCostCalculator() {
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
    material,
    setMaterial,
  ] =
    useState<MaterialKey>(
      'asphalt'
    )

  const [
    customPrice,
    setCustomPrice,
  ] = useState('')

  const [
    calculated,
    setCalculated,
  ] = useState(false)


  const result =
    useMemo(() => {
      const base =
        Number(baseArea)

      const rise =
        Number(pitchRise)

      const overhang =
        Number(eaves)

      const wastePercent =
        Number(waste)

      if (
        !Number.isFinite(
          base
        ) ||
        base <= 0
      ) {
        return null
      }

      const roofArea =
        estimateRoofArea({
          baseArea: base,

          pitchRise:
            Number.isFinite(
              rise
            )
              ? rise
              : 0,

          eaveOverhang:
            Number.isFinite(
              overhang
            )
              ? overhang
              : 0,
        })

      const projectArea =
        addWaste(
          roofArea,
          Number.isFinite(
            wastePercent
          )
            ? wastePercent
            : 0
        )

      let minRate =
        MATERIALS[material]
          .min

      let maxRate =
        MATERIALS[material]
          .max

      if (
        material === 'custom'
      ) {
        const price =
          Number(customPrice)

        minRate =
          Number.isFinite(
            price
          )
            ? price
            : 0

        maxRate =
          minRate
      }

      return {
        roofArea,

        projectArea,

        squares:
          roofingSquares(
            projectArea
          ),

        pitchFactor:
          roofPitchFactor(
            rise || 0,
            12
          ),

        angle:
          roofPitchAngle(
            rise || 0,
            12
          ),

        minCost:
          projectArea *
          minRate,

        maxCost:
          projectArea *
          maxRate,

        minRate,

        maxRate,
      }
    }, [
      baseArea,
      pitchRise,
      eaves,
      waste,
      material,
      customPrice,
    ])


  function reset() {
    setBaseArea('1800')

    setPitchRise('6')

    setEaves('1')

    setWaste('10')

    setMaterial(
      'asphalt'
    )

    setCustomPrice('')

    setCalculated(false)
  }


  return (
    <div className="overflow-hidden rounded-xl border border-gray-300 bg-white shadow-sm">

      {/* Header */}
      <div className="border-b border-gray-200 bg-blue-700 px-5 py-4 text-white">

        <div className="flex items-center gap-2">

          <Calculator className="h-5 w-5" />

          <h2 className="text-lg font-bold">
            Roof Replacement Cost Calculator
          </h2>
        </div>
      </div>


      <div className="grid lg:grid-cols-[420px_1fr]">

        {/* Inputs */}
        <div className="border-b border-gray-200 bg-gray-50 p-5 lg:border-b-0 lg:border-r">

          <div className="space-y-4">

            <CalculatorField
              label="House Base Area"
            >
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
            </CalculatorField>


            <CalculatorField label="Roof Pitch">

              <div className="flex items-center gap-2">

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

                <span className="min-w-20 text-sm text-gray-500">
                  {roofPitchAngle(
                    Number(
                      pitchRise
                    ),
                    12
                  ).toFixed(1)}
                  °
                </span>
              </div>
            </CalculatorField>


            <CalculatorField label="Eave Overhang">

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
            </CalculatorField>


            <CalculatorField label="Roofing Material">

              <select
                value={material}
                onChange={(
                  event
                ) => {
                  setMaterial(
                    event.target
                      .value as MaterialKey
                  )

                  setCalculated(
                    false
                  )
                }}
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2.5 outline-none focus:border-blue-500"
              >

                {Object.entries(
                  MATERIALS
                ).map(
                  ([
                    key,
                    value,
                  ]) => (
                    <option
                      key={key}
                      value={key}
                    >
                      {
                        value.label
                      }
                    </option>
                  )
                )}
              </select>
            </CalculatorField>


            {material ===
              'custom' && (
              <CalculatorField label="Installed Price">

                <div className="flex">

                  <span className="flex items-center rounded-l-md border border-r-0 border-gray-300 bg-gray-100 px-3 text-gray-500">
                    $
                  </span>

                  <input
                    type="number"
                    min="0"
                    step="0.25"
                    value={
                      customPrice
                    }
                    onChange={(
                      event
                    ) =>
                      setCustomPrice(
                        event.target
                          .value
                      )
                    }
                    className="w-full border border-gray-300 px-3 py-2.5 outline-none focus:border-blue-500"
                  />

                  <span className="flex items-center rounded-r-md border border-l-0 border-gray-300 bg-gray-100 px-3 text-sm text-gray-500">
                    /ft²
                  </span>
                </div>
              </CalculatorField>
            )}


            <CalculatorField label="Waste Allowance">

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
                  (typical)
                </option>

                <option value="15">
                  15%
                </option>

                <option value="20">
                  20%
                </option>
              </select>
            </CalculatorField>


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
                className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 text-gray-600 hover:bg-gray-100"
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
            <div className="flex min-h-[360px] flex-col items-center justify-center text-center">

              <Calculator className="mb-4 h-12 w-12 text-gray-300" />

              <h3 className="font-semibold text-gray-800">
                Enter your roof details
              </h3>

              <p className="mt-2 max-w-sm text-sm leading-6 text-gray-500">
                Add the approximate house footprint, pitch and roofing material, then calculate an estimated replacement range.
              </p>
            </div>
          ) : (
            <div>

              <p className="text-sm font-medium uppercase tracking-wide text-gray-400">
                Estimated Replacement Cost
              </p>

              <div className="mt-2 text-3xl font-bold text-green-700 md:text-4xl">

                {result.minCost ===
                result.maxCost
                  ? formatMoney(
                      result.minCost
                    )
                  : `${formatMoney(
                      result.minCost
                    )} – ${formatMoney(
                      result.maxCost
                    )}`}
              </div>


              <p className="mt-2 text-sm text-gray-500">
                Approximate national planning range, not a contractor quote.
              </p>


              <div className="mt-7 grid gap-3 sm:grid-cols-2">

                <ResultCard
                  label="Estimated Roof Area"
                  value={`${formatNumber(
                    result.roofArea
                  )} ft²`}
                />

                <ResultCard
                  label="Area With Waste"
                  value={`${formatNumber(
                    result.projectArea
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
                  value={result.pitchFactor.toFixed(
                    3
                  )}
                />

                <ResultCard
                  label="Roof Angle"
                  value={`${result.angle.toFixed(
                    1
                  )}°`}
                />

                <ResultCard
                  label="Estimated Rate"
                  value={
                    result.minRate ===
                    result.maxRate
                      ? `$${result.minRate.toFixed(
                          2
                        )}/ft²`
                      : `$${result.minRate.toFixed(
                          2
                        )}–$${result.maxRate.toFixed(
                          2
                        )}/ft²`
                  }
                />
              </div>


              <div className="mt-7 rounded-lg border border-blue-200 bg-blue-50 p-4">

                <p className="font-semibold text-blue-900">
                  Need an actual quote?
                </p>

                <p className="mt-1 text-sm leading-6 text-blue-800">
                  Real prices vary by location, roof complexity, tear-off requirements, decking condition, permits and contractor labor.
                </p>

                <a
                  href="/search?q=roof%20replacement"
                  className="mt-3 inline-flex rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                >
                  Find Roof Replacement Contractors
                </a>
              </div>
            </div>
          )}
        </div>
      </div>


      <div className="border-t border-gray-200 bg-yellow-50 px-5 py-3 text-xs leading-5 text-yellow-900">
        Estimates are for preliminary budgeting only. Complex roof shapes, multiple stories, structural repairs, local labor rates and permits can materially change the final cost.
      </div>
    </div>
  )
}


function CalculatorField({
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