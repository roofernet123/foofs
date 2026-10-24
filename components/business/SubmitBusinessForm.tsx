'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  createClient,
} from '@/lib/supabase/client'

import {
  Building,
  CheckCircle,
  FileText,
  Image as ImageIcon,
  Plus,
  Send,
  Trash2,
  X,
} from 'lucide-react'

const US_STATES = [
  ['AL', 'Alabama'],
  ['AK', 'Alaska'],
  ['AZ', 'Arizona'],
  ['AR', 'Arkansas'],
  ['CA', 'California'],
  ['CO', 'Colorado'],
  ['CT', 'Connecticut'],
  ['DE', 'Delaware'],
  ['FL', 'Florida'],
  ['GA', 'Georgia'],
  ['HI', 'Hawaii'],
  ['ID', 'Idaho'],
  ['IL', 'Illinois'],
  ['IN', 'Indiana'],
  ['IA', 'Iowa'],
  ['KS', 'Kansas'],
  ['KY', 'Kentucky'],
  ['LA', 'Louisiana'],
  ['ME', 'Maine'],
  ['MD', 'Maryland'],
  ['MA', 'Massachusetts'],
  ['MI', 'Michigan'],
  ['MN', 'Minnesota'],
  ['MS', 'Mississippi'],
  ['MO', 'Missouri'],
  ['MT', 'Montana'],
  ['NE', 'Nebraska'],
  ['NV', 'Nevada'],
  ['NH', 'New Hampshire'],
  ['NJ', 'New Jersey'],
  ['NM', 'New Mexico'],
  ['NY', 'New York'],
  ['NC', 'North Carolina'],
  ['ND', 'North Dakota'],
  ['OH', 'Ohio'],
  ['OK', 'Oklahoma'],
  ['OR', 'Oregon'],
  ['PA', 'Pennsylvania'],
  ['RI', 'Rhode Island'],
  ['SC', 'South Carolina'],
  ['SD', 'South Dakota'],
  ['TN', 'Tennessee'],
  ['TX', 'Texas'],
  ['UT', 'Utah'],
  ['VT', 'Vermont'],
  ['VA', 'Virginia'],
  ['WA', 'Washington'],
  ['WV', 'West Virginia'],
  ['WI', 'Wisconsin'],
  ['WY', 'Wyoming'],
  ['DC', 'District of Columbia'],
] as const

type PhotoDraft = {
  id: string
  file: File
  mediaType: string
  altText: string
  caption: string
}

