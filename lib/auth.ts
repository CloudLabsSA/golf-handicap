import crypto from 'crypto';
import jwt from 'jsonwebtoken';

export interface AuthToken {
  email: string;
  token: string;
  expiresAt: Date;
  usedAt?: Date;
}

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export function generateAuthToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

export function generateJWT(email: string): string {
  return jwt.sign({ email }, JWT_SECRET, { expiresIn: '30d' });
}

export function verifyJWT(token: string): { email: string } | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (typeof decoded === 'object' && 'email' in decoded) {
      return { email: decoded.email as string };
    }
    return null;
  } catch {
    return null;
  }
}

export function getAuthTokenExpiry(hours: number = 24): Date {
  return new Date(Date.now() + hours * 60 * 60 * 1000);
}
