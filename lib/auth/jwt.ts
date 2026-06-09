import { jwtVerify } from 'jose';
import type { UserRole } from '@/lib/api/client';

export interface JwtPayload {
  userId: string;
  role: UserRole;
  email: string;
}

export async function verifyJwtToken(token: string): Promise<JwtPayload | null> {
  const secret = process.env.JWT_SECRET;
  if (!secret) return null;
  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(secret));
    return {
      userId: String(payload.userId),
      role: payload.role as UserRole,
      email: String(payload.email),
    };
  } catch {
    return null;
  }
}
