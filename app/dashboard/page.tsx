import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { verifyJwtToken } from '@/lib/auth/jwt';

export default async function DashboardIndex() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  const user = token ? await verifyJwtToken(token) : null;

  if (!user) redirect('/login');
  redirect(`/dashboard/${user.role}`);
}
