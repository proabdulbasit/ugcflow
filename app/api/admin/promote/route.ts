import { NextResponse } from 'next/server';
import { API_URL } from '@/lib/api/client';

export async function POST(req: Request) {
  const secret = req.headers.get('x-admin-seed-secret');
  if (!secret || secret !== process.env.ADMIN_SEED_SECRET) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { email } = await req.json();
  if (!email) return NextResponse.json({ error: 'email required' }, { status: 400 });

  const res = await fetch(`${API_URL}/api/auth/promote-admin`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-admin-seed-secret': secret,
    },
    body: JSON.stringify({ email }),
  });

  const json = await res.json();
  return NextResponse.json(json, { status: res.status });
}
