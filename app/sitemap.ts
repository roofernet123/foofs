// app/sitemap.ts
import type { MetadataRoute } from 'next'
import { and, eq, sql } from 'drizzle-orm'

import { getDb } from '@/lib/db'
import { blogPosts, contractors } from '@/lib/db/schema'
import {
  roofingCategories,
  roofingProducts,
} from '@/data/roofing-products'
import { shouldIndexContractor } from '@/lib/contractorContent'
import { serviceGuides } from '@/lib/serviceGuides'
import {
  roofingTools,
} from '@/data/roofing-tools'

/**
 * Google accepts YYYY-MM-DD for sitemap lastmod values.
 *
 * PostgreSQL timestamps may be returned as:
 * 2026-08-21 20:36:43.569851
 *
 * Returning only the date avoids invalid timezone and fractional-second
 * formatting problems.
 */
function toSitemapDate(value: unknown): string | undefined {
  if (!value) return undefined

  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) return undefined

    return value.toISOString().slice(0, 10)
  }

  if (typeof value === 'string') {
    const trimmedValue = value.trim()

    if (!trimmedValue) return undefined

    const dateMatch = trimmedValue.match(/^(\d{4}-\d{2}-\d{2})/)

    if (dateMatch) {
      const candidate = dateMatch[1]
      const parsedDate = new Date(`${candidate}T00:00:00Z`)

      if (!Number.isNaN(parsedDate.getTime())) {
        return candidate
      }
    }

    const parsedDate = new Date(trimmedValue)

    if (!Number.isNaN(parsedDate.getTime())) {
      return parsedDate.toISOString().slice(0, 10)
    }
  }

  if (typeof value === 'number') {
    const parsedDate = new Date(value)

    if (!Number.isNaN(parsedDate.getTime())) {
      return parsedDate.toISOString().slice(0, 10)
    }
  }

  return undefined
}

