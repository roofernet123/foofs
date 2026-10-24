export interface EditableContractorProfile {
  description: string | null

  address: string | null
  zipCode: string | null

  phone: string | null
  email: string | null
  website: string | null

  licenseNumber: string | null
  yearsInBusiness: number | null

  servicesOffered: string[]
  serviceAreas: string[]

  emergencyService: boolean
  freeEstimates: boolean
  financingAvailable: boolean
  warrantyOffered: boolean

  openingHours: string | null

  priceRange: string | null
  pricingNotes: string | null
  minimumJobPrice: string | null
  priceCurrency: string
}

export type ContractorProfileChanges =
  Partial<EditableContractorProfile>

export const EDITABLE_PROFILE_KEYS =
  [
    'description',

    'address',
    'zipCode',

    'phone',
    'email',
    'website',

    'licenseNumber',
    'yearsInBusiness',

    'servicesOffered',
    'serviceAreas',

    'emergencyService',
    'freeEstimates',
    'financingAvailable',
    'warrantyOffered',

    'openingHours',

    'priceRange',
    'pricingNotes',
    'minimumJobPrice',
    'priceCurrency',
  ] as const

function nullableString(
  value: unknown,
  maxLength: number
) {
  if (
    value === null ||
    value === undefined
  ) {
    return null
  }

  const cleaned = String(value).trim()

  if (!cleaned) {
    return null
  }

  if (cleaned.length > maxLength) {
    throw new Error(
      `Value exceeds maximum length of ${maxLength}`
    )
  }

  return cleaned
}

function cleanList(
  value: unknown,
  maxItems = 30,
  maxLength = 100
): string[] {
  if (!Array.isArray(value)) {
    return []
  }

  const seen = new Set<string>()
  const result: string[] = []

  for (const item of value) {
    const cleaned = String(item)
      .trim()
      .replace(/\s+/g, ' ')

    if (
      !cleaned ||
      cleaned.length > maxLength
    ) {
      continue
    }

    const key = cleaned.toLowerCase()

    if (seen.has(key)) {
      continue
    }

    seen.add(key)
    result.push(cleaned)

    if (result.length >= maxItems) {
      break
    }
  }

  return result
}

function cleanWebsite(
  value: unknown
): string | null {
  const cleaned =
    nullableString(value, 500)

  if (!cleaned) {
    return null
  }

  const withProtocol =
    /^https?:\/\//i.test(cleaned)
      ? cleaned
      : `https://${cleaned}`

  let url: URL

  try {
    url = new URL(withProtocol)
  } catch {
    throw new Error(
      'Please enter a valid website URL'
    )
  }

  if (
    url.protocol !== 'http:' &&
    url.protocol !== 'https:'
  ) {
    throw new Error(
      'Website must use HTTP or HTTPS'
    )
  }

  return url.toString()
}

function cleanEmail(
  value: unknown
): string | null {
  const cleaned =
    nullableString(value, 100)

  if (!cleaned) {
    return null
  }

  const valid =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
      cleaned
    )

  if (!valid) {
    throw new Error(
      'Please enter a valid email address'
    )
  }

  return cleaned.toLowerCase()
}

function cleanInteger(
  value: unknown,
  min: number,
  max: number
): number | null {
  if (
    value === null ||
    value === undefined ||
    value === ''
  ) {
    return null
  }

  const parsed = Number(value)

  if (
    !Number.isInteger(parsed) ||
    parsed < min ||
    parsed > max
  ) {
    throw new Error(
      `Value must be between ${min} and ${max}`
    )
  }

  return parsed
}

function cleanMoney(
  value: unknown
): string | null {
  if (
    value === null ||
    value === undefined ||
    value === ''
  ) {
    return null
  }

  const parsed = Number(value)

  if (
    !Number.isFinite(parsed) ||
    parsed < 0 ||
    parsed > 10000000
  ) {
    throw new Error(
      'Minimum job price is invalid'
    )
  }

  return parsed.toFixed(2)
}

function cleanCurrency(
  value: unknown
) {
  const currency =
    String(value || 'USD')
      .trim()
      .toUpperCase()

  if (!/^[A-Z]{3}$/.test(currency)) {
    throw new Error(
      'Currency must be a 3-letter code'
    )
  }

  return currency
}

export function sanitizeProfileChanges(
  input: unknown
): ContractorProfileChanges {
  if (
    !input ||
    typeof input !== 'object'
  ) {
    throw new Error(
      'Invalid profile update'
    )
  }

  const source =
    input as Record<string, unknown>

  const result:
    ContractorProfileChanges = {}

  if ('description' in source) {
    result.description =
      nullableString(
        source.description,
        4000
      )
  }

  if ('address' in source) {
    result.address =
      nullableString(
        source.address,
        1000
      )
  }

  if ('zipCode' in source) {
    result.zipCode =
      nullableString(
        source.zipCode,
        10
      )
  }

  if ('phone' in source) {
    result.phone =
      nullableString(
        source.phone,
        20
      )
  }

  if ('email' in source) {
    result.email =
      cleanEmail(source.email)
  }

  if ('website' in source) {
    result.website =
      cleanWebsite(source.website)
  }

  if ('licenseNumber' in source) {
    result.licenseNumber =
      nullableString(
        source.licenseNumber,
        50
      )
  }

  if ('yearsInBusiness' in source) {
    result.yearsInBusiness =
      cleanInteger(
        source.yearsInBusiness,
        0,
        200
      )
  }

  if ('servicesOffered' in source) {
    result.servicesOffered =
      cleanList(
        source.servicesOffered,
        30,
        100
      )
  }

  if ('serviceAreas' in source) {
    result.serviceAreas =
      cleanList(
        source.serviceAreas,
        50,
        100
      )
  }

  if ('emergencyService' in source) {
    result.emergencyService =
      Boolean(
        source.emergencyService
      )
  }

  if ('freeEstimates' in source) {
    result.freeEstimates =
      Boolean(
        source.freeEstimates
      )
  }

  if (
    'financingAvailable' in source
  ) {
    result.financingAvailable =
      Boolean(
        source.financingAvailable
      )
  }

  if ('warrantyOffered' in source) {
    result.warrantyOffered =
      Boolean(
        source.warrantyOffered
      )
  }

  if ('openingHours' in source) {
    result.openingHours =
      nullableString(
        source.openingHours,
        3000
      )
  }

  if ('priceRange' in source) {
    const priceRange =
      nullableString(
        source.priceRange,
        20
      )

    const allowed = [
      '$',
      '$$',
      '$$$',
      '$$$$',
      'Varies',
    ]

    if (
      priceRange &&
      !allowed.includes(priceRange)
    ) {
      throw new Error(
        'Invalid price range'
      )
    }

    result.priceRange =
      priceRange
  }

  if ('pricingNotes' in source) {
    result.pricingNotes =
      nullableString(
        source.pricingNotes,
        1500
      )
  }

  if (
    'minimumJobPrice' in source
  ) {
    result.minimumJobPrice =
      cleanMoney(
        source.minimumJobPrice
      )
  }

  if ('priceCurrency' in source) {
    result.priceCurrency =
      cleanCurrency(
        source.priceCurrency
      )
  }

  return result
}

