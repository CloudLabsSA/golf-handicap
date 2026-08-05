import { NextResponse } from 'next/server';
import { sql } from 'drizzle-orm';
import { db } from '@/lib/db';

export async function POST() {
  try {
    // Run the migration to drop unused columns
    await db.execute(sql`
      ALTER TABLE "rounds" DROP CONSTRAINT "rounds_tee_id_course_tees_id_fk"
    `);

    await db.execute(sql`
      ALTER TABLE "rounds" DROP COLUMN "tee_id"
    `);

    await db.execute(sql`
      ALTER TABLE "rounds" DROP COLUMN "tee_color"
    `);

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
