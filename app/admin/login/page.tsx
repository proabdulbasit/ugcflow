'use client';
import Navbar from '@/components/Navbar';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { getMe, login, logout } from '@/lib/api/auth';
import { ApiError } from '@/lib/api/client';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      await login(email, password);
      const { user } = await getMe();

      if (user.role !== 'admin') {
        await logout();
        setMessage({ type: 'error', text: 'This account is not an admin.' });
        return;
      }

      router.push('/dashboard/admin');
    } catch (err) {
      const text = err instanceof ApiError ? err.message : 'Login failed';
      setMessage({ type: 'error', text });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="pt-32 pb-20 px-6 flex justify-center">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 w-full max-w-md">
          <h1 className="text-3xl font-bold mb-2 text-center">Admin Login</h1>
          <p className="text-gray-600 mb-8 text-center">Sign in to the admin dashboard.</p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="admin@company.com" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="••••••••" />
            </div>
            {message && (
              <div className={`p-3 rounded-lg text-sm font-medium ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>{message.text}</div>
            )}
            <button disabled={loading} type="submit" className="w-full py-3 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 transition-colors disabled:opacity-50">{loading ? 'Signing in…' : 'Sign In'}</button>
          </form>
        </div>
      </div>
    </div>
  );
}
