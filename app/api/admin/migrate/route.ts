import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

const MIGRATION_SQL = `
CREATE TABLE IF NOT EXISTS "course_tees" (
	"id" text PRIMARY KEY NOT NULL,
	"course_id" text NOT NULL,
	"tee_color" text NOT NULL,
	"front9_rating" real,
	"front9_slope" real,
	"back9_rating" real,
	"back9_slope" real,
	"full18_rating" real,
	"full18_slope" real,
	"created_at" timestamp DEFAULT now()
);

ALTER TABLE "rounds" ADD COLUMN IF NOT EXISTS "tee_id" text;
ALTER TABLE "rounds" ADD COLUMN IF NOT EXISTS "tee_color" text;
ALTER TABLE "rounds" ADD COLUMN IF NOT EXISTS "course_rating" real;
ALTER TABLE "rounds" ADD COLUMN IF NOT EXISTS "slope_rating" real;

ALTER TABLE "courses" DROP COLUMN IF EXISTS "par";
ALTER TABLE "courses" DROP COLUMN IF EXISTS "course_rating";
ALTER TABLE "courses" DROP COLUMN IF EXISTS "slope_rating";
ALTER TABLE "courses" DROP COLUMN IF EXISTS "holes";
ALTER TABLE "courses" DROP COLUMN IF EXISTS "external_id";

ALTER TABLE "course_tees" ADD CONSTRAINT "course_tees_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "rounds" ADD CONSTRAINT "rounds_tee_id_course_tees_id_fk" FOREIGN KEY ("tee_id") REFERENCES "public"."course_tees"("id") ON DELETE no action ON UPDATE no action;

CREATE UNIQUE INDEX IF NOT EXISTS "course_id_tee_idx" ON "course_tees" USING btree ("course_id","tee_color");
`;

export async function GET(request: NextRequest) {
  try {
    // Execute migration
    await sql`
      CREATE TABLE IF NOT EXISTS "course_tees" (
        "id" text PRIMARY KEY NOT NULL,
        "course_id" text NOT NULL,
        "tee_color" text NOT NULL,
        "front9_rating" real,
        "front9_slope" real,
        "back9_rating" real,
        "back9_slope" real,
        "full18_rating" real,
        "full18_slope" real,
        "created_at" timestamp DEFAULT now()
      );
    `;

    await sql`ALTER TABLE "rounds" ADD COLUMN IF NOT EXISTS "tee_id" text;`;
    await sql`ALTER TABLE "rounds" ADD COLUMN IF NOT EXISTS "tee_color" text;`;
    await sql`ALTER TABLE "rounds" ADD COLUMN IF NOT EXISTS "course_rating" real;`;
    await sql`ALTER TABLE "rounds" ADD COLUMN IF NOT EXISTS "slope_rating" real;`;

    // Drop old columns from courses
    await sql`ALTER TABLE "courses" DROP COLUMN IF EXISTS "par";`;
    await sql`ALTER TABLE "courses" DROP COLUMN IF EXISTS "course_rating";`;
    await sql`ALTER TABLE "courses" DROP COLUMN IF EXISTS "slope_rating";`;
    await sql`ALTER TABLE "courses" DROP COLUMN IF EXISTS "holes";`;
    await sql`ALTER TABLE "courses" DROP COLUMN IF EXISTS "external_id";`;

    return NextResponse.json({ success: true, message: 'Migration completed' });
  } catch (error) {
    console.error('Migration error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Migration failed' },
      { status: 500 }
    );
  }
}
