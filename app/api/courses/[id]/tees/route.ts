import { NextRequest, NextResponse } from 'next/server';
import { db, tees } from '@/lib/db';
import { eq } from 'drizzle-orm';

interface RouteParams {
  id: string;
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<RouteParams> }
) {
  const { id: courseId } = await context.params;
  try {
    const teesData = await db
      .select()
      .from(tees)
      .where(eq(tees.courseId, courseId));

    return NextResponse.json(teesData);
  } catch (error) {
    console.error('Error fetching tees:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tees' },
      { status: 500 }
    );
  }
}
