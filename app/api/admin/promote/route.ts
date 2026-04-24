import { NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase/admin';

/**
 * One-time helper endpoint to promote a user to admin.
 *
 * Protection: requires header `x-admin-seed-secret` matching env `ADMIN_SEED_SECRET`.
 * Body: { "email": "user@example.com" }
 */
export async function POST(req: Request) {
  const secret = req.headers.get('x-admin-seed-secret');
  const expected = process.env.ADMIN_SEED_SECRET;
  if (!expected || secret !== expected) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const email = String(body.email || '').trim().toLowerCase();
  if (!email) {
    return NextResponse.json({ error: 'email required' }, { status: 400 });
  }

  const supabase = createServiceRoleClient();

  // Lookup auth user id by email
  const { data: users, error: listError } = await supabase.auth.admin.listUsers();
  if (listError) {
    return NextResponse.json({ error: listError.message }, { status: 500 });
  }

  const match = users.users.find((u) => (u.email || '').toLowerCase() === email);
  if (!match) {
    return NextResponse.json({ error: 'User not found in auth.users for that email' }, { status: 404 });
  }

  const userId = match.id;

  const { error: upsertError } = await supabase.from('profiles').upsert({ id: userId, email, role: 'admin' });
  if (upsertError) {
    return NextResponse.json({ error: upsertError.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, userId });
}

