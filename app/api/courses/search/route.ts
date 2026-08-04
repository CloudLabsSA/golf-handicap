import { NextRequest, NextResponse } from 'next/server';
import { db, courses } from '@/lib/db';
import { like, or } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const query = request.nextUrl.searchParams.get('q');
    const country = request.nextUrl.searchParams.get('country') || 'ZA';

    if (!query || query.length < 2) {
      return NextResponse.json({ error: 'Query too short' }, { status: 400 });
    }

    // First check local database
    let localCourses = await db
      .select()
      .from(courses)
      .where(or(
        like(courses.name, `%${query}%`),
        like(courses.location, `%${query}%`)
      ))
      .limit(10);

    if (localCourses.length > 0) {
      return NextResponse.json({ courses: localCourses });
    }

    // If no local courses found, return empty with helpful message
    return NextResponse.json({
      courses: localCourses,
      message: localCourses.length === 0
        ? 'No courses found. Add a course manually to get started.'
        : 'Found courses in database',
    });
  } catch (error) {
    console.error('Course search error:', error);
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}
