import { NextRequest, NextResponse } from 'next/server';
import { db, courses, courseTees } from '@/lib/db';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const {
      name,
      location,
      tees, // Array of { color, front9Rating, front9Slope, back9Rating, back9Slope, full18Rating, full18Slope }
    } = await request.json();

    if (!name || !tees || tees.length === 0) {
      return NextResponse.json(
        { error: 'Course name and at least one tee required' },
        { status: 400 }
      );
    }

    // Create course
    const courseId = crypto.randomUUID();
    await db.insert(courses).values({
      id: courseId,
      name,
      location: location || 'South Africa',
    });

    // Add tees
    const addedTees = [];
    for (const tee of tees) {
      const teeId = crypto.randomUUID();
      await db.insert(courseTees).values({
        id: teeId,
        courseId,
        teeColor: tee.color,
        front9Rating: tee.front9Rating,
        front9Slope: tee.front9Slope,
        back9Rating: tee.back9Rating,
        back9Slope: tee.back9Slope,
        full18Rating: tee.full18Rating,
        full18Slope: tee.full18Slope,
      });
      addedTees.push(tee.color);
    }

    return NextResponse.json({
      success: true,
      courseId,
      name,
      teesAdded: addedTees,
    });
  } catch (error) {
    console.error('Course creation error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create course' },
      { status: 500 }
    );
  }
}
