'use client';
import DashboardLayout from '@/components/DashboardLayout';
import { LayoutDashboard, Users, Package, Video, CreditCard, Check, X, Settings, Download } from 'lucide-react';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ pendingCreators: 0, activeBrands: 0, openCampaigns: 0, revenue: 0 });
  const [pendingApplications, setPendingApplications] = useState<any[]>([]);
  const [recentPayments, setRecentPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const fetchData = async () => {
    // 1. Stats
    const { count: creatorCount } = await supabase.from('creators').select('*', { count: 'exact', head: true }).eq('status', 'pending');
    const { count: brandCount } = await supabase.from('brands').select('*', { count: 'exact', head: true }).eq('status', 'approved');
    const { count: campaignCount } = await supabase.from('campaigns').select('*', { count: 'exact', head: true }).eq('status', 'active');
    
    // Changed 'paid' to 'completed' to match webhook logic
    const { data: paymentsData } = await supabase.from('payments').select('amount').eq('status', 'completed');
    const totalRevenue = paymentsData?.reduce((acc: number, curr: any) => acc + Number(curr.amount), 0) || 0;

    setStats({
      pendingCreators: creatorCount || 0,
      activeBrands: brandCount || 0,
      openCampaigns: campaignCount || 0,
      revenue: totalRevenue
    });

    // 2. Pending Creator Applications
    const { data: creators } = await supabase
      .from('creators')
      .select('*, profiles(full_name, email)')
      .eq('status', 'pending')
      .limit(5);
    if (creators) setPendingApplications(creators);

    // 3. Recent Payments
    const { data: payments } = await supabase
      .from('payments')
      .select('*, brands(company_name)')
      .order('created_at', { ascending: false })
      .limit(5);
    if (payments) setRecentPayments(payments);

    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const updateCreatorStatus = async (id: string, status: 'approved' | 'rejected') => {
    const { error } = await supabase.from('creators').update({ status }).eq('id', id);
    if (error) alert(error.message);
    else fetchData();
  };

  const sidebarItems = [
    { label: 'Overview', icon: LayoutDashboard, href: '/dashboard/admin' },
    { label: 'Creators', icon: Users, href: '/dashboard/admin/creators' },
    { label: 'Brands', icon: Users, href: '/dashboard/admin/brands' },
    { label: 'Campaigns', icon: Video, href: '/dashboard/admin/campaigns' },
    { label: 'Payments', icon: CreditCard, href: '/dashboard/admin/payments' },
    { label: 'Settings', icon: Settings, href: '/dashboard/settings' },
  ];

  const handleDownloadSource = () => {
    window.location.href = '/api/download-source';
  };

  return (
    <DashboardLayout role="Admin" items={sidebarItems}>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Admin Overview</h1>
        <button 
          onClick={handleDownloadSource}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all shadow-sm"
        >
          <Download size={16} />
          Download Source Code
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <div className="text-gray-500 text-sm mb-1">Pending Creators</div>
          <div className="text-2xl font-bold text-orange-600">{loading ? '...' : stats.pendingCreators}</div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <div className="text-gray-500 text-sm mb-1">Active Brands</div>
          <div className="text-2xl font-bold">{loading ? '...' : stats.activeBrands}</div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <div className="text-gray-500 text-sm mb-1">Open Campaigns</div>
          <div className="text-2xl font-bold">{loading ? '...' : stats.openCampaigns}</div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <div className="text-gray-500 text-sm mb-1">Total Revenue</div>
          <div className="text-2xl font-bold text-green-600">${loading ? '...' : stats.revenue.toLocaleString()}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <h3 className="font-bold mb-4">New Creator Applications</h3>
          <div className="space-y-4">
            {pendingApplications.length > 0 ? pendingApplications.map((creator) => (
              <div key={creator.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold">
                    {creator.profiles?.full_name?.charAt(0)}
                  </div>
                  <div>
                    <div className="font-medium">{creator.profiles?.full_name}</div>
                    <div className="text-xs text-gray-500">{creator.profiles?.email}</div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => updateCreatorStatus(creator.id, 'approved')}
                    className="p-1.5 bg-green-50 text-green-600 rounded hover:bg-green-100 transition-colors"
                  >
                    <Check size={16} />
                  </button>
                  <button 
                    onClick={() => updateCreatorStatus(creator.id, 'rejected')}
                    className="p-1.5 bg-red-50 text-red-600 rounded hover:bg-red-100 transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
            )) : (
              <div className="text-center py-8 text-gray-400 italic">No pending applications.</div>
            )}
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <h3 className="font-bold mb-4">Recent Payments</h3>
          <div className="space-y-4">
            {recentPayments.length > 0 ? recentPayments.map((payment) => (
              <div key={payment.id} className="flex items-center justify-between p-3 border-b border-gray-50 last:border-0">
                <div>
                  <div className="font-medium">{payment.brands?.company_name}</div>
                  <div className="text-xs text-gray-500">{new Date(payment.created_at).toLocaleDateString()}</div>
                </div>
                <div className="text-right">
                  <div className="font-bold">${Number(payment.amount).toLocaleString()}</div>
                  <div className="text-xs text-green-600 font-medium uppercase">{payment.status}</div>
                </div>
              </div>
            )) : (
              <div className="text-center py-8 text-gray-400 italic">No recent payments.</div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
