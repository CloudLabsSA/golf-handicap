import { NextRequest, NextResponse } from 'next/server';
import { db, rounds } from '@/lib/db';
import { eq } from 'drizzle-orm';
import { verifyJWT } from '@/lib/auth';

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const token = request.cookies.get('auth_token')?.value;
    const payload = verifyJWT(token || '');

    if (!payload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;

    // Delete the round
    const result = await db.delete(rounds).where(eq(rounds.id, id));

    if (result.rowCount === 0) {
      return NextResponse.json({ error: 'Round not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Round deletion error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete round' },
      { status: 500 }
    );
  }
}
