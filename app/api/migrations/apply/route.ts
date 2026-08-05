import { NextResponse } from 'next/server';
import { sql } from 'drizzle-orm';
import { db } from '@/lib/db';

export async function POST() {
  try {
    // Run the migration to drop unused columns
    try {
      await db.execute(sql`
        ALTER TABLE "rounds" DROP CONSTRAINT IF EXISTS "rounds_tee_id_course_tees_id_fk"
      `);
    } catch (e) {
      console.log('Constraint drop failed (may not exist):', e);
    }

    try {
      await db.execute(sql`
        ALTER TABLE "rounds" DROP COLUMN IF EXISTS "tee_id"
      `);
    } catch (e) {
      console.log('tee_id drop failed (may not exist):', e);
    }

    try {
      await db.execute(sql`
        ALTER TABLE "rounds" DROP COLUMN IF EXISTS "tee_color"
      `);
    } catch (e) {
      console.log('tee_color drop failed (may not exist):', e);
    }

    return NextResponse.json({
      success: true,
      message: 'Migration applied successfully',
    });
  } catch (error) {
    console.error('Migration error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Migration failed' },
      { status: 500 }
    );
  }
}
