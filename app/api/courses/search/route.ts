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
      if (!process.env.GOLF_COURSE_API_KEY) {
        console.warn('GOLF_COURSE_API_KEY not configured');
        return NextResponse.json({ courses: [] });
      }

      const apiUrl = `https://api.golfcourseapi.com/courses?name=${encodeURIComponent(query)}&country=${country}`;
      console.log('Calling golf course API:', apiUrl);

      const response = await fetch(apiUrl, {
        headers: {
          'Authorization': `Bearer ${process.env.GOLF_COURSE_API_KEY}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('API response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API error response:', errorText);
        throw new Error(`API error: ${response.status} ${errorText}`);
      }

      const data = await response.json();
      console.log('API data:', data);

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
      // Return error message for debugging
      return NextResponse.json({
        courses: localCourses,
        error: apiError instanceof Error ? apiError.message : 'API error',
      });
    }
  } catch (error) {
    console.error('Course search error:', error);
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}
