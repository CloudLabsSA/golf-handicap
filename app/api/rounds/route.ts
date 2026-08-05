import { NextRequest, NextResponse } from 'next/server';
import { db, rounds, courses, users } from '@/lib/db';
import { eq } from 'drizzle-orm';
import { verifyJWT } from '@/lib/auth';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('auth_token')?.value;
    const payload = verifyJWT(token || '');

    if (!payload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { courseName, coursePar, score, date, holes = 18, scorecard, courseRating, slopeRating } = await request.json();

    if (!courseName || !coursePar || !score) {
      return NextResponse.json(
        { error: 'Course name, par, and score required' },
        { status: 400 }
      );
    }

    // Get user
    const user = await db
      .select()
      .from(users)
      .where(eq(users.email, payload.email))
      .limit(1);

    if (!user.length) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Find or create course
    let course = await db
      .select()
      .from(courses)
      .where(eq(courses.name, courseName))
      .limit(1);

    if (!course.length) {
      const courseId = crypto.randomUUID();
      await db.insert(courses).values({
        id: courseId,
        name: courseName,
        par: coursePar,
        holes,
      });
      course = await db.select().from(courses).where(eq(courses.id, courseId));
    }

    // Create round
    const roundId = crypto.randomUUID();
    await db.insert(rounds).values({
      id: roundId,
      userId: user[0].id,
      courseId: course[0].id,
      teeTeeId: null,
      teeColor: null,
      holes,
      score,
      date: new Date(date),
      scorecard: scorecard ? JSON.stringify(scorecard) : null,
      courseRating: courseRating || course[0].courseRating || null,
      slopeRating: slopeRating || course[0].slopeRating || null,
      createdAt: new Date(),
    });

    const newRound = await db
      .select()
      .from(rounds)
      .where(eq(rounds.id, roundId))
      .limit(1);

    return NextResponse.json(newRound[0]);
  } catch (error) {
    console.error('Round creation error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create round' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth_token')?.value;
    const payload = verifyJWT(token || '');

    if (!payload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = request.nextUrl.searchParams.get('userId');

    // Get user
    const user = await db
      .select()
      .from(users)
      .where(eq(users.email, payload.email))
      .limit(1);

    if (!user.length) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get rounds for specified user or self
    const targetUserId = userId || user[0].id;
    const userRounds = await db
      .select()
      .from(rounds)
      .where(eq(rounds.userId, targetUserId));

    return NextResponse.json(userRounds);
  } catch (error) {
    console.error('Rounds fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch rounds' }, { status: 500 });
  }
}
