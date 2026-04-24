'use client';
import DashboardLayout from '@/components/DashboardLayout';
import { createClient } from '@/lib/supabase/client';
import { CreditCard, LayoutDashboard, MessageSquare, Settings, TrendingUp, Users, Video } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

export default function AdminAnalyticsPage() {
  const supabase = useMemo(() => createClient(), []);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    pendingCreators: 0,
    pendingBrands: 0,
    activeCampaigns: 0,
    pendingSubmissions: 0,
    approvedSubmissions: 0,
    rejectedSubmissions: 0,
    revenue: 0,
  });

  const sidebarItems = [
    { label: 'Overview', icon: LayoutDashboard, href: '/dashboard/admin' },
    { label: 'Analytics', icon: TrendingUp, href: '/dashboard/admin/analytics' },
    { label: 'Creators', icon: Users, href: '/dashboard/admin/creators' },
    { label: 'Brands', icon: Users, href: '/dashboard/admin/brands' },
    { label: 'Campaigns', icon: Video, href: '/dashboard/admin/campaigns' },
    { label: 'Submissions', icon: Video, href: '/dashboard/admin/submissions' },
    { label: 'Messaging', icon: MessageSquare, href: '/dashboard/admin/messaging' },
    { label: 'Payments', icon: CreditCard, href: '/dashboard/admin/payments' },
    { label: 'Settings', icon: Settings, href: '/dashboard/settings' },
  ];

  useEffect(() => {
    const fetchStats = async () => {
      if (!supabase) return;
      setLoading(true);

      const [
        { count: pendingCreators },
        { count: pendingBrands },
        { count: activeCampaigns },
        { count: pendingSubmissions },
        { count: approvedSubmissions },
        { count: rejectedSubmissions },
        { data: paymentsData },
      ] = await Promise.all([
        supabase.from('creators').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('brands').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('campaigns').select('*', { count: 'exact', head: true }).eq('status', 'active'),
        supabase.from('deliverables').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('deliverables').select('*', { count: 'exact', head: true }).eq('status', 'approved'),
        supabase.from('deliverables').select('*', { count: 'exact', head: true }).eq('status', 'rejected'),
        supabase.from('payments').select('amount').eq('status', 'completed'),
      ]);

      const revenue = paymentsData?.reduce((acc: number, curr: any) => acc + Number(curr.amount), 0) || 0;

      setStats({
        pendingCreators: pendingCreators || 0,
        pendingBrands: pendingBrands || 0,
        activeCampaigns: activeCampaigns || 0,
        pendingSubmissions: pendingSubmissions || 0,
        approvedSubmissions: approvedSubmissions || 0,
        rejectedSubmissions: rejectedSubmissions || 0,
        revenue,
      });
      setLoading(false);
    };
    fetchStats();
  }, [supabase]);

  const card = (label: string, value: React.ReactNode, accent?: string) => (
    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
      <div className="text-gray-500 text-sm mb-1">{label}</div>
      <div className={`text-2xl font-bold ${accent ?? ''}`}>{value}</div>
    </div>
  );

  return (
    <DashboardLayout role="Admin" items={sidebarItems}>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        <p className="text-gray-500 text-sm">Platform snapshot across applications, campaigns, submissions, and revenue.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {card('Pending Creators', loading ? '…' : stats.pendingCreators, 'text-orange-600')}
        {card('Pending Brands', loading ? '…' : stats.pendingBrands, 'text-orange-600')}
        {card('Active Campaigns', loading ? '…' : stats.activeCampaigns)}
        {card('Revenue (Completed)', loading ? '…' : `$${stats.revenue.toLocaleString()}`, 'text-green-600')}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {card('Pending Submissions', loading ? '…' : stats.pendingSubmissions, 'text-orange-600')}
        {card('Approved Submissions', loading ? '…' : stats.approvedSubmissions, 'text-green-600')}
        {card('Rejected Submissions', loading ? '…' : stats.rejectedSubmissions, 'text-red-600')}
      </div>
    </DashboardLayout>
  );
}

