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

    // Then fetch from external API
    try {
      const response = await fetch(
        `https://api.golfcourseapi.com/courses?name=${encodeURIComponent(query)}&country=${country}`,
        {
          headers: {
            'Authorization': `Bearer ${process.env.GOLF_COURSE_API_KEY}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('API error');
      }

      const data = await response.json();

      // Save to database for future lookups
      if (data.courses && Array.isArray(data.courses)) {
        for (const course of data.courses.slice(0, 5)) {
          const courseId = `course_${course.id || course.name.replace(/\s+/g, '_')}`;

          // Check if already exists
          const existing = await db
            .select()
            .from(courses)
            .where(like(courses.externalId, `${course.id}`))
            .limit(1);

          if (!existing.length) {
            await db.insert(courses).values({
              id: courseId,
              name: course.name,
              location: course.location || course.city,
              par: course.par || 72,
              courseRating: course.courseRating,
              slopeRating: course.slopeRating,
              externalId: String(course.id),
            }).catch(() => {
              // Ignore if insert fails (duplicate)
            });
          }
        }
      }

      return NextResponse.json({ courses: data.courses || [] });
    } catch (apiError) {
      console.error('Golf Course API error:', apiError);
      // Return empty array if external API fails
      return NextResponse.json({ courses: localCourses });
    }
  } catch (error) {
    console.error('Course search error:', error);
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}
