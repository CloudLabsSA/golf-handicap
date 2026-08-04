import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function GET(request: NextRequest) {
  try {
    // Create tables
    await sql`
      CREATE TABLE IF NOT EXISTS "users" (
        "id" text PRIMARY KEY NOT NULL,
        "email" text NOT NULL UNIQUE,
        "name" text,
        "created_at" timestamp DEFAULT now(),
        "updated_at" timestamp DEFAULT now()
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS "courses" (
        "id" text PRIMARY KEY NOT NULL,
        "name" text NOT NULL,
        "location" text,
        "par" integer NOT NULL,
        "course_rating" real,
        "slope_rating" real,
        "holes" integer DEFAULT 18,
        "external_id" text UNIQUE,
        "created_at" timestamp DEFAULT now()
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS "auth_tokens" (
        "id" text PRIMARY KEY NOT NULL,
        "email" text NOT NULL,
        "token" text NOT NULL UNIQUE,
        "expires_at" timestamp NOT NULL,
        "used_at" timestamp,
        "created_at" timestamp DEFAULT now()
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS "rounds" (
        "id" text PRIMARY KEY NOT NULL,
        "user_id" text NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "course_id" text NOT NULL REFERENCES "courses"("id"),
        "score" integer NOT NULL,
        "date" timestamp NOT NULL,
        "scorecard" text,
        "created_at" timestamp DEFAULT now()
      );
    `;

    return NextResponse.json({ success: true, message: 'Tables initialized' });
  } catch (error) {
    console.error('Init error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Initialization failed' },
      { status: 500 }
    );
  }
}
