import { NextResponse } from 'next/server';
import { sql } from 'drizzle-orm';
import { db } from '@/lib/db';

export async function POST() {
  try {
    try {
      await db.execute(sql`
        ALTER TABLE "rounds" ADD COLUMN "holes" integer DEFAULT 18
      `);
    } catch (e: any) {
      // Column might already exist, which is fine
      if (e.message?.includes('already exists') || e.message?.includes('duplicate')) {
        console.log('Column already exists');
      } else {
        throw e;
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Ensured holes column exists in rounds table',
    });
  } catch (error) {
    console.error('Migration error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Migration failed' },
      { status: 500 }
    );
  }
}
