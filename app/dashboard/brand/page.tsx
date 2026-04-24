'use client';
import DashboardLayout from '@/components/DashboardLayout';
import { LayoutDashboard, Video, CreditCard, Settings, Plus, Clock, CheckCircle2, ChevronRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

export default function BrandDashboard() {
  const [stats, setStats] = useState({ activeCampaigns: 0, credits: 0, pendingDeliverables: 0 });
  const [recentDeliverables, setRecentDeliverables] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // 1. Get Brand Stats
      const { data: brand } = await supabase
        .from('brands')
        .select('credits')
        .eq('id', user.id)
        .single();

      const { count: campaignCount } = await supabase
        .from('campaigns')
        .select('*', { count: 'exact', head: true })
        .eq('brand_id', user.id)
        .eq('status', 'active');

      const { data: campaignIds } = await supabase
        .from('campaigns')
        .select('id')
        .eq('brand_id', user.id);

      const ids = (campaignIds ?? []).map((c: any) => c.id);
      const { count: pendingCount } =
        ids.length === 0
          ? { count: 0 }
          : await supabase
              .from('deliverables')
              .select('*', { count: 'exact', head: true })
              .in('campaign_id', ids)
              .eq('status', 'pending');

      setStats({
        activeCampaigns: campaignCount || 0,
        credits: brand?.credits || 0,
        pendingDeliverables: pendingCount || 0
      });

      // 2. Get Recent Deliverables
      const { data: deliverables } =
        ids.length === 0
          ? { data: [] as any[] }
          : await supabase
              .from('deliverables')
              .select(
                `
                *,
                campaigns (title),
                creators (profiles (full_name))
              `
              )
              .in('campaign_id', ids)
              .order('created_at', { ascending: false })
              .limit(5);

      if (deliverables) setRecentDeliverables(deliverables);
      setLoading(false);
    };

    fetchData();
  }, []);

  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    if (!sessionId) return;

    const run = async () => {
      try {
        await fetch('/api/reconcile-checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId }),
        });
      } finally {
        router.replace('/dashboard/brand');
        window.location.reload();
      }
    };
    run();
  }, [router, searchParams]);

  const sidebarItems = [
    { label: 'Overview', icon: LayoutDashboard, href: '/dashboard/brand' },
    { label: 'My Campaigns', icon: Video, href: '/dashboard/brand/campaigns' },
    { label: 'Billing', icon: CreditCard, href: '/dashboard/brand/billing' },
    { label: 'Settings', icon: Settings, href: '/dashboard/settings' },
  ];

  return (
    <DashboardLayout role="Brand" items={sidebarItems}>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Brand Overview</h1>
        <p className="text-gray-500 text-sm">Welcome back! Here's what's happening with your campaigns.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="text-gray-500 text-sm mb-1">Available Credits</div>
          <div className="text-2xl font-bold text-indigo-600">{loading ? '...' : stats.credits}</div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="text-gray-500 text-sm mb-1">Active Campaigns</div>
          <div className="text-2xl font-bold">{loading ? '...' : stats.activeCampaigns}</div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="text-gray-500 text-sm mb-1">Pending Review</div>
          <div className="text-2xl font-bold text-orange-600">{loading ? '...' : stats.pendingDeliverables}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-gray-900">Recent Deliverables</h3>
            <Link href="/dashboard/brand/campaigns" className="text-sm text-indigo-600 font-medium hover:underline">View All</Link>
          </div>
          
          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-8 text-gray-400">Loading...</div>
            ) : recentDeliverables.length > 0 ? (
              recentDeliverables.map((d) => (
                <div key={d.id} className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-xl transition-colors border border-transparent hover:border-gray-100">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                      <Video size={20} className="text-gray-400" />
                    </div>
                    <div>
                      <div className="font-bold text-gray-900">{d.campaigns?.title}</div>
                      <div className="text-xs text-gray-500">by {d.creators?.profiles?.full_name}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      d.status === 'pending' ? 'bg-orange-50 text-orange-600' : 
                      d.status === 'approved' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                    }`}>
                      {d.status}
                    </span>
                    <Link 
                      href={`/dashboard/brand/campaigns/${d.campaign_id}`}
                      className="p-2 text-gray-400 hover:text-indigo-600 transition-colors"
                    >
                      <ChevronRight size={18} />
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-gray-400 italic">
                No deliverables yet.
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-indigo-600 p-6 rounded-2xl text-white shadow-lg shadow-indigo-100">
            <h3 className="font-bold mb-2">Need more content?</h3>
            <p className="text-indigo-100 text-sm mb-6">Launch a new campaign and get high-quality UGC in days.</p>
            <Link 
              href="/dashboard/brand/campaigns/new"
              className="block w-full py-3 bg-white text-indigo-600 text-center rounded-xl font-bold hover:bg-indigo-50 transition-colors"
            >
              Create Campaign
            </Link>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <Link href="/dashboard/brand/billing" className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700">
                <CreditCard size={18} className="text-gray-400" />
                Buy Credits
              </Link>
              <Link href="/dashboard/settings" className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700">
                <Settings size={18} className="text-gray-400" />
                Account Settings
              </Link>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
