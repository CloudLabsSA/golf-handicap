import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function POST(request: NextRequest) {
  try {
    // Delete all rounds first (they reference courses)
    const roundsResult = await sql`DELETE FROM "rounds" RETURNING "id";`;

    // Delete all courses
    const coursesResult = await sql`DELETE FROM "courses" RETURNING "id", "name";`;

    return NextResponse.json({
      success: true,
      roundsDeleted: roundsResult.rowCount,
      coursesDeleted: coursesResult.rowCount,
      courses: coursesResult.rows,
    });
  } catch (error) {
    console.error('Cleanup error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Cleanup failed' },
      { status: 500 }
    );
  }
}
