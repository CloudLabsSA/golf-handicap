import { NextRequest, NextResponse } from 'next/server';
import { db, users, rounds, courses } from '@/lib/db';
import { eq } from 'drizzle-orm';
import { calculateHandicapIndex } from '@/lib/handicap';

export async function GET(request: NextRequest) {
  try {
    // Get all users
    const allUsers = await db.select().from(users);

    // For each user, calculate their handicap
    const players = await Promise.all(
      allUsers.map(async (user) => {
        const userRounds = await db
          .select({
            score: rounds.score,
            coursePar: courses.par,
            courseRating: rounds.courseRating,
            slopeRating: rounds.slopeRating,
          })
          .from(rounds)
          .innerJoin(courses, eq(rounds.courseId, courses.id))
          .where(eq(rounds.userId, user.id));

        const roundData = userRounds.map((r) => ({
          score: r.score,
          coursePar: r.coursePar,
          courseRating: r.courseRating || undefined,
          slopeRating: r.slopeRating || undefined,
        }));

        const handicapIndex = calculateHandicapIndex(roundData);

        return {
          user: {
            email: user.email,
            name: user.name || user.email.split('@')[0],
          },
          handicapIndex,
          roundCount: userRounds.length,
        };
      })
    );

    return NextResponse.json({ players });
  } catch (error) {
    console.error('Players fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch players' }, { status: 500 });
  }
}
