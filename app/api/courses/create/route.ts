import { NextRequest, NextResponse } from 'next/server';
import { db, courses } from '@/lib/db';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const { name, location, par, courseRating, slopeRating, holes } =
      await request.json();

    if (!name || !par) {
      return NextResponse.json(
        { error: 'Name and par are required' },
        { status: 400 }
      );
    }

    const courseId = crypto.randomUUID();
    const newCourse = await db
      .insert(courses)
      .values({
        id: courseId,
        name,
        location: location || 'South Africa',
        par,
        courseRating: courseRating || undefined,
        slopeRating: slopeRating || undefined,
        holes: holes || 18,
      })
      .returning();

    return NextResponse.json(newCourse[0]);
  } catch (error) {
    console.error('Course creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create course' },
      { status: 500 }
    );
  }
}
