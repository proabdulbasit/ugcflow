'use client';
import DashboardLayout from '@/components/DashboardLayout';
import { LayoutDashboard, Video, Search, DollarSign, TrendingUp, Wallet, Clock, CheckCircle2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function CreatorEarnings() {
  const [earnings, setEarnings] = useState<any[]>([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, paid: 0 });
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchEarnings = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('creator_earnings')
        .select('*, campaigns(title)')
        .eq('creator_id', user.id)
        .order('created_at', { ascending: false });
      
      if (data) {
        setEarnings(data);
        const total = data.reduce((acc, curr) => acc + Number(curr.amount), 0);
        const pending = data.filter(e => e.status === 'pending').reduce((acc, curr) => acc + Number(curr.amount), 0);
        const paid = data.filter(e => e.status === 'paid').reduce((acc, curr) => acc + Number(curr.amount), 0);
        setStats({ total, pending, paid });
      }
      setLoading(false);
    };
    fetchEarnings();
  }, []);

  const sidebarItems = [
    { label: 'Overview', icon: LayoutDashboard, href: '/dashboard/creator' },
    { label: 'Browse Jobs', icon: Search, href: '/dashboard/creator/browse' },
    { label: 'My Assignments', icon: Video, href: '/dashboard/creator/assignments' },
    { label: 'Earnings', icon: DollarSign, href: '/dashboard/creator/earnings' },
  ];

  return (
    <DashboardLayout role="Creator" items={sidebarItems}>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">My Earnings</h1>
        <p className="text-gray-500 text-sm">Track your income and payout status.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center mb-4">
            <TrendingUp size={20} />
          </div>
          <div className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">Total Earned</div>
          <div className="text-3xl font-black text-gray-900">${stats.total.toLocaleString()}</div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="w-10 h-10 bg-orange-50 text-orange-600 rounded-lg flex items-center justify-center mb-4">
            <Clock size={20} />
          </div>
          <div className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">Pending Payout</div>
          <div className="text-3xl font-black text-orange-600">${stats.pending.toLocaleString()}</div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="w-10 h-10 bg-green-50 text-green-600 rounded-lg flex items-center justify-center mb-4">
            <Wallet size={20} />
          </div>
          <div className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">Paid to Date</div>
          <div className="text-3xl font-black text-green-600">${stats.paid.toLocaleString()}</div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-50">
          <h3 className="font-bold text-gray-900">Transaction History</h3>
        </div>
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-50 text-gray-500 text-xs font-bold uppercase tracking-wider">
              <th className="px-6 py-4">Campaign</th>
              <th className="px-6 py-4">Amount</th>
              <th className="px-6 py-4">Date</th>
              <th className="px-6 py-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-400">Loading earnings...</td></tr>
            ) : earnings.length === 0 ? (
              <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-400 italic">No earnings recorded yet.</td></tr>
            ) : earnings.map((earning) => (
              <tr key={earning.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="font-bold text-gray-900">{earning.campaigns?.title}</div>
                  <div className="text-[10px] text-gray-400 uppercase font-bold">UGC Video Payout</div>
                </td>
                <td className="px-6 py-4">
                  <span className="font-bold text-gray-900">${Number(earning.amount).toLocaleString()}</span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {new Date(earning.created_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    {earning.status === 'paid' ? (
                      <span className="flex items-center gap-1 text-green-600 text-xs font-bold uppercase">
                        <CheckCircle2 size={14} /> Paid
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-orange-600 text-xs font-bold uppercase">
                        <Clock size={14} /> Pending
                      </span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  );
}