export default function SubmitBusinessForm() {
  const router = useRouter()

  const [formData, setFormData] =
    useState({
      businessName: '',
      address: '',
      city: '',
      state: '',
      stateAbbrev: '',
      zipCode: '',

      phone: '',
      email: '',
      website: '',

      description: '',

      licenseNumber: '',
      yearsInBusiness: '',

      servicesOffered:
        [] as string[],

      serviceAreas:
        [] as string[],

      emergencyService: false,
      freeEstimates: false,
      financingAvailable: false,
      warrantyOffered: false,

      openingHours: '',

      priceRange: 'Varies',
      pricingNotes: '',
      minimumJobPrice: '',
      priceCurrency: 'USD',
    })

  const [supabase] =
  useState(() =>
    createClient()
  )

const [
  uploadStatus,
  setUploadStatus,
] =
  useState<string | null>(
    null
  )

  const [
    serviceInput,
    setServiceInput,
  ] = useState('')

  const [
    areaInput,
    setAreaInput,
  ] = useState('')

  const [photos, setPhotos] =
    useState<PhotoDraft[]>([])

  const [attested, setAttested] =
    useState(false)

  const [loading, setLoading] =
    useState(false)

  const [success, setSuccess] =
    useState(false)

  const [error, setError] =
    useState<string | null>(null)


  function updateField(
    field: keyof typeof formData,
    value: any
  ) {
    setFormData((current) => ({
      ...current,
      [field]: value,
    }))
  }

  function handleStateChange(
    abbreviation: string
  ) {
    const state =
      US_STATES.find(
        ([code]) =>
          code === abbreviation
      )

    setFormData((current) => ({
      ...current,
      stateAbbrev:
        abbreviation,
      state:
        state?.[1] || '',
    }))
  }

  function addService() {
    const value =
      serviceInput
        .trim()
        .replace(/\s+/g, ' ')

    if (!value) return

    if (
      !formData.servicesOffered.some(
        (item) =>
          item.toLowerCase() ===
          value.toLowerCase()
      )
    ) {
      updateField(
        'servicesOffered',
        [
          ...formData.servicesOffered,
          value,
        ]
      )
    }

    setServiceInput('')
  }

  function addArea() {
    const value =
      areaInput
        .trim()
        .replace(/\s+/g, ' ')

    if (!value) return

    if (
      !formData.serviceAreas.some(
        (item) =>
          item.toLowerCase() ===
          value.toLowerCase()
      )
    ) {
      updateField(
        'serviceAreas',
        [
          ...formData.serviceAreas,
          value,
        ]
      )
    }

    setAreaInput('')
  }

  function handlePhotos(
    event:
      React.ChangeEvent<HTMLInputElement>
  ) {
    const selected =
      Array.from(
        event.target.files || []
      )

    if (
      photos.length +
        selected.length >
      10
    ) {
      setError(
        'You can upload a maximum of 10 photos.'
      )
      return
    }

    const allowed = [
      'image/jpeg',
      'image/png',
      'image/webp',
    ]

    const next: PhotoDraft[] = []

    for (const file of selected) {
      if (
        !allowed.includes(
          file.type
        )
      ) {
        setError(
          `${file.name} is not a supported image type.`
        )
        continue
      }

      if (
        file.size >
        6 * 1024 * 1024
      ) {
        setError(
          `${file.name} exceeds the 6MB limit.`
        )
        continue
      }

      next.push({
        id:
          crypto.randomUUID(),

        file,

        mediaType:
          'gallery',

        altText:
          formData.businessName
            ? `${formData.businessName} business photo`
            : '',

        caption: '',
      })
    }

    setPhotos(
      (current) => [
        ...current,
        ...next,
      ]
    )

    event.target.value = ''
  }

  function updatePhoto(
    id: string,
    changes:
      Partial<PhotoDraft>
  ) {
    setPhotos(
      (current) =>
        current.map(
          (photo) =>
            photo.id === id
              ? {
                  ...photo,
                  ...changes,
                }
              : photo
        )
    )
  }

 async function handleSubmit(
  event: React.FormEvent
) {
  event.preventDefault()

  setError(null)
  setUploadStatus(null)

  if (
    !formData.businessName.trim()
  ) {
    setError(
      'Business name is required.'
    )
    return
  }

  if (
    !formData.city.trim() ||
    !formData.stateAbbrev
  ) {
    setError(
      'City and state are required.'
    )
    return
  }

  if (
    !formData.phone.trim() &&
    !formData.email.trim() &&
    !formData.website.trim()
  ) {
    setError(
      'Provide at least a phone number, business email, or website.'
    )
    return
  }

  if (
    formData.description
      .trim().length < 80
  ) {
    setError(
      'Please provide a business description of at least 80 characters.'
    )
    return
  }

  if (
    formData.servicesOffered
      .length === 0
  ) {
    setError(
      'Add at least one roofing service.'
    )
    return
  }

  if (!attested) {
    setError(
      'Please confirm that you are authorized to submit this business.'
    )
    return
  }

  setLoading(true)

  let submissionId:
    number | null = null

  const uploadedPaths:
    string[] = []

  try {
    // ======================================================
    // STEP 1:
    // Submit business information only.
    // Small JSON request — no photos.
    // ======================================================

    setUploadStatus(
      'Saving business information...'
    )

    const submissionResponse =
      await fetch(
        '/api/submissions',
        {
          method: 'POST',

          headers: {
            'Content-Type':
              'application/json',
          },

          body:
            JSON.stringify({
              ...formData,

              attested:
                true,
            }),
        }
      )

    const submissionData =
      await submissionResponse.json()

    if (
      !submissionResponse.ok
    ) {
      throw new Error(
        submissionData.error ||
          'Failed to create submission'
      )
    }

    submissionId =
      submissionData.submissionId

    if (!submissionId) {
      throw new Error(
        'Submission ID was not returned.'
      )
    }


    // ======================================================
    // STEP 2:
    // Upload photos DIRECTLY to Supabase.
    // Image bytes never pass through Next.js.
    // ======================================================

    for (
      let index = 0;
      index <
      photos.length;
      index++
    ) {
      const photo =
        photos[index]

      setUploadStatus(
        `Uploading photo ${index + 1} of ${photos.length}...`
      )


      // Ask RooferNet for a signed upload token.
      const tokenResponse =
        await fetch(
          `/api/submissions/${submissionId}/upload-url`,
          {
            method:
              'POST',

            headers: {
              'Content-Type':
                'application/json',
            },

            body:
              JSON.stringify({
                filename:
                  photo.file.name,

                contentType:
                  photo.file.type,

                size:
                  photo.file.size,
              }),
          }
        )

      const tokenData =
        await tokenResponse.json()

      if (
        !tokenResponse.ok
      ) {
        throw new Error(
          tokenData.error ||
            `Could not prepare ${photo.file.name}`
        )
      }

      const storagePath =
        tokenData.path

      const token =
        tokenData.token


      // Upload directly from browser → Supabase Storage.
      const {
        error:
          uploadError,
      } =
        await supabase.storage
          .from(
            'contractor-media'
          )
          .uploadToSignedUrl(
            storagePath,
            token,
            photo.file,
            {
              contentType:
                photo.file.type,

              cacheControl:
                '3600',
            }
          )

      if (uploadError) {
        throw new Error(
          `Failed to upload ${photo.file.name}: ${uploadError.message}`
        )
      }

      uploadedPaths.push(
        storagePath
      )


      // Register metadata in RooferNet DB.
      const mediaResponse =
        await fetch(
          `/api/submissions/${submissionId}/media`,
          {
            method:
              'POST',

            headers: {
              'Content-Type':
                'application/json',
            },

            body:
              JSON.stringify({
                storagePath,

                mediaType:
                  photo.mediaType,

                altText:
                  photo.altText,

                caption:
                  photo.caption,
              }),
          }
        )

      const mediaData =
        await mediaResponse.json()

      if (
        !mediaResponse.ok
      ) {
        throw new Error(
          mediaData.error ||
            `Could not register ${photo.file.name}`
        )
      }
    }


    // ======================================================
    // STEP 3:
    // Everything succeeded.
    // Move processing → pending.
    // ======================================================

    setUploadStatus(
      'Finalizing submission...'
    )

    const finalizeResponse =
      await fetch(
        `/api/submissions/${submissionId}/finalize`,
        {
          method:
            'POST',
        }
      )

    const finalizeData =
      await finalizeResponse.json()

    if (
      !finalizeResponse.ok
    ) {
      throw new Error(
        finalizeData.error ||
          'Failed to finalize submission'
      )
    }


    setUploadStatus(null)

    setSuccess(true)

    setTimeout(() => {
      router.push(
        '/dashboard'
      )

      router.refresh()
    }, 1800)
  } catch (error) {
    console.error(
      'Submit business error:',
      error
    )


    // ======================================================
    // CLEANUP
    //
    // If one photo fails halfway through, remove the
    // incomplete submission and any uploaded images.
    // ======================================================

    if (submissionId) {
      try {
        await fetch(
          `/api/submissions/${submissionId}/finalize`,
          {
            method:
              'DELETE',

            headers: {
              'Content-Type':
                'application/json',
            },

            body:
              JSON.stringify({
                extraPaths:
                  uploadedPaths,
              }),
          }
        )
      } catch (
        cleanupError
      ) {
        console.error(
          'Submission cleanup error:',
          cleanupError
        )
      }
    }

    setUploadStatus(null)

    setError(
      error instanceof Error
        ? error.message
        : 'Failed to submit business.'
    )
  } finally {
    setLoading(false)
  }
}

  if (success) {
    return (
      <div className="rounded-xl border border-green-200 bg-green-50 p-8 text-center">
        <CheckCircle className="mx-auto mb-4 h-16 w-16 text-green-500" />

        <h2 className="text-2xl font-bold text-green-800">
          Business Submitted
        </h2>

        <p className="mt-2 text-green-700">
          Your complete business
          profile has been sent for
          review.
        </p>

        <p className="mt-2 text-sm text-green-600">
          Once approved, it will be
          published and added to your
          dashboard.
        </p>
      </div>
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto max-w-3xl space-y-8"
    >
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* BASIC INFORMATION */}
      <Section
        title="Business Information"
        icon={
          <Building className="h-5 w-5 text-blue-600" />
        }
      >
        <Field
          label="Business Name"
          required
          value={
            formData.businessName
          }
          onChange={(value) =>
            updateField(
              'businessName',
              value
            )
          }
        />

        <Field
          label="Street Address"
          value={
            formData.address
          }
          onChange={(value) =>
            updateField(
              'address',
              value
            )
          }
        />

        <div className="grid gap-4 md:grid-cols-3">
          <Field
            label="City"
            required
            value={
              formData.city
            }
            onChange={(value) =>
              updateField(
                'city',
                value
              )
            }
          />

          <div>
            <label className="mb-1 block text-sm font-medium">
              State *
            </label>

            <select
              required
              value={
                formData.stateAbbrev
              }
              onChange={(event) =>
                handleStateChange(
                  event.target.value
                )
              }
              className="w-full rounded-lg border border-gray-300 px-4 py-3"
            >
              <option value="">
                Select state
              </option>

              {US_STATES.map(
                ([code, name]) => (
                  <option
                    key={code}
                    value={code}
                  >
                    {name}
                  </option>
                )
              )}
            </select>
          </div>

          <Field
            label="ZIP Code"
            value={
              formData.zipCode
            }
            onChange={(value) =>
              updateField(
                'zipCode',
                value
              )
            }
          />
        </div>
      </Section>

      {/* CONTACT */}
      <Section title="Contact Information">
        <div className="grid gap-4 md:grid-cols-2">
          <Field
            label="Phone"
            value={
              formData.phone
            }
            onChange={(value) =>
              updateField(
                'phone',
                value
              )
            }
          />

          <Field
            label="Business Email"
            type="email"
            value={
              formData.email
            }
            onChange={(value) =>
              updateField(
                'email',
                value
              )
            }
          />
        </div>

        <Field
          label="Website"
          value={
            formData.website
          }
          placeholder="https://example.com"
          onChange={(value) =>
            updateField(
              'website',
              value
            )
          }
        />
      </Section>

      {/* DESCRIPTION */}
      <Section
        title="Business Description"
        icon={
          <FileText className="h-5 w-5 text-blue-600" />
        }
      >
        <textarea
          required
          minLength={80}
          maxLength={4000}
          rows={7}
          value={
            formData.description
          }
          onChange={(event) =>
            updateField(
              'description',
              event.target.value
            )
          }
          placeholder="Tell customers about the company, roofing experience, specialties and what makes the business different."
          className="w-full rounded-lg border border-gray-300 px-4 py-3"
        />

        <div className="text-right text-xs text-gray-400">
          {
            formData.description
              .length
          }
          /4000
        </div>
      </Section>

      {/* CREDENTIALS */}
      <Section title="Credentials & Experience">
        <div className="grid gap-4 md:grid-cols-2">
          <Field
            label="License Number"
            value={
              formData.licenseNumber
            }
            onChange={(value) =>
              updateField(
                'licenseNumber',
                value
              )
            }
          />

          <Field
            label="Years in Business"
            type="number"
            value={
              formData.yearsInBusiness
            }
            onChange={(value) =>
              updateField(
                'yearsInBusiness',
                value
              )
            }
          />
        </div>

        <p className="text-xs text-gray-500">
          Enter licensing information
          where applicable. RooferNet
          can distinguish owner-supplied
          licensing from independently
          verified licensing.
        </p>
      </Section>

      {/* SERVICES */}
      <Section title="Services Offered">
        <TagEditor
          values={
            formData.servicesOffered
          }
          input={
            serviceInput
          }
          setInput={
            setServiceInput
          }
          onAdd={
            addService
          }
          onRemove={(index) =>
            updateField(
              'servicesOffered',
              formData.servicesOffered.filter(
                (_, i) =>
                  i !== index
              )
            )
          }
          placeholder="e.g. Roof Leak Repair"
        />

        <div className="flex flex-wrap gap-2">
          {[
            'Roof Repair',
            'Roof Leak Repair',
            'Roof Replacement',
            'Emergency Roofing',
            'Metal Roofing',
            'Commercial Roofing',
            'Roof Inspection',
            'Storm Damage Repair',
          ].map(
            (service) => (
              <button
                key={service}
                type="button"
                onClick={() => {
                  if (
                    !formData.servicesOffered.includes(
                      service
                    )
                  ) {
                    updateField(
                      'servicesOffered',
                      [
                        ...formData.servicesOffered,
                        service,
                      ]
                    )
                  }
                }}
                className="rounded-full border border-gray-200 px-3 py-1 text-xs hover:border-blue-300 hover:bg-blue-50"
              >
                + {service}
              </button>
            )
          )}
        </div>
      </Section>

      {/* SERVICE AREAS */}
      <Section title="Service Areas">
        <TagEditor
          values={
            formData.serviceAreas
          }
          input={areaInput}
          setInput={
            setAreaInput
          }
          onAdd={addArea}
          onRemove={(index) =>
            updateField(
              'serviceAreas',
              formData.serviceAreas.filter(
                (_, i) =>
                  i !== index
              )
            )
          }
          placeholder="e.g. Austin, TX"
        />
      </Section>

      {/* OPTIONS */}
      <Section title="Customer Options">
        <div className="grid gap-3 md:grid-cols-2">
          <Toggle
            label="Emergency Service"
            checked={
              formData.emergencyService
            }
            onChange={(value) =>
              updateField(
                'emergencyService',
                value
              )
            }
          />

          <Toggle
            label="Free Estimates"
            checked={
              formData.freeEstimates
            }
            onChange={(value) =>
              updateField(
                'freeEstimates',
                value
              )
            }
          />

          <Toggle
            label="Financing Available"
            checked={
              formData.financingAvailable
            }
            onChange={(value) =>
              updateField(
                'financingAvailable',
                value
              )
            }
          />

          <Toggle
            label="Warranty Offered"
            checked={
              formData.warrantyOffered
            }
            onChange={(value) =>
              updateField(
                'warrantyOffered',
                value
              )
            }
          />
        </div>
      </Section>

      {/* HOURS */}
      <Section title="Opening Hours">
        <textarea
          rows={8}
          value={
            formData.openingHours
          }
          onChange={(event) =>
            updateField(
              'openingHours',
              event.target.value
            )
          }
          placeholder={`Monday: 08:00 - 17:00
                Tuesday: 08:00 - 17:00
                Wednesday: 08:00 - 17:00
                Thursday: 08:00 - 17:00
                Friday: 08:00 - 17:00
                Saturday: 09:00 - 13:00
                Sunday: Closed`}
          className="w-full rounded-lg border border-gray-300 px-4 py-3 font-mono text-sm"
        />
      </Section>

      {/* PRICING */}
      <Section title="Pricing Information">
        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <label className="mb-1 block text-sm font-medium">
              General Price Range
            </label>

            <select
              value={
                formData.priceRange
              }
              onChange={(event) =>
                updateField(
                  'priceRange',
                  event.target.value
                )
              }
              className="w-full rounded-lg border border-gray-300 px-4 py-3"
            >
              <option value="Varies">
                Varies by project
              </option>
              <option value="$">
                $
              </option>
              <option value="$$">
                $$
              </option>
              <option value="$$$">
                $$$
              </option>
              <option value="$$$$">
                $$$$
              </option>
            </select>
          </div>

          <Field
            label="Minimum Job Price"
            type="number"
            value={
              formData.minimumJobPrice
            }
            onChange={(value) =>
              updateField(
                'minimumJobPrice',
                value
              )
            }
          />

          <Field
            label="Currency"
            value={
              formData.priceCurrency
            }
            onChange={(value) =>
              updateField(
                'priceCurrency',
                value
                  .toUpperCase()
                  .slice(0, 3)
              )
            }
          />
        </div>

        <textarea
          rows={4}
          maxLength={1500}
          value={
            formData.pricingNotes
          }
          onChange={(event) =>
            updateField(
              'pricingNotes',
              event.target.value
            )
          }
          placeholder="Example: Free estimates. Service calls start from $150. Final prices depend on roof size, materials and damage."
          className="w-full rounded-lg border border-gray-300 px-4 py-3"
        />
      </Section>

      {/* PHOTOS */}
      <Section
        title="Business Photos"
        icon={
          <ImageIcon className="h-5 w-5 text-blue-600" />
        }
      >
        <p className="text-sm text-gray-500">
          Add up to 10 photos. JPG, PNG
          and WebP are supported, with
          a 6MB maximum per image.
        </p>

        <input
          type="file"
          multiple
          accept=".jpg,.jpeg,.png,.webp"
          onChange={
            handlePhotos
          }
          className="w-full rounded-lg border border-gray-300 p-3"
        />

        <div className="space-y-4">
          {photos.map(
            (photo) => (
              <div
                key={photo.id}
                className="rounded-lg border border-gray-200 p-4"
              >
                <div className="mb-3 flex items-center justify-between gap-4">
                  <div>
                    <p className="font-medium">
                      {
                        photo.file
                          .name
                      }
                    </p>

                    <p className="text-xs text-gray-400">
                      {(
                        photo.file
                          .size /
                        1024 /
                        1024
                      ).toFixed(
                        1
                      )}{' '}
                      MB
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setPhotos(
                        (
                          current
                        ) =>
                          current.filter(
                            (
                              item
                            ) =>
                              item.id !==
                              photo.id
                          )
                      )
                    }
                    className="text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  <select
                    value={
                      photo.mediaType
                    }
                    onChange={(
                      event
                    ) =>
                      updatePhoto(
                        photo.id,
                        {
                          mediaType:
                            event
                              .target
                              .value,
                        }
                      )
                    }
                    className="rounded-lg border border-gray-300 px-3 py-2"
                  >
                    <option value="gallery">
                      Gallery
                    </option>
                    <option value="logo">
                      Logo
                    </option>
                    <option value="project">
                      Project
                    </option>
                    <option value="team">
                      Team
                    </option>
                    <option value="vehicle">
                      Vehicle
                    </option>
                    <option value="office">
                      Office
                    </option>
                  </select>

                  <input
                    value={
                      photo.altText
                    }
                    onChange={(
                      event
                    ) =>
                      updatePhoto(
                        photo.id,
                        {
                          altText:
                            event
                              .target
                              .value,
                        }
                      )
                    }
                    placeholder="Image description"
                    className="rounded-lg border border-gray-300 px-3 py-2"
                  />
                </div>

                <input
                  value={
                    photo.caption
                  }
                  onChange={(
                    event
                  ) =>
                    updatePhoto(
                      photo.id,
                      {
                        caption:
                          event
                            .target
                            .value,
                      }
                    )
                  }
                  placeholder="Optional caption"
                  className="mt-3 w-full rounded-lg border border-gray-300 px-3 py-2"
                />
              </div>
            )
          )}
        </div>
      </Section>

      <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-gray-200 bg-gray-50 p-4">
        <input
          type="checkbox"
          checked={attested}
          onChange={(event) =>
            setAttested(
              event.target.checked
            )
          }
          className="mt-1 h-4 w-4"
        />

        <span className="text-sm text-gray-600">
          I confirm that I am
          authorized to submit this
          business and that the
          information provided is
          accurate to the best of my
          knowledge.
        </span>
      </label>

      <button
        type="submit"
        disabled={loading}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-4 font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
      >
        <Send className="h-5 w-5" />

        {loading
          ? uploadStatus || 'Submitting Business...'
          : 'Submit Complete Business Profile'}
      </button>
    </form>
  )
}

