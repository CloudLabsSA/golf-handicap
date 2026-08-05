import { sql } from '@vercel/postgres';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS "tees" (
        "id" text PRIMARY KEY,
        "course_id" text NOT NULL,
        "tee_name" text NOT NULL,
        "gender" text,
        "rating" real,
        "slope" integer,
        "front_9_rating" real,
        "front_9_slope" integer,
        "back_9_rating" real,
        "back_9_slope" integer,
        "length" integer,
        "par" integer,
        "published" boolean DEFAULT true,
        "effective_date" timestamp,
        "created_at" timestamp DEFAULT now(),
        FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE CASCADE
      )
    `;

    return NextResponse.json({ success: true, message: 'Tees table created' });
  } catch (error) {
    console.error('Migration error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Migration failed' },
      { status: 500 }
    );
  }
}
