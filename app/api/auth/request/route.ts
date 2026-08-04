import { NextRequest, NextResponse } from 'next/server';
import { db, authTokens, users } from '@/lib/db';
import { generateAuthToken, getAuthTokenExpiry } from '@/lib/auth';
import { eq } from 'drizzle-orm';
import { Resend } from 'resend';
import crypto from 'crypto';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Valid email required' },
        { status: 400 }
      );
    }

    // Generate auth token
    const token = generateAuthToken();
    const tokenId = crypto.randomUUID();
    const expiresAt = getAuthTokenExpiry();

    // Save token to database
    await db.insert(authTokens).values({
      id: tokenId,
      email,
      token,
      expiresAt,
    });

    // Send email with magic link
    const loginUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/callback?token=${token}`;

    await resend.emails.send({
      from: 'noreply@golfhandicap.app',
      to: email,
      subject: 'Your Golf Handicap Login Link',
      html: `
        <h1>Sign in to Golf Handicap Tracker</h1>
        <p>Click the link below to sign in to your account:</p>
        <a href="${loginUrl}" style="background: #2d5016; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
          Sign In
        </a>
        <p>Or copy this link: ${loginUrl}</p>
        <p>This link expires in 24 hours.</p>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Auth request error:', error);
    return NextResponse.json(
      { error: 'Failed to send login email' },
      { status: 500 }
    );
  }
}
