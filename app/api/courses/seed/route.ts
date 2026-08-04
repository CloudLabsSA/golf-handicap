import { NextRequest, NextResponse } from 'next/server';
import { db, courses } from '@/lib/db';

const SOUTH_AFRICAN_COURSES = [
  { name: 'Wentworth Club', location: 'Johannesburg', par: 72, rating: 75.1, slope: 138 },
  { name: 'Royal Johannesburg & Kew', location: 'Johannesburg', par: 72, rating: 74.5, slope: 135 },
  { name: 'Leopard Creek Country Club', location: 'Mpumalanga', par: 72, rating: 75.8, slope: 142 },
  { name: 'Steyn City', location: 'Johannesburg', par: 72, rating: 74.2, slope: 133 },
  { name: 'Pecanwood', location: 'Pretoria', par: 72, rating: 73.8, slope: 131 },
  { name: 'Kruger National Golf Club', location: 'Mpumalanga', par: 72, rating: 72.1, slope: 128 },
  { name: 'Modderfontein Golf Club', location: 'Johannesburg', par: 72, rating: 73.5, slope: 129 },
  { name: 'Wanderers Golf Club', location: 'Johannesburg', par: 72, rating: 74.8, slope: 136 },
  { name: 'Orkney Golf Club', location: 'North West', par: 72, rating: 72.3, slope: 127 },
  { name: 'Durban Country Club', location: 'Durban', par: 72, rating: 73.2, slope: 130 },
  { name: 'Royal Durban Golf Club', location: 'Durban', par: 72, rating: 72.8, slope: 129 },
  { name: 'Westlake Golf Club', location: 'Cape Town', par: 72, rating: 73.6, slope: 132 },
  { name: 'Royal Cape Golf Club', location: 'Cape Town', par: 72, rating: 73.1, slope: 128 },
  { name: 'Erinvale Golf Club', location: 'Cape Town', par: 72, rating: 72.5, slope: 129 },
  { name: 'Pearl Valley Golf Club', location: 'Cape Town', par: 72, rating: 74.3, slope: 137 },
  { name: 'De Zalze Golf Club', location: 'Stellenbosch', par: 72, rating: 73.9, slope: 134 },
  { name: 'Arabella Golf Estate', location: 'Western Cape', par: 72, rating: 74.1, slope: 135 },
  { name: 'Fancourt', location: 'George', par: 72, rating: 74.6, slope: 138 },
  { name: 'Pezula Championship Course', location: 'Knysna', par: 72, rating: 73.4, slope: 131 },
  { name: 'Pietermaritzburg Golf Club', location: 'Pietermaritzburg', par: 72, rating: 72.9, slope: 129 },
];

export async function GET(request: NextRequest) {
  try {
    // Check if courses already exist
    const existing = await db.select().from(courses).limit(1);
    if (existing.length > 0) {
      return NextResponse.json({
        message: 'Courses already seeded',
        count: existing.length,
      });
    }

    // Add courses
    let added = 0;
    for (const course of SOUTH_AFRICAN_COURSES) {
      try {
        await db.insert(courses).values({
          id: `course_${course.name.replace(/\s+/g, '_').toLowerCase()}`,
          name: course.name,
          location: course.location,
          par: course.par,
          courseRating: course.rating,
          slopeRating: course.slope,
          holes: 18,
        });
        added++;
      } catch (e) {
        // Ignore duplicates
      }
    }

    return NextResponse.json({
      success: true,
      added,
      total: SOUTH_AFRICAN_COURSES.length,
    });
  } catch (error) {
    console.error('Seeding error:', error);
    return NextResponse.json(
      { error: 'Failed to seed courses' },
      { status: 500 }
    );
  }
}
