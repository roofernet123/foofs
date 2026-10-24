// app/api/submissions/[id]/route.ts

import {
  NextRequest,
  NextResponse,
} from 'next/server'

import {
  revalidatePath,
} from 'next/cache'

import {
  and,
  eq,
  sql,
} from 'drizzle-orm'

import { getDb } from '@/lib/db'

import {
  businessSubmissions,
  contractors,
} from '@/lib/db/schema'

import {
  businessSubmissionMedia,
  contractorMedia,
  contractorUsers,
} from '@/lib/db/ownerSchema'

import {
  getCurrentUser,
  isAdmin,
} from '@/lib/admin'

import {
  createAdminClient,
} from '@/lib/supabase/admin'


function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}


async function requireAdmin() {
  if (!(await isAdmin())) {
    return null
  }

  return getCurrentUser()
}


// ============================================================
// GET ONE SUBMISSION + PRIVATE PHOTO PREVIEWS
// ============================================================

export async function GET(
  request: NextRequest,
  {
    params,
  }: {
    params: Promise<{
      id: string
    }>
  }
) {
  const adminUser =
    await requireAdmin()

  if (!adminUser) {
    return NextResponse.json(
      {
        error: 'Unauthorized',
      },
      {
        status: 401,
      }
    )
  }

  const { id } =
    await params

  const submissionId =
    Number(id)

  if (
    !Number.isInteger(
      submissionId
    ) ||
    submissionId <= 0
  ) {
    return NextResponse.json(
      {
        error:
          'Invalid submission ID',
      },
      {
        status: 400,
      }
    )
  }

  try {
    const db = getDb()

    const [submission] =
      await db
        .select()
        .from(
          businessSubmissions
        )
        .where(
          eq(
            businessSubmissions.id,
            submissionId
          )
        )
        .limit(1)

    if (!submission) {
      return NextResponse.json(
        {
          error:
            'Submission not found',
        },
        {
          status: 404,
        }
      )
    }

    const mediaRows =
      await db
        .select()
        .from(
          businessSubmissionMedia
        )
        .where(
          eq(
            businessSubmissionMedia.submissionId,
            submissionId
          )
        )

    const adminSupabase =
      createAdminClient()

    const media =
      await Promise.all(
        mediaRows.map(
          async (item) => {
            const {
              data,
              error,
            } =
              await adminSupabase.storage
                .from(
                  'contractor-media'
                )
                .createSignedUrl(
                  item.storagePath,
                  60 * 30
                )

            if (error) {
              console.error(
                'Submission media signed URL error:',
                {
                  mediaId:
                    item.id,

                  path:
                    item.storagePath,

                  error,
                }
              )
            }

            return {
              ...item,

              signedUrl:
                data?.signedUrl ||
                null,
            }
          }
        )
      )

    return NextResponse.json({
      submission,
      media,
    })
  } catch (error) {
    console.error(
      'Error fetching submission:',
      error
    )

    return NextResponse.json(
      {
        error:
          'Failed to fetch submission',
      },
      {
        status: 500,
      }
    )
  }
}


// ============================================================
// APPROVE / REJECT / REOPEN
// ============================================================

