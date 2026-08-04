import { NextRequest, NextResponse } from 'next/server';
import { db, authTokens, users } from '@/lib/db';
import { generateJWT } from '@/lib/auth';
import { eq, and, isNull } from 'drizzle-orm';
import crypto from 'crypto';

export async function GET(request: NextRequest) {
  try {
    const token = request.nextUrl.searchParams.get('token');

    if (!token) {
      return NextResponse.json({ error: 'Missing token' }, { status: 400 });
    }

    // Find and verify token
    const authToken = await db
      .select()
      .from(authTokens)
      .where(
        and(
          eq(authTokens.token, token),
          isNull(authTokens.usedAt)
        )
      )
      .limit(1);

    if (!authToken.length) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { email, expiresAt, id } = authToken[0];

    // Check expiry
    if (new Date() > expiresAt) {
      return NextResponse.json({ error: 'Token expired' }, { status: 401 });
    }

    // Mark token as used
    await db
      .update(authTokens)
      .set({ usedAt: new Date() })
      .where(eq(authTokens.id, id));

    // Get or create user
    let user = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (!user.length) {
      const userId = crypto.randomUUID();
      await db.insert(users).values({
        id: userId,
        email,
        name: email.split('@')[0],
      });
      user = await db.select().from(users).where(eq(users.id, userId));
    }

    // Generate JWT
    const jwt = generateJWT(email);

    // Return success with JWT to be set as cookie by client
    const response = NextResponse.json({ success: true, email });
    response.cookies.set('auth_token', jwt, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60, // 30 days
    });

    return response;
  } catch (error) {
    console.error('Auth callback error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Callback failed' },
      { status: 500 }
    );
  }
}