export function contractorToEditableProfile(
  contractor: any
): EditableContractorProfile {
  return {
    description:
      contractor.description ?? null,

    address:
      contractor.address ?? null,

    zipCode:
      contractor.zipCode ?? null,

    phone:
      contractor.phone ?? null,

    email:
      contractor.email ?? null,

    website:
      contractor.website ?? null,

    licenseNumber:
      contractor.licenseNumber ?? null,

    yearsInBusiness:
      contractor.yearsInBusiness ?? null,

    servicesOffered:
      Array.isArray(
        contractor.servicesOffered
      )
        ? contractor.servicesOffered
        : [],

    serviceAreas:
      Array.isArray(
        contractor.serviceAreas
      )
        ? contractor.serviceAreas
        : [],

    emergencyService:
      Boolean(
        contractor.emergencyService
      ),

    freeEstimates:
      Boolean(
        contractor.freeEstimates
      ),

    financingAvailable:
      Boolean(
        contractor.financingAvailable
      ),

    warrantyOffered:
      Boolean(
        contractor.warrantyOffered
      ),

    openingHours:
      contractor.openingHours ?? null,

    priceRange:
      contractor.priceRange ?? null,

    pricingNotes:
      contractor.pricingNotes ?? null,

    minimumJobPrice:
      contractor.minimumJobPrice != null
        ? String(
            contractor.minimumJobPrice
          )
        : null,

    priceCurrency:
      contractor.priceCurrency ||
      'USD',
  }
}

function comparable(
  value: unknown
) {
  if (Array.isArray(value)) {
    return JSON.stringify(
      [...value]
        .map(String)
        .map((v) => v.trim())
        .sort((a, b) =>
          a.localeCompare(b)
        )
    )
  }

  if (
    value === null ||
    value === undefined ||
    value === ''
  ) {
    return ''
  }

  return JSON.stringify(value)
}

export function valuesEqual(
  a: unknown,
  b: unknown
) {
  return comparable(a) ===
    comparable(b)
}

export function diffProfile(
  current:
    EditableContractorProfile,
  requested:
    ContractorProfileChanges
) {
  const changes:
    Record<string, unknown> = {}

  const previousValues:
    Record<string, unknown> = {}

  for (
    const key of
      EDITABLE_PROFILE_KEYS
  ) {
    if (!(key in requested)) {
      continue
    }

    const next =
      requested[key]

    const before =
      current[key]

    if (
      !valuesEqual(
        before,
        next
      )
    ) {
      changes[key] = next
      previousValues[key] =
        before
    }
  }

  return {
    changes,
    previousValues,
  }
}

export function calculateProfileCompleteness(
  profile:
    Partial<EditableContractorProfile>,
  approvedMediaCount = 0
) {
  let score = 0

  const missing: string[] = []

  if (
    profile.description &&
    profile.description.length >= 80
  ) {
    score += 20
  } else {
    missing.push(
      'Business description'
    )
  }

  if (profile.phone) {
    score += 8
  } else {
    missing.push('Phone')
  }

  if (profile.email) {
    score += 7
  } else {
    missing.push('Business email')
  }

  if (profile.website) {
    score += 8
  } else {
    missing.push('Website')
  }

  if (profile.address) {
    score += 7
  } else {
    missing.push('Address')
  }

  if (profile.licenseNumber) {
    score += 8
  } else {
    missing.push('License number')
  }

  if (
    profile.yearsInBusiness != null
  ) {
    score += 6
  } else {
    missing.push(
      'Years in business'
    )
  }

  if (
    profile.servicesOffered?.length
  ) {
    score += 10
  } else {
    missing.push('Services')
  }

  if (
    profile.serviceAreas?.length
  ) {
    score += 8
  } else {
    missing.push(
      'Service areas'
    )
  }

  if (profile.openingHours) {
    score += 6
  } else {
    missing.push(
      'Opening hours'
    )
  }

  if (approvedMediaCount > 0) {
    score += 8
  } else {
    missing.push('Photos')
  }

  if (
    profile.priceRange ||
    profile.pricingNotes ||
    profile.minimumJobPrice
  ) {
    score += 4
  } else {
    missing.push(
      'Pricing information'
    )
  }

  return {
    score: Math.min(
      score,
      100
    ),
    missing,
  }
}