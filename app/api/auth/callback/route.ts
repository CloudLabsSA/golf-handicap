import { NextRequest, NextResponse } from 'next/server';
import { db, authTokens, users } from '@/lib/db';
import { generateJWT } from '@/lib/auth';
import { eq, and } from 'drizzle-orm';
import crypto from 'crypto';

export async function GET(request: NextRequest) {
  try {
    const token = request.nextUrl.searchParams.get('token');

    if (!token) {
      return NextResponse.redirect(new URL('/auth/login?error=missing_token', request.url));
    }

    // Find and verify token
    const authToken = await db
      .select()
      .from(authTokens)
      .where(
        and(
          eq(authTokens.token, token),
          eq(authTokens.usedAt, null)
        )
      )
      .limit(1);

    if (!authToken.length) {
      return NextResponse.redirect(new URL('/auth/login?error=invalid_token', request.url));
    }

    const { email, expiresAt, id } = authToken[0];

    // Check expiry
    if (new Date() > expiresAt) {
      return NextResponse.redirect(new URL('/auth/login?error=expired_token', request.url));
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

    // Redirect to home with JWT
    const response = NextResponse.redirect(new URL('/dashboard', request.url));
    response.cookies.set('auth_token', jwt, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60, // 30 days
    });

    return response;
  } catch (error) {
    console.error('Auth callback error:', error);
    return NextResponse.redirect(new URL('/auth/login?error=server_error', request.url));
  }
}
