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
    createdAt: timestamp('created_at').defaultNow(),
  }
);

export const courseTees = pgTable(
  'course_tees',
  {
    id: text('id').primaryKey(),
    courseId: text('course_id')
      .notNull()
      .references(() => courses.id, { onDelete: 'cascade' }),
    teeColor: text('tee_color').notNull(), // Gold, Blue, White, Red, etc
    front9Rating: real('front9_rating'),
    front9Slope: real('front9_slope'),
    back9Rating: real('back9_rating'),
    back9Slope: real('back9_slope'),
    full18Rating: real('full18_rating'),
    full18Slope: real('full18_slope'),
    createdAt: timestamp('created_at').defaultNow(),
  },
  (table) => ({
    courseIdTeeIdx: uniqueIndex('course_id_tee_idx').on(table.courseId, table.teeColor),
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
    teeTeeId: text('tee_id')
      .references(() => courseTees.id),
    teeColor: text('tee_color'), // Stored for reference
    holes: integer('holes').default(18), // 9 or 18
    score: integer('score').notNull(),
    courseRating: real('course_rating'), // Captured at time of round
    slopeRating: real('slope_rating'), // Captured at time of round
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
