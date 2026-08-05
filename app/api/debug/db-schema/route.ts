import { NextResponse } from 'next/server';
import { sql } from 'drizzle-orm';
import { db } from '@/lib/db';

export async function GET() {
  try {
    // Check what columns exist in the rounds table
    const columns = await db.execute(sql`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'rounds'
      ORDER BY ordinal_position
    `);

    return NextResponse.json({
      success: true,
      roundsColumns: columns.rows,
    });
  } catch (error) {
    console.error('Schema check error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Schema check failed' },
      { status: 500 }
    );
  }
}
