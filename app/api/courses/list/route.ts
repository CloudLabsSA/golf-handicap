import { NextRequest, NextResponse } from 'next/server';
import { db, courses, courseTees } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    // Get all courses with their tees
    const allCourses = await db.select().from(courses);

    const coursesWithTees = await Promise.all(
      allCourses.map(async (course) => {
        const tees = await db
          .select()
          .from(courseTees)
          .where((t) => t.courseId === course.id);

        return {
          id: course.id,
          name: course.name,
          location: course.location,
          tees: tees.map((t) => ({
            id: t.id,
            color: t.teeColor,
            front9: { rating: t.front9Rating, slope: t.front9Slope },
            back9: { rating: t.back9Rating, slope: t.back9Slope },
            full18: { rating: t.full18Rating, slope: t.full18Slope },
          })),
        };
      })
    );

    return NextResponse.json({ courses: coursesWithTees });
  } catch (error) {
    console.error('Course list error:', error);
    return NextResponse.json({ error: 'Failed to fetch courses' }, { status: 500 });
  }
}
