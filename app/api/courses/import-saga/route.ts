import { NextRequest, NextResponse } from 'next/server';
import {
  importCoursesFromSAGA,
  importFacilitiesFromSAGA,
  CourseData,
  FacilityData,
} from '@/lib/import-courses';

interface ImportPayload {
  courses?: CourseData[];
  facilities?: FacilityData[];
}

export async function POST(request: NextRequest) {
  try {
    const payload: ImportPayload = await request.json();

    if (payload.facilities && Array.isArray(payload.facilities)) {
      // New format: facilities -> courses -> tees
      const result = await importFacilitiesFromSAGA(payload.facilities);
      return NextResponse.json(result);
    } else if (payload.courses && Array.isArray(payload.courses)) {
      // Old format: courses -> tees
      const result = await importCoursesFromSAGA(payload.courses);
      return NextResponse.json(result);
    } else {
      return NextResponse.json(
        {
          error: 'Invalid payload: expected either "courses" or "facilities" array',
        },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Import error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Import failed' },
      { status: 500 }
    );
  }
}
