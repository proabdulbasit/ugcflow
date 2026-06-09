import { cookies } from 'next/headers';
import { verifyJwtToken } from '@/lib/auth/jwt';

export async function getServerUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  if (!token) return null;
  return verifyJwtToken(token);
}