function Section({
  title,
  icon,
  children,
}: {
  title: string
  icon?: React.ReactNode
  children:
    React.ReactNode
}) {
  return (
    <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-center gap-2">
        {icon}

        <h2 className="text-xl font-semibold">
          {title}
        </h2>
      </div>

      <div className="space-y-4">
        {children}
      </div>
    </section>
  )
}

function Field({
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
  required = false,
}: {
  label: string
  value: string
  onChange:
    (value: string) => void
  type?: string
  placeholder?: string
  required?: boolean
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium">
        {label}
        {required ? ' *' : ''}
      </label>

      <input
        type={type}
        required={required}
        value={value}
        placeholder={
          placeholder
        }
        onChange={(event) =>
          onChange(
            event.target.value
          )
        }
        className="w-full rounded-lg border border-gray-300 px-4 py-3"
      />
    </div>
  )
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string
  checked: boolean
  onChange:
    (value: boolean) => void
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between rounded-lg border border-gray-200 p-4">
      <span className="font-medium">
        {label}
      </span>

      <input
        type="checkbox"
        checked={checked}
        onChange={(event) =>
          onChange(
            event.target.checked
          )
        }
        className="h-5 w-5"
      />
    </label>
  )
}

function TagEditor({
  values,
  input,
  setInput,
  onAdd,
  onRemove,
  placeholder,
}: {
  values: string[]
  input: string
  setInput:
    (value: string) => void
  onAdd: () => void
  onRemove:
    (index: number) => void
  placeholder: string
}) {
  return (
    <>
      <div className="flex flex-wrap gap-2">
        {values.map(
          (value, index) => (
            <span
              key={`${value}-${index}`}
              className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-3 py-1 text-sm text-blue-700"
            >
              {value}

              <button
                type="button"
                onClick={() =>
                  onRemove(
                    index
                  )
                }
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )
        )}
      </div>

      <div className="flex gap-2">
        <input
          value={input}
          onChange={(event) =>
            setInput(
              event.target.value
            )
          }
          onKeyDown={(event) => {
            if (
              event.key ===
                'Enter' ||
              event.key === ','
            ) {
              event.preventDefault()
              onAdd()
            }
          }}
          placeholder={
            placeholder
          }
          className="flex-1 rounded-lg border border-gray-300 px-4 py-3"
        />

        <button
          type="button"
          onClick={onAdd}
          className="inline-flex items-center gap-1 rounded-lg border border-gray-300 px-4 py-3 hover:bg-gray-50"
        >
          <Plus className="h-4 w-4" />
          Add
        </button>
      </div>
    </>
  )
}