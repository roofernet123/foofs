'use client'

import {
  useMemo,
  useState,
} from 'react'

import {
  CheckCircle,
  Image as ImageIcon,
  Plus,
  Save,
  Trash2,
  Upload,
  X,
} from 'lucide-react'

import {
  calculateProfileCompleteness,
  EditableContractorProfile,
} from '@/lib/contractorProfile'


interface MediaItem {
  id: number
  mediaType: string | null
  altText: string | null
  caption: string | null
  status: string | null
  signedUrl: string | null
  adminNotes?: string | null
}

interface Props {
  contractorId: number

  contractorName: string

  initialProfile:
    EditableContractorProfile

  initialMedia:
    MediaItem[]

  hasPendingUpdate:
    boolean
}


function TagInput({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string
  value: string[]
  onChange: (
    value: string[]
  ) => void
  placeholder: string
}) {
  const [input, setInput] =
    useState('')

  function add() {
    const cleaned =
      input
        .trim()
        .replace(/\s+/g, ' ')

    if (!cleaned) {
      return
    }

    const exists =
      value.some(
        (item) =>
          item.toLowerCase() ===
          cleaned.toLowerCase()
      )

    if (!exists) {
      onChange([
        ...value,
        cleaned,
      ])
    }

    setInput('')
  }

  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-gray-700">
        {label}
      </label>

      <div className="mb-2 flex flex-wrap gap-2">
        {value.map(
          (item) => (
            <span
              key={item}
              className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-3 py-1 text-sm text-blue-700"
            >
              {item}

              <button
                type="button"
                onClick={() =>
                  onChange(
                    value.filter(
                      (valueItem) =>
                        valueItem !==
                        item
                    )
                  )
                }
                className="rounded-full hover:bg-blue-100"
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
          onKeyDown={(
            event
          ) => {
            if (
              event.key ===
                'Enter' ||
              event.key === ','
            ) {
              event.preventDefault()
              add()
            }
          }}
          placeholder={
            placeholder
          }
          className="flex-1 rounded-lg border border-gray-300 px-3 py-2"
        />

        <button
          type="button"
          onClick={add}
          className="inline-flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-2 text-sm hover:bg-gray-50"
        >
          <Plus className="h-4 w-4" />
          Add
        </button>
      </div>
    </div>
  )
}


export function BusinessProfileEditor({
  contractorId,
  contractorName,
  initialProfile,
  initialMedia,
  hasPendingUpdate,
}: Props) {
  const [profile, setProfile] =
    useState(
      initialProfile
    )

  const [media, setMedia] =
    useState(
      initialMedia
    )

  const [saving, setSaving] =
    useState(false)

  const [
    saveMessage,
    setSaveMessage,
  ] =
    useState<string | null>(
      null
    )

  const [
    saveError,
    setSaveError,
  ] =
    useState<string | null>(
      null
    )

  const [
    mediaFile,
    setMediaFile,
  ] =
    useState<File | null>(
      null
    )

  const [
    mediaType,
    setMediaType,
  ] =
    useState('gallery')

  const [
    mediaAlt,
    setMediaAlt,
  ] =
    useState('')

  const [
    mediaCaption,
    setMediaCaption,
  ] =
    useState('')

  const [
    uploading,
    setUploading,
  ] =
    useState(false)

  const approvedMediaCount =
    media.filter(
      (item) =>
        item.status ===
        'approved'
    ).length

  const completeness =
    useMemo(
      () =>
        calculateProfileCompleteness(
          profile,
          approvedMediaCount
        ),
      [
        profile,
        approvedMediaCount,
      ]
    )


  async function saveProfile() {
    setSaving(true)

    setSaveMessage(null)
    setSaveError(null)

    try {
      const response =
        await fetch(
          '/api/contractor-updates',
          {
            method: 'POST',

            headers: {
              'Content-Type':
                'application/json',
            },

            body:
              JSON.stringify({
                contractorId,

                changes:
                  profile,
              }),
          }
        )

      const data =
        await response.json()

      if (!response.ok) {
        throw new Error(
          data.error ||
            'Failed to submit update'
        )
      }

      setSaveMessage(
        data.replaced
          ? 'Your pending update has been replaced with the latest version.'
          : 'Your profile update has been submitted for review.'
      )
    } catch (error) {
      setSaveError(
        error instanceof Error
          ? error.message
          : 'Failed to save profile'
      )
    } finally {
      setSaving(false)
    }
  }


  async function uploadMedia() {
    if (!mediaFile) {
      return
    }

    setUploading(true)

    setSaveError(null)

    try {
      const body =
        new FormData()

      body.append(
        'contractorId',
        String(contractorId)
      )

      body.append(
        'file',
        mediaFile
      )

      body.append(
        'mediaType',
        mediaType
      )

      body.append(
        'altText',
        mediaAlt
      )

      body.append(
        'caption',
        mediaCaption
      )

      const response =
        await fetch(
          '/api/contractor-media',
          {
            method: 'POST',
            body,
          }
        )

      const data =
        await response.json()

      if (!response.ok) {
        throw new Error(
          data.error ||
            'Image upload failed'
        )
      }

      setMedia(
        (current) => [
          data.media,
          ...current,
        ]
      )

      setMediaFile(null)
      setMediaAlt('')
      setMediaCaption('')

      setSaveMessage(
        'Image uploaded and sent for approval.'
      )
    } catch (error) {
      setSaveError(
        error instanceof Error
          ? error.message
          : 'Image upload failed'
      )
    } finally {
      setUploading(false)
    }
  }


  async function deleteMedia(
    mediaId: number
  ) {
    if (
      !confirm(
        'Remove this image?'
      )
    ) {
      return
    }

    const response =
      await fetch(
        `/api/contractor-media/${mediaId}`,
        {
          method: 'DELETE',
        }
      )

    if (response.ok) {
      setMedia(
        (current) =>
          current.filter(
            (item) =>
              item.id !==
              mediaId
          )
      )
    }
  }


  return (
    <div className="space-y-8">

      {hasPendingUpdate && (
        <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-800">
          You already have a
          profile update awaiting
          review. Saving again
          replaces that pending
          request with your latest
          changes.
        </div>
      )}

      {saveMessage && (
        <div className="flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 p-4 text-green-700">
          <CheckCircle className="h-5 w-5" />
          {saveMessage}
        </div>
      )}

      {saveError && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
          {saveError}
        </div>
      )}

      <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">
              Profile completeness
            </h2>

            <p className="text-sm text-gray-500">
              Complete profiles give
              customers more useful
              information.
            </p>
          </div>

          <span className="text-3xl font-bold text-blue-600">
            {completeness.score}%
          </span>
        </div>

        <div className="h-3 overflow-hidden rounded-full bg-gray-100">
          <div
            className="h-full bg-blue-600 transition-all"
            style={{
              width:
                `${completeness.score}%`,
            }}
          />
        </div>

        {completeness.missing.length >
          0 && (
          <p className="mt-3 text-sm text-gray-500">
            Still useful to add:{' '}
            {completeness.missing.join(
              ', '
            )}
          </p>
        )}
      </section>


      <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-5 text-xl font-bold">
          Business profile
        </h2>

        <div className="space-y-5">

          <div>
            <label className="mb-1 block text-sm font-medium">
              Description
            </label>

            <textarea
              rows={7}
              maxLength={4000}
              value={
                profile.description ||
                ''
              }
              onChange={(event) =>
                setProfile({
                  ...profile,
                  description:
                    event.target.value,
                })
              }
              placeholder={`Tell customers about ${contractorName}, your experience, specialties and what makes the business different.`}
              className="w-full rounded-lg border border-gray-300 px-4 py-3"
            />

            <p className="mt-1 text-xs text-gray-400">
              Aim for at least 100–200
              useful, original words.
            </p>
          </div>


          <div className="grid gap-4 md:grid-cols-2">
            <Field
              label="Phone"
              value={
                profile.phone || ''
              }
              onChange={(value) =>
                setProfile({
                  ...profile,
                  phone: value,
                })
              }
            />

            <Field
              label="Business email"
              type="email"
              value={
                profile.email || ''
              }
              onChange={(value) =>
                setProfile({
                  ...profile,
                  email: value,
                })
              }
            />

            <Field
              label="Website"
              value={
                profile.website || ''
              }
              onChange={(value) =>
                setProfile({
                  ...profile,
                  website: value,
                })
              }
            />

            <Field
              label="ZIP code"
              value={
                profile.zipCode || ''
              }
              onChange={(value) =>
                setProfile({
                  ...profile,
                  zipCode: value,
                })
              }
            />
          </div>


          <div>
            <label className="mb-1 block text-sm font-medium">
              Address
            </label>

            <textarea
              rows={2}
              value={
                profile.address || ''
              }
              onChange={(event) =>
                setProfile({
                  ...profile,
                  address:
                    event.target.value,
                })
              }
              className="w-full rounded-lg border border-gray-300 px-4 py-3"
            />
          </div>
        </div>
      </section>


      <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-5 text-xl font-bold">
          Credentials
        </h2>

        <div className="grid gap-4 md:grid-cols-2">
          <Field
            label="License number"
            value={
              profile.licenseNumber ||
              ''
            }
            onChange={(value) =>
              setProfile({
                ...profile,
                licenseNumber:
                  value,
              })
            }
          />

          <Field
            label="Years in business"
            type="number"
            value={
              profile.yearsInBusiness !=
              null
                ? String(
                    profile.yearsInBusiness
                  )
                : ''
            }
            onChange={(value) =>
              setProfile({
                ...profile,

                yearsInBusiness:
                  value === ''
                    ? null
                    : Number(
                        value
                      ),
              })
            }
          />
        </div>

        <p className="mt-3 text-xs text-gray-500">
          License numbers are
          owner-supplied. RooferNet
          should display verification
          separately if independently
          checked.
        </p>
      </section>


      <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-5 text-xl font-bold">
          Services and coverage
        </h2>

        <div className="space-y-6">
          <TagInput
            label="Services offered"
            value={
              profile.servicesOffered
            }
            onChange={(value) =>
              setProfile({
                ...profile,
                servicesOffered:
                  value,
              })
            }
            placeholder="e.g. Roof leak repair"
          />

          <TagInput
            label="Service areas"
            value={
              profile.serviceAreas
            }
            onChange={(value) =>
              setProfile({
                ...profile,
                serviceAreas:
                  value,
              })
            }
            placeholder="e.g. Austin, TX"
          />
        </div>
      </section>


      <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-5 text-xl font-bold">
          Customer options
        </h2>

        <div className="grid gap-3 md:grid-cols-2">
          <Toggle
            label="Emergency service"
            checked={
              profile.emergencyService
            }
            onChange={(value) =>
              setProfile({
                ...profile,
                emergencyService:
                  value,
              })
            }
          />

          <Toggle
            label="Free estimates"
            checked={
              profile.freeEstimates
            }
            onChange={(value) =>
              setProfile({
                ...profile,
                freeEstimates:
                  value,
              })
            }
          />

          <Toggle
            label="Financing available"
            checked={
              profile.financingAvailable
            }
            onChange={(value) =>
              setProfile({
                ...profile,
                financingAvailable:
                  value,
              })
            }
          />

          <Toggle
            label="Warranty offered"
            checked={
              profile.warrantyOffered
            }
            onChange={(value) =>
              setProfile({
                ...profile,
                warrantyOffered:
                  value,
              })
            }
          />
        </div>
      </section>


      <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-5 text-xl font-bold">
          Opening hours
        </h2>

        <textarea
          rows={8}
          value={
            profile.openingHours ||
            ''
          }
          onChange={(event) =>
            setProfile({
              ...profile,
              openingHours:
                event.target.value,
            })
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
      </section>


      <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-5 text-xl font-bold">
          Pricing guidance
        </h2>

        <div className="grid gap-4 md:grid-cols-3">

          <div>
            <label className="mb-1 block text-sm font-medium">
              Price range
            </label>

            <select
              value={
                profile.priceRange ||
                'Varies'
              }
              onChange={(event) =>
                setProfile({
                  ...profile,
                  priceRange:
                    event.target.value,
                })
              }
              className="w-full rounded-lg border border-gray-300 px-4 py-2"
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
            label="Minimum job price"
            type="number"
            value={
              profile.minimumJobPrice ||
              ''
            }
            onChange={(value) =>
              setProfile({
                ...profile,
                minimumJobPrice:
                  value,
              })
            }
          />

          <Field
            label="Currency"
            value={
              profile.priceCurrency ||
              'USD'
            }
            onChange={(value) =>
              setProfile({
                ...profile,
                priceCurrency:
                  value
                    .toUpperCase()
                    .slice(0, 3),
              })
            }
          />
        </div>

        <div className="mt-4">
          <label className="mb-1 block text-sm font-medium">
            Pricing notes
          </label>

          <textarea
            rows={4}
            maxLength={1500}
            value={
              profile.pricingNotes ||
              ''
            }
            onChange={(event) =>
              setProfile({
                ...profile,
                pricingNotes:
                  event.target.value,
              })
            }
            placeholder="Example: Free estimates. Service calls from $150. Final pricing depends on roof size, materials and damage."
            className="w-full rounded-lg border border-gray-300 px-4 py-3"
          />
        </div>
      </section>


      <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-5">
          <h2 className="text-xl font-bold">
            Business photos
          </h2>

          <p className="text-sm text-gray-500">
            Photos are reviewed before
            appearing publicly.
          </p>
        </div>

        <div className="grid gap-4 rounded-xl bg-gray-50 p-4 md:grid-cols-2">

          <input
            type="file"
            accept=".jpg,.jpeg,.png,.webp"
            onChange={(event) =>
              setMediaFile(
                event.target
                  .files?.[0] ||
                  null
              )
            }
            className="rounded-lg border border-gray-300 bg-white p-2"
          />

          <select
            value={mediaType}
            onChange={(event) =>
              setMediaType(
                event.target.value
              )
            }
            className="rounded-lg border border-gray-300 bg-white px-3 py-2"
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
            value={mediaAlt}
            onChange={(event) =>
              setMediaAlt(
                event.target.value
              )
            }
            placeholder="Image description / alt text"
            className="rounded-lg border border-gray-300 bg-white px-3 py-2"
          />

          <input
            value={
              mediaCaption
            }
            onChange={(event) =>
              setMediaCaption(
                event.target.value
              )
            }
            placeholder="Optional caption"
            className="rounded-lg border border-gray-300 bg-white px-3 py-2"
          />

          <button
            type="button"
            disabled={
              !mediaFile ||
              uploading
            }
            onClick={
              uploadMedia
            }
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-3 text-white hover:bg-blue-700 disabled:opacity-50 md:col-span-2"
          >
            <Upload className="h-4 w-4" />

            {uploading
              ? 'Uploading...'
              : 'Upload photo'}
          </button>
        </div>


        {media.length === 0 ? (
          <div className="mt-5 rounded-xl border border-dashed border-gray-300 p-8 text-center text-gray-500">
            <ImageIcon className="mx-auto mb-2 h-8 w-8" />
            No business photos yet.
          </div>
        ) : (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {media.map(
              (item) => (
                <div
                  key={item.id}
                  className="overflow-hidden rounded-xl border border-gray-200 bg-white"
                >
                  {item.signedUrl ? (
                    <img
                      src={
                        item.signedUrl
                      }
                      alt={
                        item.altText ||
                        contractorName
                      }
                      className="h-44 w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-44 items-center justify-center bg-gray-100">
                      <ImageIcon className="h-8 w-8 text-gray-300" />
                    </div>
                  )}

                  <div className="p-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-medium capitalize">
                        {item.mediaType ||
                          'gallery'}
                      </span>

                      <span
                        className={`rounded-full px-2 py-0.5 text-xs ${
                          item.status ===
                          'approved'
                            ? 'bg-green-100 text-green-700'
                            : item.status ===
                                'rejected'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-yellow-100 text-yellow-700'
                        }`}
                      >
                        {item.status}
                      </span>
                    </div>

                    {item.caption && (
                      <p className="mt-2 text-xs text-gray-500">
                        {
                          item.caption
                        }
                      </p>
                    )}

                    {item.adminNotes && (
                      <p className="mt-2 text-xs text-red-600">
                        {
                          item.adminNotes
                        }
                      </p>
                    )}

                    <button
                      type="button"
                      onClick={() =>
                        deleteMedia(
                          item.id
                        )
                      }
                      className="mt-3 inline-flex items-center gap-1 text-xs text-red-600 hover:underline"
                    >
                      <Trash2 className="h-3 w-3" />
                      Remove
                    </button>
                  </div>
                </div>
              )
            )}
          </div>
        )}
      </section>


      <div className="sticky bottom-4 flex justify-end">
        <button
          type="button"
          onClick={saveProfile}
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white shadow-lg hover:bg-blue-700 disabled:opacity-50"
        >
          <Save className="h-5 w-5" />

          {saving
            ? 'Submitting...'
            : 'Submit profile update'}
        </button>
      </div>
    </div>
  )
}


function Field({
  label,
  value,
  onChange,
  type = 'text',
}: {
  label: string
  value: string
  onChange: (
    value: string
  ) => void
  type?: string
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium">
        {label}
      </label>

      <input
        type={type}
        value={value}
        onChange={(event) =>
          onChange(
            event.target.value
          )
        }
        className="w-full rounded-lg border border-gray-300 px-4 py-2"
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
  onChange: (
    checked: boolean
  ) => void
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