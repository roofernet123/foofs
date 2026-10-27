// app/api/compare/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { and, eq, inArray } from 'drizzle-orm'
import { getDb } from '@/lib/db'
import { contractors } from '@/lib/db/schema'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const MAX_COMPARE = 3

function parseIds(value: string | null): number[] {
  if (!value) return []

  const parsed = value
    .split(',')
    .map((part) => part.trim())
    .filter((part) => /^\d+$/.test(part))
    .map(Number)
    .filter((id) => Number.isSafeInteger(id) && id > 0)

  return [...new Set(parsed)].slice(0, MAX_COMPARE)
}

export async function GET(request: NextRequest) {
  const ids = parseIds(request.nextUrl.searchParams.get('ids'))

  if (ids.length === 0) {
    return NextResponse.json(
      { contractors: [] },
      { headers: { 'Cache-Control': 'no-store' } }
    )
  }

  try {
    const db = getDb()

    const results = await db
      .select({
        id: contractors.id,
        name: contractors.name,
        slug: contractors.slug,
        description: contractors.description,
        address: contractors.address,
        city: contractors.city,
        state: contractors.state,
        stateAbbrev: contractors.state_abbrev,
        zipCode: contractors.zipCode,
        phone: contractors.phone,
        email: contractors.email,
        website: contractors.website,
        rating: contractors.rating,
        reviewCount: contractors.reviewCount,
        licenseNumber: contractors.licenseNumber,
        insuranceVerified: contractors.insuranceVerified,
        yearsInBusiness: contractors.yearsInBusiness,
        servicesOffered: contractors.servicesOffered,
        serviceAreas: contractors.serviceAreas,
        emergencyService: contractors.emergencyService,
        freeEstimates: contractors.freeEstimates,
        financingAvailable: contractors.financingAvailable,
        warrantyOffered: contractors.warrantyOffered,
        verified: contractors.verified,
        ownershipVerified: contractors.ownershipVerified,
        openingHours: contractors.openingHours,
        priceRange: contractors.priceRange,
        pricingNotes: contractors.pricingNotes,
        minimumJobPrice: contractors.minimumJobPrice,
        priceCurrency: contractors.priceCurrency,
        ownerUpdatedAt: contractors.ownerUpdatedAt,
        updatedAt: contractors.updatedAt,
      })
      .from(contractors)
      .where(
        and(
          inArray(contractors.id, ids),
          eq(contractors.published, true)
        )
      )

    const orderedResults = ids
      .map((id) =>
        results.find((contractor) => contractor.id === id)
      )
      .filter(
        (contractor): contractor is (typeof results)[number] =>
          Boolean(contractor)
      )

    return NextResponse.json(
      {
        contractors: orderedResults,
        requestedCount: ids.length,
        returnedCount: orderedResults.length,
      },
      {
        headers: {
          'Cache-Control': 'no-store, max-age=0',
        },
      }
    )
  } catch (error) {
    console.error('Comparison API error:', error)

    return NextResponse.json(
      { error: 'Unable to load contractor comparisons.' },
      { status: 500, headers: { 'Cache-Control': 'no-store' } }
    )
  }
}