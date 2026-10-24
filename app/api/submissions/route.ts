// app/api/submissions/route.ts

import { NextResponse } from 'next/server'

import {
  and,
  desc,
  eq,
  sql,
} from 'drizzle-orm'

import { getDb } from '@/lib/db'

import {
  businessSubmissions,
  contractors,
} from '@/lib/db/schema'

import { createClient } from '@/lib/supabase/server'
import { isAdmin } from '@/lib/admin'

import {
  sanitizeProfileChanges,
} from '@/lib/contractorProfile'


export async function GET(
  request: Request
) {
  if (!(await isAdmin())) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  try {
    const { searchParams } =
      new URL(request.url)

    const status =
      searchParams.get('status')

    const limit = Math.min(
      Math.max(
        Number(
          searchParams.get('limit') ||
            50
        ),
        1
      ),
      100
    )

    const offset = Math.max(
      Number(
        searchParams.get('offset') ||
          0
      ),
      0
    )

    const db = getDb()

    const conditions = []

    if (
      status &&
      status !== 'all'
    ) {
      conditions.push(
        eq(
          businessSubmissions.status,
          status
        )
      )
    }

    const submissions =
      await db
        .select()
        .from(businessSubmissions)
        .where(
          conditions.length
            ? and(...conditions)
            : undefined
        )
        .orderBy(
          desc(
            businessSubmissions.createdAt
          )
        )
        .limit(limit)
        .offset(offset)

    const [total] =
      await db
        .select({
          count:
            sql<number>`COUNT(*)`,
        })
        .from(businessSubmissions)
        .where(
          conditions.length
            ? and(...conditions)
            : undefined
        )

    return NextResponse.json({
      submissions,
      total:
        Number(total?.count || 0),
      limit,
      offset,
    })
  } catch (error) {
    console.error(
      'Error fetching submissions:',
      error
    )

    return NextResponse.json(
      {
        error:
          'Failed to fetch submissions',
      },
      {
        status: 500,
      }
    )
  }
}


export async function POST(
  request: Request
) {
  try {
    const supabase =
      await createClient()

    const {
      data: { user },
      error: authError,
    } =
      await supabase.auth.getUser()

    if (
      authError ||
      !user ||
      !user.email
    ) {
      return NextResponse.json(
        {
          error:
            'You must be signed in to add a business.',
        },
        {
          status: 401,
        }
      )
    }

    const body =
      await request.json()

    if (!body.attested) {
      return NextResponse.json(
        {
          error:
            'You must confirm that you are authorized to submit this business.',
        },
        {
          status: 400,
        }
      )
    }

    const businessName =
      String(
        body.businessName || ''
      ).trim()

    const city =
      String(
        body.city || ''
      ).trim()

    const state =
      String(
        body.state || ''
      ).trim()

    const stateAbbrev =
      String(
        body.stateAbbrev || ''
      )
        .trim()
        .toUpperCase()

    if (!businessName) {
      return NextResponse.json(
        {
          error:
            'Business name is required.',
        },
        {
          status: 400,
        }
      )
    }

    if (
      !city ||
      !state ||
      !/^[A-Z]{2}$/.test(
        stateAbbrev
      )
    ) {
      return NextResponse.json(
        {
          error:
            'A valid city and state are required.',
        },
        {
          status: 400,
        }
      )
    }

    let profile

    try {
      profile =
        sanitizeProfileChanges(
          body
        )
    } catch (error) {
      return NextResponse.json(
        {
          error:
            error instanceof Error
              ? error.message
              : 'Invalid business information.',
        },
        {
          status: 400,
        }
      )
    }

    if (
      !profile.description ||
      profile.description.length < 80
    ) {
      return NextResponse.json(
        {
          error:
            'Business description must be at least 80 characters.',
        },
        {
          status: 400,
        }
      )
    }

    if (
      !profile.servicesOffered?.length
    ) {
      return NextResponse.json(
        {
          error:
            'Please add at least one roofing service.',
        },
        {
          status: 400,
        }
      )
    }

    if (
      !profile.phone &&
      !profile.email &&
      !profile.website
    ) {
      return NextResponse.json(
        {
          error:
            'Provide at least a phone number, email address, or website.',
        },
        {
          status: 400,
        }
      )
    }

    const db = getDb()

    // Existing published listing
    const [existingContractor] =
      await db
        .select({
          id: contractors.id,
        })
        .from(contractors)
        .where(
          and(
            sql`
              lower(trim(${contractors.name}))
              =
              ${businessName.toLowerCase()}
            `,

            sql`
              lower(trim(${contractors.city}))
              =
              ${city.toLowerCase()}
            `,

            eq(
              contractors.state_abbrev,
              stateAbbrev
            )
          )
        )
        .limit(1)

    if (existingContractor) {
      return NextResponse.json(
        {
          error:
            'This business already appears in RooferNet. Please claim the existing listing instead.',

          contractorId:
            existingContractor.id,
        },
        {
          status: 409,
        }
      )
    }

    // Existing active submission
    const [existingSubmission] =
      await db
        .select({
          id:
            businessSubmissions.id,

          status:
            businessSubmissions.status,
        })
        .from(
          businessSubmissions
        )
        .where(
          and(
            sql`
              lower(trim(${businessSubmissions.businessName}))
              =
              ${businessName.toLowerCase()}
            `,

            eq(
              businessSubmissions.stateAbbrev,
              stateAbbrev
            ),

            sql`
              ${businessSubmissions.status}
              IN ('pending', 'processing')
            `
          )
        )
        .limit(1)

    if (existingSubmission) {
      return NextResponse.json(
        {
          error:
            existingSubmission.status ===
            'processing'
              ? 'This business already has an upload in progress.'
              : 'This business already has a pending submission.',
        },
        {
          status: 409,
        }
      )
    }

    const submittedByName =
      user.user_metadata?.full_name ||
      user.user_metadata?.name ||
      user.email.split('@')[0]

    const [submission] =
      await db
        .insert(
          businessSubmissions
        )
        .values({
          businessName,

          address:
            profile.address,

          city,

          state,

          stateAbbrev,

          zipCode:
            profile.zipCode,

          phone:
            profile.phone,

          email:
            profile.email,

          website:
            profile.website,

          description:
            profile.description,

          servicesOffered:
            profile.servicesOffered ||
            [],

          serviceAreas:
            profile.serviceAreas ||
            [],

          licenseNumber:
            profile.licenseNumber,

          yearsInBusiness:
            profile.yearsInBusiness,

          emergencyService:
            Boolean(
              profile.emergencyService
            ),

          freeEstimates:
            Boolean(
              profile.freeEstimates
            ),

          financingAvailable:
            Boolean(
              profile.financingAvailable
            ),

          warrantyOffered:
            Boolean(
              profile.warrantyOffered
            ),

          openingHours:
            profile.openingHours,

          priceRange:
            profile.priceRange,

          pricingNotes:
            profile.pricingNotes,

          minimumJobPrice:
            profile.minimumJobPrice,

          priceCurrency:
            profile.priceCurrency ||
            'USD',

          userId:
            user.id,

          submittedByEmail:
            user.email,

          submittedByName,

          // Not visible to admin approval
          // until uploads finish.
          status:
            'processing',
        })
        .returning()

    return NextResponse.json(
      {
        success: true,

        submissionId:
          submission.id,

        submission,
      },
      {
        status: 201,
      }
    )
  } catch (error) {
    console.error(
      'Error submitting business:',
      error
    )

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Failed to submit business',
      },
      {
        status: 500,
      }
    )
  }
}