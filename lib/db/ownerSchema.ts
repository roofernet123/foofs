import {
  integer,
  jsonb,
  pgTable,
  serial,
  text,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core'

import { businessSubmissions, contractors } from './schema'

export const contractorUsers = pgTable(
  'contractor_users',
  {
    id: serial('id').primaryKey(),

    contractorId: integer('contractor_id')
      .references(() => contractors.id, {
        onDelete: 'cascade',
      })
      .notNull(),

    userId: uuid('user_id').notNull(),

    userEmail: varchar('user_email', {
      length: 255,
    }),

    role: varchar('role', {
      length: 30,
    })
      .notNull()
      .default('owner'),

    status: varchar('status', {
      length: 30,
    })
      .notNull()
      .default('active'),

    verifiedAt: timestamp('verified_at')
      .defaultNow(),

    createdAt: timestamp('created_at')
      .defaultNow(),
  }
)

export const contractorUpdateRequests = pgTable(
  'contractor_update_requests',
  {
    id: serial('id').primaryKey(),

    contractorId: integer('contractor_id')
      .references(() => contractors.id, {
        onDelete: 'cascade',
      })
      .notNull(),

    submittedBy: uuid('submitted_by').notNull(),

    changes: jsonb('changes')
      .$type<Record<string, unknown>>()
      .notNull(),

    previousValues: jsonb('previous_values')
      .$type<Record<string, unknown>>(),

    status: varchar('status', {
      length: 30,
    })
      .notNull()
      .default('pending'),

    adminNotes: text('admin_notes'),

    reviewedBy: uuid('reviewed_by'),

    createdAt: timestamp('created_at')
      .defaultNow(),

    reviewedAt: timestamp('reviewed_at'),
  }
)

export const contractorMedia = pgTable(
  'contractor_media',
  {
    id: serial('id').primaryKey(),

    contractorId: integer('contractor_id')
      .references(() => contractors.id, {
        onDelete: 'cascade',
      })
      .notNull(),

    storagePath: text('storage_path')
      .notNull(),

    mediaType: varchar('media_type', {
      length: 30,
    })
      .default('gallery'),

    altText: varchar('alt_text', {
      length: 255,
    }),

    caption: text('caption'),

    sortOrder: integer('sort_order')
      .default(0),

    status: varchar('status', {
      length: 30,
    })
      .default('pending'),

    uploadedBy: uuid('uploaded_by'),

    adminNotes: text('admin_notes'),

    reviewedBy: uuid('reviewed_by'),

    reviewedAt: timestamp('reviewed_at'),

    createdAt: timestamp('created_at')
      .defaultNow(),
  }
)

export const businessSubmissionMedia =
  pgTable(
    'business_submission_media',
    {
      id: serial('id')
        .primaryKey(),

      submissionId: integer(
        'submission_id'
      )
        .references(
          () =>
            businessSubmissions.id,
          {
            onDelete: 'cascade',
          }
        )
        .notNull(),

      storagePath: text(
        'storage_path'
      ).notNull(),

      mediaType: varchar(
        'media_type',
        {
          length: 30,
        }
      ).default('gallery'),

      altText: varchar(
        'alt_text',
        {
          length: 255,
        }
      ),

      caption: text(
        'caption'
      ),

      createdAt: timestamp(
        'created_at'
      ).defaultNow(),
    }
  )