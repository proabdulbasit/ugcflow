'use client';
import Link from 'next/link';
import { useMemo, useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function Navbar() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    if (!supabase) return;
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      
      if (user) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();
        setProfile(profileData);
      }
    };
    fetchUser();
  }, []);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <Link href="/" className="text-2xl font-black text-indigo-600 tracking-tighter">
          UGCFLOW
        </Link>
        
        <div className="hidden md:flex items-center gap-8">
          <Link href="/how-it-works" className="text-sm font-bold text-gray-600 hover:text-indigo-600 transition-colors">How it Works</Link>
          <Link href="/pricing" className="text-sm font-bold text-gray-600 hover:text-indigo-600 transition-colors">Pricing</Link>
          <Link href="/brand-apply" className="text-sm font-bold text-gray-600 hover:text-indigo-600 transition-colors">Brands</Link>
          <Link href="/creator-apply" className="text-sm font-bold text-gray-600 hover:text-indigo-600 transition-colors">Creators</Link>
        </div>

        <div className="flex items-center gap-4">
          {user ? (
            profile?.role === 'admin' ? null : (
              <Link
                href={`/dashboard/${profile?.role || 'brand'}`}
                className="px-6 py-2.5 bg-indigo-600 text-white rounded-full font-bold text-sm hover:bg-indigo-700 transition-all"
              >
                Dashboard
              </Link>
            )
          ) : (
            <>
              <Link
                href="/login?role=brand"
                className="text-sm font-bold text-gray-600 hover:text-indigo-600 transition-colors"
              >
                Brand Login
              </Link>
              <Link
                href="/login?role=creator"
                className="text-sm font-bold text-gray-600 hover:text-indigo-600 transition-colors"
              >
                Creator Login
              </Link>
              <Link href="/brand-apply" className="px-6 py-2.5 bg-indigo-600 text-white rounded-full font-bold text-sm hover:bg-indigo-700 transition-all">
                Get Started
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
