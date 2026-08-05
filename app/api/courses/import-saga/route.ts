import { NextRequest, NextResponse } from 'next/server';
import { importCoursesFromSAGA, CourseData } from '@/lib/import-courses';

interface ImportPayload {
  courses: CourseData[];
}

export async function POST(request: NextRequest) {
  try {
    const payload: ImportPayload = await request.json();

    if (!payload.courses || !Array.isArray(payload.courses)) {
      return NextResponse.json(
        { error: 'Invalid payload: expected courses array' },
        { status: 400 }
      );
    }

    const result = await importCoursesFromSAGA(payload.courses);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Import error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Import failed' },
      { status: 500 }
    );
  }
}