export async function PATCH(
  request: NextRequest,
  {
    params,
  }: {
    params: Promise<{
      id: string
    }>
  }
) {
  const adminUser =
    await requireAdmin()

  if (!adminUser) {
    return NextResponse.json(
      {
        error: 'Unauthorized',
      },
      {
        status: 401,
      }
    )
  }

  const { id } =
    await params

  const submissionId =
    Number(id)

  if (
    !Number.isInteger(
      submissionId
    ) ||
    submissionId <= 0
  ) {
    return NextResponse.json(
      {
        error:
          'Invalid submission ID',
      },
      {
        status: 400,
      }
    )
  }

  try {
    const body =
      await request.json()

    const status =
      String(
        body.status || ''
      )

    const adminNotes =
      String(
        body.adminNotes || ''
      ).trim() || null

    if (
      ![
        'approved',
        'rejected',
        'pending',
      ].includes(status)
    ) {
      return NextResponse.json(
        {
          error:
            'Invalid status',
        },
        {
          status: 400,
        }
      )
    }

    const db = getDb()

    const [submission] =
      await db
        .select()
        .from(
          businessSubmissions
        )
        .where(
          eq(
            businessSubmissions.id,
            submissionId
          )
        )
        .limit(1)

    if (!submission) {
      return NextResponse.json(
        {
          error:
            'Submission not found',
        },
        {
          status: 404,
        }
      )
    }


    // ========================================================
    // ALREADY APPROVED
    // ========================================================

    if (
      submission.status ===
        'approved' &&
      submission.approvedContractorId
    ) {
      if (
        status ===
        'approved'
      ) {
        return NextResponse.json({
          success: true,

          alreadyProcessed:
            true,

          contractorId:
            submission.approvedContractorId,
        })
      }

      return NextResponse.json(
        {
          error:
            'This submission has already created a contractor listing and cannot be reopened or rejected.',
        },
        {
          status: 409,
        }
      )
    }


    // ========================================================
    // REJECT / REOPEN
    // ========================================================

    if (
      status === 'rejected' ||
      status === 'pending'
    ) {
      const [updated] =
        await db
          .update(
            businessSubmissions
          )
          .set({
            status,

            adminNotes,

            reviewedBy:
              adminUser.id,

            reviewedAt:
              new Date(),

            updatedAt:
              new Date(),
          })
          .where(
            eq(
              businessSubmissions.id,
              submissionId
            )
          )
          .returning()

      return NextResponse.json({
        success: true,
        submission:
          updated,
      })
    }


    // ========================================================
    // APPROVAL VALIDATION
    // ========================================================

    if (
      !submission.businessName
    ) {
      return NextResponse.json(
        {
          error:
            'Business name is missing.',
        },
        {
          status: 400,
        }
      )
    }

    if (
      !submission.city ||
      !submission.state ||
      !submission.stateAbbrev
    ) {
      return NextResponse.json(
        {
          error:
            'City and state are required before this business can be published.',
        },
        {
          status: 400,
        }
      )
    }


    // ========================================================
    // DUPLICATE CHECK
    // ========================================================

    const [
      existingContractor,
    ] =
      await db
        .select({
          id:
            contractors.id,

          name:
            contractors.name,
        })
        .from(contractors)
        .where(
          and(
            sql`
              lower(trim(${contractors.name}))
              =
              ${submission.businessName
                .trim()
                .toLowerCase()}
            `,

            sql`
              lower(trim(${contractors.city}))
              =
              ${submission.city
                .trim()
                .toLowerCase()}
            `,

            eq(
              contractors.state_abbrev,
              submission.stateAbbrev
            )
          )
        )
        .limit(1)

    if (existingContractor) {
      return NextResponse.json(
        {
          error:
            'A matching contractor already exists in RooferNet. Do not publish this as a duplicate.',

          contractorId:
            existingContractor.id,
        },
        {
          status: 409,
        }
      )
    }


    // ========================================================
    // GENERATE LOCATION + BUSINESS SLUGS
    // ========================================================

    const stateSlug =
      slugify(
        submission.state
      )

    const citySlug =
      slugify(
        submission.city
      )

    const baseSlug =
      slugify(
        submission.businessName
      )

    if (!baseSlug) {
      return NextResponse.json(
        {
          error:
            'Unable to generate a valid business slug.',
        },
        {
          status: 400,
        }
      )
    }

    let contractorSlug =
      baseSlug

    const [
      slugCollision,
    ] =
      await db
        .select({
          id:
            contractors.id,
        })
        .from(contractors)
        .where(
          and(
            eq(
              contractors.stateSlug,
              stateSlug
            ),

            eq(
              contractors.slug,
              contractorSlug
            )
          )
        )
        .limit(1)

    if (slugCollision) {
      contractorSlug =
        `${baseSlug}-${submissionId}`
    }


    // ========================================================
    // GET SUBMISSION PHOTOS
    // ========================================================

    const submissionMedia =
      await db
        .select()
        .from(
          businessSubmissionMedia
        )
        .where(
          eq(
            businessSubmissionMedia.submissionId,
            submission.id
          )
        )


    // ========================================================
    // ONE TRANSACTION FOR COMPLETE APPROVAL
    // ========================================================

    const result =
      await db.transaction(
        async (tx) => {

          // ----------------------------------------------------
          // CREATE CONTRACTOR
          // ----------------------------------------------------

          const [contractor] =
            await tx
              .insert(
                contractors
              )
              .values({
                name:
                  submission.businessName,

                slug:
                  contractorSlug,

                description:
                  submission.description,

                address:
                  submission.address,

                zipCode:
                  submission.zipCode,

                phone:
                  submission.phone,

                email:
                  submission.email,

                website:
                  submission.website,

                city:
                  submission.city,

                citySlug,

                state:
                  submission.state,

                stateSlug,

                state_abbrev:
                  submission.stateAbbrev,

                latitude:
                  submission.latitude,

                longitude:
                  submission.longitude,

                licenseNumber:
                  submission.licenseNumber,

                yearsInBusiness:
                  submission.yearsInBusiness,

                servicesOffered:
                  submission.servicesOffered ||
                  [],

                serviceAreas:
                  submission.serviceAreas ||
                  [],

                emergencyService:
                  Boolean(
                    submission.emergencyService
                  ),

                freeEstimates:
                  Boolean(
                    submission.freeEstimates
                  ),

                financingAvailable:
                  Boolean(
                    submission.financingAvailable
                  ),

                warrantyOffered:
                  Boolean(
                    submission.warrantyOffered
                  ),

                openingHours:
                  submission.openingHours,

                priceRange:
                  submission.priceRange,

                pricingNotes:
                  submission.pricingNotes,

                minimumJobPrice:
                  submission.minimumJobPrice,

                priceCurrency:
                  submission.priceCurrency ||
                  'USD',

                published:
                  true,

                verified:
                  false,

                ownershipVerified:
                  false,

                ownerUpdatedAt:
                  new Date(),

                updatedAt:
                  new Date(),
              })
              .returning()


          // ----------------------------------------------------
          // USER MAY MANAGE THE NEW LISTING
          // ----------------------------------------------------

          if (
            submission.userId
          ) {
            await tx
              .insert(
                contractorUsers
              )
              .values({
                contractorId:
                  contractor.id,

                userId:
                  submission.userId,

                userEmail:
                  submission.submittedByEmail,

                role:
                  'owner',

                status:
                  'active',

                verifiedAt:
                  null,
              })
              .onConflictDoUpdate({
                target: [
                  contractorUsers.contractorId,
                  contractorUsers.userId,
                ],

                set: {
                  userEmail:
                    submission.submittedByEmail,

                  role:
                    'owner',

                  status:
                    'active',
                },
              })
          }


          // ----------------------------------------------------
          // PROMOTE SUBMITTED PHOTOS
          // ----------------------------------------------------

          if (
            submissionMedia.length >
            0
          ) {
            await tx
              .insert(
                contractorMedia
              )
              .values(
                submissionMedia.map(
                  (media) => ({
                    contractorId:
                      contractor.id,

                    storagePath:
                      media.storagePath,

                    mediaType:
                      media.mediaType ||
                      'gallery',

                    altText:
                      media.altText,

                    caption:
                      media.caption,

                    sortOrder:
                      0,

                    status:
                      'approved',

                    uploadedBy:
                      submission.userId,

                    reviewedBy:
                      adminUser.id,

                    reviewedAt:
                      new Date(),
                  })
                )
              )
          }


          // ----------------------------------------------------
          // MARK SUBMISSION APPROVED
          // ----------------------------------------------------

          const [
            updatedSubmission,
          ] =
            await tx
              .update(
                businessSubmissions
              )
              .set({
                status:
                  'approved',

                approvedContractorId:
                  contractor.id,

                adminNotes,

                reviewedBy:
                  adminUser.id,

                reviewedAt:
                  new Date(),

                updatedAt:
                  new Date(),
              })
              .where(
                eq(
                  businessSubmissions.id,
                  submission.id
                )
              )
              .returning()

          return {
            contractor,

            submission:
              updatedSubmission,
          }
        }
      )


    // ========================================================
    // REVALIDATION
    // ========================================================

    revalidatePath(
      `/${stateSlug}/${contractorSlug}`
    )

    revalidatePath(
      `/${stateSlug}`
    )

    revalidatePath(
      '/dashboard'
    )

    revalidatePath(
      '/admin/submissions'
    )


    return NextResponse.json({
      success: true,

      contractorId:
        result.contractor.id,

      contractorSlug:
        result.contractor.slug,

      submission:
        result.submission,

      promotedMedia:
        submissionMedia.length,
    })
  } catch (error) {
    console.error(
      'Error updating submission:',
      error
    )

    return NextResponse.json(
      {
        error:
          process.env.NODE_ENV ===
            'development' &&
          error instanceof Error
            ? error.message
            : 'Failed to update submission',
      },
      {
        status: 500,
      }
    )
  }
}