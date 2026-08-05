import { NextRequest, NextResponse } from 'next/server';
import { db, users, rounds, courses } from '@/lib/db';
import { eq } from 'drizzle-orm';
import { calculateHandicapIndex } from '@/lib/handicap';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ email: string }> }
) {
  try {
    const params = await context.params;
    const email = decodeURIComponent(params.email);

    // Get user
    const user = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (!user.length) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get user's rounds
    const userRounds = await db
      .select({
        id: rounds.id,
        score: rounds.score,
        date: rounds.date,
        courseId: rounds.courseId,
        courseName: courses.name,
        coursePar: courses.par,
        courseRating: rounds.courseRating,
        slopeRating: rounds.slopeRating,
      })
      .from(rounds)
      .innerJoin(courses, eq(rounds.courseId, courses.id))
      .where(eq(rounds.userId, user[0].id));

    // Calculate handicap
    const roundData = userRounds.map((r) => ({
      score: r.score,
      coursePar: r.coursePar,
      courseRating: r.courseRating || undefined,
      slopeRating: r.slopeRating || undefined,
    }));

    const handicapIndex = calculateHandicapIndex(roundData);

    return NextResponse.json({
      user: user[0],
      handicapIndex,
      roundCount: userRounds.length,
      rounds: userRounds,
    });
  } catch (error) {
    console.error('User fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 });
  }
}
