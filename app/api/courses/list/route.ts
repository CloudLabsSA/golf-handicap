import { NextResponse } from 'next/server';
import { db, courses } from '@/lib/db';

export async function GET() {
  try {
    const allCourses = await db.select().from(courses).orderBy(courses.name);
    return NextResponse.json(allCourses);
  } catch (error) {
    console.error('Courses list error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch courses' },
      { status: 500 }
    );
  }
}
