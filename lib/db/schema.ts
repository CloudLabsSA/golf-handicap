import { pgTable, text, timestamp, real, integer, uniqueIndex } from 'drizzle-orm/pg-core';

export const users = pgTable(
  'users',
  {
    id: text('id').primaryKey(),
    email: text('email').notNull().unique(),
    name: text('name'),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
  },
  (table) => ({
    emailIdx: uniqueIndex('email_idx').on(table.email),
  })
);

export const courses = pgTable(
  'courses',
  {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    location: text('location'),
    par: integer('par').notNull(),
    courseRating: real('course_rating'),
    slopeRating: real('slope_rating'),
    holes: integer('holes').default(18),
    externalId: text('external_id'),
    createdAt: timestamp('created_at').defaultNow(),
  },
  (table) => ({
    externalIdIdx: uniqueIndex('external_id_idx').on(table.externalId),
  })
);

export const rounds = pgTable(
  'rounds',
  {
    id: text('id').primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    courseId: text('course_id')
      .notNull()
      .references(() => courses.id),
    score: integer('score').notNull(),
    date: timestamp('date').notNull(),
    scorecard: text('scorecard'), // JSON array of hole scores
    createdAt: timestamp('created_at').defaultNow(),
  }
);

export const authTokens = pgTable(
  'auth_tokens',
  {
    id: text('id').primaryKey(),
    email: text('email').notNull(),
    token: text('token').notNull().unique(),
    expiresAt: timestamp('expires_at').notNull(),
    usedAt: timestamp('used_at'),
    createdAt: timestamp('created_at').defaultNow(),
  }
);
