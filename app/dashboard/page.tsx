import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function DashboardIndex() {
  const supabase = await createClient()

  const { data: userData } = await supabase.auth.getUser()
  const user = userData?.user
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const role =
    ((profile as any)?.role as string | undefined) ??
    ((user as any)?.user_metadata?.role as string | undefined)
  redirect(role ? `/dashboard/${role}` : '/dashboard/creator')
}
