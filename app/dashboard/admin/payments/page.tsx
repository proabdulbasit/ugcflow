'use client';
import DashboardLayout from '@/components/DashboardLayout';
import { CreditCard, LayoutDashboard, Search, Settings, Users, Video } from 'lucide-react';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const supabase = createClient();

  useEffect(() => {
    const fetchPayments = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('payments')
        .select('*, brands(company_name), packages(name)')
        .order('created_at', { ascending: false })
        .limit(200);
      if (error) alert(error.message);
      setPayments(data ?? []);
      setLoading(false);
    };
    fetchPayments();
  }, []);

  const sidebarItems = [
    { label: 'Overview', icon: LayoutDashboard, href: '/dashboard/admin' },
    { label: 'Creators', icon: Users, href: '/dashboard/admin/creators' },
    { label: 'Brands', icon: Users, href: '/dashboard/admin/brands' },
    { label: 'Campaigns', icon: Video, href: '/dashboard/admin/campaigns' },
    { label: 'Submissions', icon: Video, href: '/dashboard/admin/submissions' },
    { label: 'Payments', icon: CreditCard, href: '/dashboard/admin/payments' },
    { label: 'Settings', icon: Settings, href: '/dashboard/settings' },
  ];

  const filtered = payments.filter((p: any) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    const brand = (p.brands?.company_name ?? '').toLowerCase();
    const pack = (p.packages?.name ?? '').toLowerCase();
    const status = (p.status ?? '').toLowerCase();
    const intent = (p.stripe_payment_intent_id ?? '').toLowerCase();
    return brand.includes(q) || pack.includes(q) || status.includes(q) || intent.includes(q);
  });

  const statusBadge = (status: string) => (
    <span
      className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
        status === 'completed'
          ? 'bg-green-50 text-green-600'
          : status === 'failed'
            ? 'bg-red-50 text-red-600'
            : 'bg-orange-50 text-orange-600'
      }`}
    >
      {status}
    </span>
  );

  return (
    <DashboardLayout role="Admin" items={sidebarItems}>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Payments</h1>
        <p className="text-gray-500 text-sm">View payments created from Stripe checkout + internal records.</p>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm mb-6 flex items-center gap-3">
        <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400">
          <Search size={18} />
        </div>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search brand, package, status, or payment intent…"
          className="flex-1 p-3 outline-none text-sm"
        />
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-50 text-gray-500 text-xs font-bold uppercase tracking-wider">
              <th className="px-6 py-4">Brand</th>
              <th className="px-6 py-4">Package</th>
              <th className="px-6 py-4">Amount</th>
              <th className="px-6 py-4">Date</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Stripe Intent</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              <tr>
                <td colSpan={7} className="px-6 py-10 text-center text-gray-400">
                  Loading payments…
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-10 text-center text-gray-400 italic">
                  No payments found.
                </td>
              </tr>
            ) : (
              filtered.map((p: any) => (
                <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-bold text-gray-900">{p.brands?.company_name ?? '—'}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{p.packages?.name ?? '—'}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-bold text-gray-900">${Number(p.amount).toLocaleString()}</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {p.created_at ? new Date(p.created_at).toLocaleDateString() : '—'}
                  </td>
                  <td className="px-6 py-4">{statusBadge(p.status ?? 'pending')}</td>
                  <td className="px-6 py-4">
                    <div className="text-xs text-gray-500 font-mono truncate max-w-[240px]">
                      {p.stripe_payment_intent_id ?? '—'}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  );
}
