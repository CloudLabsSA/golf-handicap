import { NextRequest, NextResponse } from 'next/server';
import { db, rounds, courses, courseTees, users } from '@/lib/db';
import { verifyJWT } from '@/lib/auth';
import crypto from 'crypto';
import { eq } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('auth_token')?.value;
    const payload = verifyJWT(token || '');

    if (!payload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { teeId, holes, score, date } = await request.json();

    if (!teeId || !holes || !score) {
      return NextResponse.json(
        { error: 'Tee, holes, and score required' },
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

    // Get tee details
    const tee = await db
      .select()
      .from(courseTees)
      .where(eq(courseTees.id, teeId))
      .limit(1);

    if (!tee.length) {
      return NextResponse.json({ error: 'Tee not found' }, { status: 404 });
    }

    const teeData = tee[0];

    // Get course rating and slope based on holes played
    let courseRating: number | null = null;
    let slopeRating: number | null = null;

    if (holes === 9) {
      // Use front 9 data
      courseRating = teeData.front9Rating;
      slopeRating = teeData.front9Slope;
    } else {
      // Use full 18 data
      courseRating = teeData.full18Rating;
      slopeRating = teeData.full18Slope;
    }

    if (!courseRating || !slopeRating) {
      return NextResponse.json(
        { error: `No rating/slope data for ${holes} holes on this tee` },
        { status: 400 }
      );
    }

    // Create round
    const roundId = crypto.randomUUID();
    await db.insert(rounds).values({
      id: roundId,
      userId: user[0].id,
      courseId: teeData.courseId,
      teeTeeId: teeId,
      teeColor: teeData.teeColor,
      holes,
      score,
      courseRating,
      slopeRating,
      date: new Date(date),
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
