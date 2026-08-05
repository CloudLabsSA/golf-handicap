import { NextRequest, NextResponse } from 'next/server';
import { addCourse, CreateTeeInput } from '@/lib/courses';

interface CreateCourseRequest {
  name: string;
  location?: string;
  par: number;
  courseRating?: number;
  slopeRating?: number;
  tees?: CreateTeeInput[];
}

export async function POST(request: NextRequest) {
  try {
    const body: CreateCourseRequest = await request.json();

    if (!body.name || !body.par) {
      return NextResponse.json(
        { error: 'Name and par are required' },
        { status: 400 }
      );
    }

    const { courseId, teesAdded } = await addCourse(
      {
        name: body.name,
        location: body.location,
        par: body.par,
        courseRating: body.courseRating,
        slopeRating: body.slopeRating,
      },
      body.tees
    );

    return NextResponse.json({
      success: true,
      courseId,
      teesAdded,
    });
  } catch (error) {
    console.error('Course creation error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create course' },
      { status: 500 }
    );
  }
}
