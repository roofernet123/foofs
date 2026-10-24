// lib/db/schema.ts
import { 
  pgTable, 
  serial, 
  text, 
  varchar, 
  numeric, 
  boolean, 
  timestamp, 
  jsonb, 
  integer,
  uniqueIndex,
  primaryKey,
  uuid
} from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import { FeaturedContractors } from '@/components/directory/FeaturedContractors'

export const adminUsers = pgTable('admin_users', {
  id: serial('id').primaryKey(),
  userId: varchar('user_id', { length: 255 }).notNull().unique(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  role: varchar('role', { length: 50 }).default('admin'),
  permissions: jsonb('permissions').$type<string[]>(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const contractors = pgTable('contractors', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 200 }).notNull(),
  slug: varchar('slug', { length: 200 }).notNull(),
  description: text('description'),
  address: text('address'),
  stateSlug: varchar('state_slug', { length: 100 }),
  latitude: numeric('latitude', { precision: 10, scale: 7 }),
  longitude: numeric('longitude', { precision: 10, scale: 7 }),
  city: text('city'),
  citySlug: varchar('city_slug', { length: 100 }),
  state: text('state'),
  state_abbrev: varchar('state_abbrev', { length: 10 }),
  zipCode: varchar('zip_code', { length: 10 }),
  phone: varchar('phone', { length: 20 }),
  email: varchar('email', { length: 100 }),
  website: varchar('website', { length: 200 }),
  rating: numeric('rating', { precision: 3, scale: 1 }),
  reviewCount: integer('review_count').default(0),
  licenseNumber: varchar('license_number', { length: 50 }),
  insuranceVerified: boolean('insurance_verified').default(false),
  yearsInBusiness: integer('years_in_business'),
  servicesOffered: jsonb('services_offered').$type<string[]>(),
  serviceAreas: jsonb('service_areas').$type<string[]>(),
  emergencyService: boolean('emergency_service').default(false),
  freeEstimates: boolean('free_estimates').default(false),
  financingAvailable: boolean('financing_available').default(false),
  warrantyOffered: boolean('warranty_offered').default(false),
  metaTitle: varchar('meta_title', { length: 160 }),
  metaDescription: text('meta_description'),
  featured: boolean('featured').default(false),
  featuredScope: varchar('featured_scope', { length: 10 }),
  verified: boolean('verified').default(false),
  published: boolean('published').default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  featuredUntil: timestamp('featured_until'),
  openingHours: text('opening_hours'),
  priceRange: varchar('price_range', {
  length: 20,
}),

pricingNotes: text('pricing_notes'),

minimumJobPrice: numeric(
  'minimum_job_price',
  {
    precision: 10,
    scale: 2,
  }
),

priceCurrency: varchar(
  'price_currency',
  {
    length: 3,
  }
).default('USD'),

ownerUpdatedAt: timestamp(
  'owner_updated_at'
),

ownershipVerified: boolean(
  'ownership_verified'
).default(false),
}, (table) => ({
  uniqueStateCitySlug: uniqueIndex('unique_state_city_slug').on(table.state, table.city, table.slug),
}))

export const contactSubmissions = pgTable('contact_submissions', {
   id: serial('id').primaryKey(),
   name: text('name').notNull(),
   email: text('email').notNull(),
   subject: varchar('subject', { length: 50 }).notNull(),
   message: text('message').notNull(),
   ipAddress: text('ip_address'),
   userAgent: text('user_agent'),
   status: varchar('status', { length: 20 }).notNull().default('new'),
   createdAt: timestamp('created_at').notNull().defaultNow(),
 })

export const reviews = pgTable('reviews', {
  id: serial('id').primaryKey(),
  contractorId: integer('contractor_id').references(() => contractors.id, { onDelete: 'cascade' }).notNull(),
  authorName: varchar('author_name', { length: 100 }),
  rating: integer('rating').notNull(),
  content: text('content'),
  googleReviewId: varchar('google_review_id', { length: 100 }),
  publishedAt: timestamp('published_at').defaultNow().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const blogPosts = pgTable('blog_posts', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 200 }).notNull(),
  slug: varchar('slug', { length: 200 }).notNull().unique(),
  content: text('content').notNull(),
  excerpt: text('excerpt'),
  featuredImage: text('featured_image'),
  author: varchar('author', { length: 100 }),
  city: text('city'),
  state: text('state'),
  tags: jsonb('tags').$type<string[]>(),
  metaTitle: varchar('meta_title', { length: 160 }),
  metaDescription: text('meta_description'),
  published: boolean('published').default(true),
  publishedAt: timestamp('published_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const serviceTypes = pgTable('service_types', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  slug: varchar('slug', { length: 100 }).notNull().unique(),
  description: text('description'),
  icon: varchar('icon', { length: 50 }),
  metaTitle: varchar('meta_title', { length: 160 }),
  metaDescription: text('meta_description'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const contractorServices = pgTable('contractor_services', {
  contractorId: integer('contractor_id').references(() => contractors.id, { onDelete: 'cascade' }).notNull(),
  serviceTypeId: integer('service_type_id').references(() => serviceTypes.id, { onDelete: 'cascade' }).notNull(),
}, (table) => ({
  pk: primaryKey({ columns: [table.contractorId, table.serviceTypeId] }),
}))


export const businessClaims = pgTable('business_claims', {
  id: serial('id').primaryKey(),
  contractorId: integer('contractor_id').references(() => contractors.id, { onDelete: 'cascade' }),
  userEmail: varchar('user_email', { length: 255 }).notNull(),
  userName: varchar('user_name', { length: 255 }).notNull(),
  userPhone: varchar('user_phone', { length: 50 }),
  role: varchar('role', { length: 50 }).default('owner'),
  proofDocuments: text('proof_documents').array(),
  message: text('message'),
  status: varchar('status', { length: 50 }).default('pending'),
  adminNotes: text('admin_notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  userId: uuid('user_id'),
})

export const businessSubmissions = pgTable(
  'business_submissions',
  {
    id: serial('id').primaryKey(),

    businessName: varchar('business_name', {
      length: 255,
    }).notNull(),

    address: text('address'),

    city: text('city'),

    state: text('state'),

    stateAbbrev: varchar('state_abbrev', {
      length: 2,
    }),

    zipCode: varchar('zip_code', {
      length: 20,
    }),

    phone: varchar('phone', {
      length: 20,
    }),

    website: text('website'),

    email: varchar('email', {
      length: 255,
    }),

    description: text('description'),

    // LIVE DB IS text[]
    servicesOffered: text(
      'services_offered'
    ).array(),

    serviceAreas: text(
      'service_areas'
    ).array(),

    licenseNumber: varchar(
      'license_number',
      {
        length: 50,
      }
    ),

    yearsInBusiness: integer(
      'years_in_business'
    ),

    emergencyService: boolean(
      'emergency_service'
    ).default(false),

    freeEstimates: boolean(
      'free_estimates'
    ).default(false),

    financingAvailable: boolean(
      'financing_available'
    ).default(false),

    warrantyOffered: boolean(
      'warranty_offered'
    ).default(false),

    openingHours: text(
      'opening_hours'
    ),

    priceRange: varchar(
      'price_range',
      {
        length: 20,
      }
    ),

    pricingNotes: text(
      'pricing_notes'
    ),

    minimumJobPrice: numeric(
      'minimum_job_price',
      {
        precision: 10,
        scale: 2,
      }
    ),

    priceCurrency: varchar(
      'price_currency',
      {
        length: 3,
      }
    ).default('USD'),

    latitude: numeric(
      'latitude',
      {
        precision: 10,
        scale: 7,
      }
    ),

    longitude: numeric(
      'longitude',
      {
        precision: 10,
        scale: 7,
      }
    ),

    userId: uuid('user_id'),

    submittedByEmail: varchar(
      'submitted_by_email',
      {
        length: 255,
      }
    ).notNull(),

    submittedByName: varchar(
      'submitted_by_name',
      {
        length: 255,
      }
    ).notNull(),

    approvedContractorId: integer(
      'approved_contractor_id'
    ).references(
      () => contractors.id,
      {
        onDelete: 'set null',
      }
    ),

    status: varchar(
      'status',
      {
        length: 50,
      }
    ).default('pending'),

    adminNotes: text(
      'admin_notes'
    ),

    reviewedBy: uuid(
      'reviewed_by'
    ),

    reviewedAt: timestamp(
      'reviewed_at'
    ),

    createdAt: timestamp(
      'created_at'
    )
      .defaultNow()
      .notNull(),

    updatedAt: timestamp(
      'updated_at'
    )
      .defaultNow()
      .notNull(),
  }
)

export const appReviews = pgTable('app_reviews', {
  id: serial('id').primaryKey(),
  contractorId: integer('contractor_id').references(() => contractors.id, { onDelete: 'cascade' }),
  userEmail: varchar('user_email', { length: 255 }).notNull(),
  userName: varchar('user_name', { length: 255 }).notNull(),
  rating: integer('rating').notNull(),
  title: varchar('title', { length: 255 }),
  content: text('content'),
  pros: text('pros'),
  cons: text('cons'),
  images: jsonb('images').$type<string[]>(),
  source: varchar('source', { length: 20 }).default('platform'),
  verifiedPurchase: boolean('verified_purchase').default(false),
  status: varchar('status', { length: 50 }).default('pending'),
  helpfulCount: integer('helpful_count').default(0),
  adminNotes: text('admin_notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const reviewHelpfulVotes = pgTable('review_helpful_votes', {
  id: serial('id').primaryKey(),
  reviewId: integer('review_id').references(() => appReviews.id, { onDelete: 'cascade' }),
  userEmail: varchar('user_email', { length: 255 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  uniqueVote: uniqueIndex('unique_review_user_vote').on(table.reviewId, table.userEmail),
}))

export const claimHistory = pgTable('claim_history', {
  id: serial('id').primaryKey(),
  claimId: integer('claim_id').references(() => businessClaims.id, { onDelete: 'cascade' }),
  action: varchar('action', { length: 50 }),
  note: text('note'),
  performedBy: varchar('performed_by', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})


export const contractorsRelations = relations(contractors, ({ one, many }) => ({
  
  reviews: many(reviews),
  services: many(serviceTypes, {
    relationName: 'contractorServices',
  }),
}))

export const adOrders = pgTable('ad_orders', {
   id: serial('id').primaryKey(),
   contractorId: integer('contractor_id').notNull(),
   paystackReference: text('paystack_reference').notNull().unique(),
   customerEmail: text('customer_email'),
   scope: varchar('scope', { length: 10 }).notNull(),
   stateAbbrev: varchar('state_abbrev', { length: 2 }),
   durationMonths: integer('duration_months').notNull(),
   amountUsdCents: integer('amount_usd_cents').notNull(),
   amountZarCents: integer('amount_zar_cents').notNull(),
   usdToZarRate: numeric('usd_to_zar_rate', { precision: 10, scale: 4 }).notNull(),
   status: varchar('status', { length: 20 }).notNull().default('pending'),
   featuredUntil: timestamp('featured_until'),
   createdAt: timestamp('created_at').notNull().defaultNow(),
   paidAt: timestamp('paid_at'),
 })
