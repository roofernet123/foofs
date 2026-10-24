// lib/roofCalculations.ts

export function roofPitchFactor(
  rise: number,
  run = 12
) {
  if (run <= 0) return 1

  return Math.sqrt(
    1 + Math.pow(rise / run, 2)
  )
}

export function roofPitchAngle(
  rise: number,
  run = 12
) {
  if (run <= 0) return 0

  return (
    Math.atan(rise / run) *
    (180 / Math.PI)
  )
}

export function estimateRoofArea({
  baseArea,
  pitchRise,
  eaveOverhang = 0,
}: {
  baseArea: number
  pitchRise: number
  eaveOverhang?: number
}) {
  if (
    !Number.isFinite(baseArea) ||
    baseArea <= 0
  ) {
    return 0
  }

  /*
   * With only total house footprint area available,
   * eave adjustment has to make an assumption about
   * the footprint shape.
   *
   * We approximate the footprint as square:
   *
   * side = sqrt(base area)
   *
   * Users with exact roof measurements should use
   * the Roof Area Calculator instead.
   */
  const side =
    Math.sqrt(baseArea)

  const footprintWithEaves =
    Math.pow(
      side +
        Math.max(
          eaveOverhang,
          0
        ) *
          2,
      2
    )

  const factor =
    roofPitchFactor(
      pitchRise,
      12
    )

  return (
    footprintWithEaves *
    factor
  )
}

export function addWaste(
  area: number,
  wastePercent: number
) {
  return (
    area *
    (1 +
      Math.max(
        wastePercent,
        0
      ) /
        100)
  )
}

export function roofingSquares(
  area: number
) {
  return area / 100
}

export function formatNumber(
  value: number,
  digits = 0
) {
  return new Intl.NumberFormat(
    'en-US',
    {
      maximumFractionDigits:
        digits,
    }
  ).format(value)
}

export function formatMoney(
  value: number
) {
  return new Intl.NumberFormat(
    'en-US',
    {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits:
        0,
    }
  ).format(value)
}