'use client';
import Link from 'next/link';
import { useMemo, useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Menu, X } from 'lucide-react';

export default function Navbar() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const supabase = useMemo(() => createClient(), []);
  const [profileLoading, setProfileLoading] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!supabase) return;
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      
      if (user) {
        setProfileLoading(true);
        const { data: profileData } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();
        setProfile(profileData);
        setProfileLoading(false);
      }
    };
    fetchUser();
  }, []);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between">
        <Link href="/" className="text-2xl font-black text-indigo-600 tracking-tighter">
          UGCFLOW
        </Link>
        
        <div className="hidden md:flex items-center gap-8">
          <Link href="/how-it-works" className="text-sm font-bold text-gray-600 hover:text-indigo-600 transition-colors">How it Works</Link>
          <Link href="/pricing" className="text-sm font-bold text-gray-600 hover:text-indigo-600 transition-colors">Pricing</Link>
          <Link href="/brand-apply" className="text-sm font-bold text-gray-600 hover:text-indigo-600 transition-colors">Brands</Link>
          <Link href="/creator-apply" className="text-sm font-bold text-gray-600 hover:text-indigo-600 transition-colors">Creators</Link>
        </div>

        <div className="hidden md:flex items-center gap-4">
          {user ? (
            profile?.role === 'admin' ? null : (
              <Link
                href="/dashboard"
                className={`px-6 py-2.5 bg-indigo-600 text-white rounded-full font-bold text-sm hover:bg-indigo-700 transition-all ${profileLoading ? 'opacity-80' : ''}`}
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

        <button
          type="button"
          className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-xl border border-gray-200 bg-white/70 hover:bg-white transition"
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen((v) => !v)}
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white/95 backdrop-blur-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 space-y-2">
            <Link onClick={() => setMobileOpen(false)} href="/how-it-works" className="block px-3 py-2 rounded-xl font-semibold text-gray-700 hover:bg-gray-50">
              How it Works
            </Link>
            <Link onClick={() => setMobileOpen(false)} href="/pricing" className="block px-3 py-2 rounded-xl font-semibold text-gray-700 hover:bg-gray-50">
              Pricing
            </Link>
            <Link onClick={() => setMobileOpen(false)} href="/brand-apply" className="block px-3 py-2 rounded-xl font-semibold text-gray-700 hover:bg-gray-50">
              Brands
            </Link>
            <Link onClick={() => setMobileOpen(false)} href="/creator-apply" className="block px-3 py-2 rounded-xl font-semibold text-gray-700 hover:bg-gray-50">
              Creators
            </Link>

            <div className="pt-2 border-t border-gray-100 flex flex-col gap-2">
              {user ? (
                profile?.role === 'admin' ? null : (
                  <Link
                    onClick={() => setMobileOpen(false)}
                    href="/dashboard"
                    className="w-full text-center px-4 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition"
                  >
                    Dashboard
                  </Link>
                )
              ) : (
                <>
                  <Link onClick={() => setMobileOpen(false)} href="/login?role=brand" className="w-full text-center px-4 py-3 rounded-xl font-bold border border-gray-200 text-gray-700 hover:bg-gray-50 transition">
                    Brand Login
                  </Link>
                  <Link onClick={() => setMobileOpen(false)} href="/login?role=creator" className="w-full text-center px-4 py-3 rounded-xl font-bold border border-gray-200 text-gray-700 hover:bg-gray-50 transition">
                    Creator Login
                  </Link>
                  <Link onClick={() => setMobileOpen(false)} href="/brand-apply" className="w-full text-center px-4 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition">
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
