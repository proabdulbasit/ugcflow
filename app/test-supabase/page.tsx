import { createClient } from '@/lib/supabase/server'

export default async function TestSupabasePage() {
  const supabase = await createClient()
  
  // Test 1: Check connection by fetching a single row from a public table
  // We'll try to fetch packages as it's a common public table
  const { data: packages, error: packagesError } = await supabase
    .from('packages')
    .select('*')
    .limit(1)

  // Test 2: Check Auth status
  const { data: { user }, error: userError } = await supabase.auth.getUser()

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Supabase Connection Test</h1>
      
      <div className="space-y-6">
        <section className="p-4 border rounded-lg bg-slate-50">
          <h2 className="font-semibold mb-2">Database Connection</h2>
          {packagesError ? (
            <div className="text-red-600">
              <p>❌ Error connecting to database:</p>
              <pre className="text-xs mt-2">{JSON.stringify(packagesError, null, 2)}</pre>
            </div>
          ) : (
            <div className="text-green-600">
              <p>✅ Successfully connected to database!</p>
              <p className="text-sm text-slate-600 mt-1">
                Found {packages?.length || 0} packages in the database.
              </p>
            </div>
          )}
        </section>

        <section className="p-4 border rounded-lg bg-slate-50">
          <h2 className="font-semibold mb-2">Auth Status</h2>
          {userError ? (
            <div className="text-amber-600">
              <p>ℹ️ No active session or error fetching user.</p>
            </div>
          ) : user ? (
            <div className="text-green-600">
              <p>✅ Auth is working!</p>
              <p className="text-sm text-slate-600 mt-1">Logged in as: {user.email}</p>
            </div>
          ) : (
            <div className="text-slate-600">
              <p>👤 Not logged in (Public Access)</p>
            </div>
          )}
        </section>

        <div className="text-xs text-slate-400">
          <p>Project ID: {process.env.SUPABASE_PROJECT_ID}</p>
          <p>URL: {process.env.NEXT_PUBLIC_SUPABASE_URL}</p>
        </div>
      </div>
    </div>
  )
}
