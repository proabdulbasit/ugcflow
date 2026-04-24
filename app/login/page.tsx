'use client';
import { Suspense, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Navbar from '@/components/Navbar';
import { useRouter, useSearchParams } from 'next/navigation';

function LoginInner() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const supabase = createClient();
  const router = useRouter();
  const searchParams = useSearchParams();
  const roleHint = searchParams.get('role');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) {
      setMessage({ type: 'error', text: 'App configuration error: Supabase environment variables are missing.' });
      return;
    }
    setLoading(true);
    setMessage(null);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setMessage({ type: 'error', text: error.message });
        return;
      }

      if (data.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', data.user.id)
          .single();

        if (profile?.role) {
          router.push(`/dashboard/${profile.role}`);
        } else {
          router.push('/');
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="pt-32 pb-20 px-6 flex justify-center">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 w-full max-w-md">
          <h1 className="text-3xl font-bold mb-2 text-center">Welcome Back</h1>
          <p className="text-gray-600 mb-6 text-center">
            {roleHint === 'brand'
              ? 'Brand login'
              : roleHint === 'creator'
                ? 'Creator login'
                : 'Sign in to your dashboard'}
          </p>

          <div className="grid grid-cols-2 gap-3 mb-6">
            <button
              type="button"
              onClick={() => router.push('/login?role=brand')}
              className={`py-2.5 rounded-xl font-bold text-sm transition-all ${
                roleHint === 'brand' ? 'bg-indigo-600 text-white' : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
              }`}
            >
              Brand
            </button>
            <button
              type="button"
              onClick={() => router.push('/login?role=creator')}
              className={`py-2.5 rounded-xl font-bold text-sm transition-all ${
                roleHint === 'creator' ? 'bg-indigo-600 text-white' : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
              }`}
            >
              Creator
            </button>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="name@company.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="••••••••"
              />
            </div>
            
            {message && (
              <div className={`p-3 rounded-lg text-sm font-medium ${
                message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
              }`}>
                {message.text}
              </div>
            )}

            <button
              disabled={loading}
              type="submit"
              className="w-full py-3 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-100 text-center">
            <p className="text-sm text-gray-500">
              Don't have an account?{' '}
              <button 
                onClick={() => router.push('/brand-apply')}
                className="text-indigo-600 font-semibold hover:underline"
              >
                Apply as a Brand
              </button>
              {' or '}
              <button 
                onClick={() => router.push('/creator-apply')}
                className="text-indigo-600 font-semibold hover:underline"
              >
                a Creator
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Login() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50" />}>
      <LoginInner />
    </Suspense>
  );
}
