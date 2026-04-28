'use client';
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LogOut, Menu, X } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface SidebarItem {
  label: string;
  icon: any;
  href: string;
}

export default function DashboardLayout({ 
  children, 
  role, 
  items 
}: { 
  children: React.ReactNode; 
  role: string; 
  items: SidebarItem[] 
}) {
  const pathname = usePathname();
  const supabase = createClient();
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/login';
  };

  const SidebarNav = (
    <>
      <div className="p-6">
        <Link href="/" className="text-2xl font-black text-indigo-600 tracking-tighter">
          UGCFLOW
        </Link>
        <div className="mt-1 text-[10px] font-bold uppercase tracking-widest text-gray-400 bg-gray-50 px-2 py-1 rounded inline-block">
          {role} Panel
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-1">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${
                isActive
                  ? 'bg-indigo-50 text-indigo-600'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <Icon size={20} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-50">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 w-full text-left text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-xl font-medium transition-all"
        >
          <LogOut size={20} />
          Logout
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-gray-50 md:flex">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-64 bg-white border-r border-gray-100 flex-col sticky top-0 h-screen">
        {SidebarNav}
      </aside>

      {/* Mobile header */}
      <div className="md:hidden sticky top-0 z-40 bg-gray-50/80 backdrop-blur-md border-b border-gray-100">
        <div className="h-14 px-4 flex items-center justify-between">
          <button
            type="button"
            className="inline-flex items-center justify-center w-10 h-10 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 transition"
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((v) => !v)}
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <div className="text-sm font-bold text-gray-900">{role} Dashboard</div>
          <div className="w-10" />
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/30"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />
          <aside className="absolute left-0 top-0 bottom-0 w-80 max-w-[85vw] bg-white border-r border-gray-100 flex flex-col">
            {SidebarNav}
          </aside>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 px-4 py-6 sm:px-6 sm:py-8 overflow-x-hidden">
        {children}
      </main>
    </div>
  );
}