function serializeOpeningHours(value: unknown): string | null {
  if (!value) return null

  if (typeof value === 'string') {
    return value
  }

  try {
    return JSON.stringify(value)
  } catch {
    return null
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const configuredBaseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || 'https://www.roofernet.com'

  const baseUrl = configuredBaseUrl.replace(/\/+$/, '')
  const db = getDb()

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${baseUrl}/services`,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/blog`,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/about`,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/contact`,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/privacy`,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms`,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/states`,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/how-roofernet-works`,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
  ]

  const toolPages: MetadataRoute.Sitemap = [
  {
    url: `${baseUrl}/tools`,
    changeFrequency:
      'monthly',
    priority: 0.8,
  },

  ...roofingTools.map(
    (tool) => ({
      url:
        `${baseUrl}/tools/${tool.slug}`,

      changeFrequency:
        'monthly' as const,

      priority:
        tool.featured
          ? 0.9
          : 0.8,
    })
  ),
]

  try {
    /*
     * State pages
     */
    const stateList = await db
      .select({
        stateSlug: contractors.stateSlug,
        latestUpdate: sql<Date | string | null>`
          MAX(${contractors.updatedAt})
        `,
      })
      .from(contractors)
      .where(
        and(
          eq(contractors.published, true),
          sql`${contractors.stateSlug} IS NOT NULL`,
          sql`BTRIM(${contractors.stateSlug}) <> ''`
        )
      )
      .groupBy(contractors.stateSlug)

    const statePages: MetadataRoute.Sitemap = stateList
      .filter(
        (
          state
        ): state is typeof state & {
          stateSlug: string
        } => Boolean(state.stateSlug)
      )
      .map((state) => {
        const lastModified = toSitemapDate(state.latestUpdate)

        return {
          url: `${baseUrl}/${state.stateSlug}`,
          ...(lastModified ? { lastModified } : {}),
          changeFrequency: 'weekly' as const,
          priority: 0.9,
        }
      })

    /*
     * Do not include ?city= URLs.
     *
     * City selections are filtered versions of state pages rather than
     * independent canonical pages.
     */
    const contractorList = await db
      .select({
        name: contractors.name,
        slug: contractors.slug,
        stateSlug: contractors.stateSlug,
        updatedAt: contractors.updatedAt,
        description: contractors.description,
        address: contractors.address,
        phone: contractors.phone,
        website: contractors.website,
        city: contractors.city,
        state: contractors.state,
        stateAbbrev: contractors.state_abbrev,
        latitude: contractors.latitude,
        longitude: contractors.longitude,
        openingHours: contractors.openingHours,
        servicesOffered: contractors.servicesOffered,
        rating: contractors.rating,
        reviewCount: contractors.reviewCount,
        verified: contractors.verified,
        licenseNumber: contractors.licenseNumber,
        insuranceVerified: contractors.insuranceVerified,
      })
      .from(contractors)
      .where(
        and(
          eq(contractors.published, true),
          sql`${contractors.slug} IS NOT NULL`,
          sql`BTRIM(${contractors.slug}) <> ''`,
          sql`${contractors.stateSlug} IS NOT NULL`,
          sql`BTRIM(${contractors.stateSlug}) <> ''`
        )
      )

    const contractorPages: MetadataRoute.Sitemap = contractorList
      .filter((contractor) =>
        shouldIndexContractor({
          name: contractor.name,
          description: contractor.description,
          address: contractor.address,
          phone: contractor.phone,
          website: contractor.website,
          city: contractor.city,
          state: contractor.state,
          stateAbbrev: contractor.stateAbbrev,
          latitude: contractor.latitude,
          longitude: contractor.longitude,
          openingHours: serializeOpeningHours(
            contractor.openingHours
          ),
          servicesOffered: contractor.servicesOffered,
          rating: contractor.rating,
          reviewCount: contractor.reviewCount,
          verified: contractor.verified,
          licenseNumber: contractor.licenseNumber,
          insuranceVerified: contractor.insuranceVerified,
        })
      )
      .map((contractor) => {
        const lastModified = toSitemapDate(contractor.updatedAt)

        return {
          url: `${baseUrl}/${contractor.stateSlug}/${contractor.slug}`,
          ...(lastModified ? { lastModified } : {}),
          changeFrequency: 'monthly' as const,
          priority: 0.7,
        }
      })

    /*
     * Blog articles
     */
    const blogList = await db
      .select({
        slug: blogPosts.slug,
        publishedAt: blogPosts.publishedAt,
      })
      .from(blogPosts)
      .where(eq(blogPosts.published, true))

    const blogPages: MetadataRoute.Sitemap = blogList
      .filter(
        (
          post
        ): post is typeof post & {
          slug: string
        } => Boolean(post.slug)
      )
      .map((post) => {
        const lastModified = toSitemapDate(post.publishedAt)

        return {
          url: `${baseUrl}/blog/${post.slug}`,
          ...(lastModified ? { lastModified } : {}),
          changeFrequency: 'monthly' as const,
          priority: 0.7,
        }
      })

    /*
     * Roofing product pages
     */
    const productPages: MetadataRoute.Sitemap =
      roofingProducts.map((product) => {
        const productDate =
          'lastModified' in product
            ? toSitemapDate(product.lastModified)
            : undefined

        return {
          url: `${baseUrl}/roofing-products/product/${product.slug}`,
          ...(productDate ? { lastModified: productDate } : {}),
          changeFrequency: 'monthly' as const,
          priority: 0.6,
        }
      })

    /*
     * Roofing product category pages
     */
    const categoryPages: MetadataRoute.Sitemap =
      roofingCategories.map((category) => ({
        url: `${baseUrl}/roofing-products/${category.slug}`,
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      }))

    /*
     * Service guide pages
     */
    const serviceGuidePages: MetadataRoute.Sitemap = Object.keys(
      serviceGuides
    ).map((slug) => ({
      url: `${baseUrl}/services/${slug}`,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    }))

    return [
      ...staticPages,
      ...toolPages,
      ...statePages,
      ...contractorPages,
      ...blogPages,
      ...productPages,
      ...categoryPages,
      ...serviceGuidePages,
    ]
  } catch (error) {
    console.error('Error generating sitemap:', error)

    return staticPages
  }
}