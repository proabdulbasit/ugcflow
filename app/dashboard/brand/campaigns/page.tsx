'use client';
import DashboardLayout from '@/components/DashboardLayout';
import { LayoutDashboard, Video, CreditCard, Settings, Plus, Search, Filter, ChevronRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';

export default function BrandCampaigns() {
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchCampaigns = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('campaigns')
        .select(`
          *,
          deliverables(count),
          campaign_applications(count)
        `)
        .eq('brand_id', user.id)
        .order('created_at', { ascending: false });
      
      if (data) setCampaigns(data);
      setLoading(false);
    };
    fetchCampaigns();
  }, []);

  const sidebarItems = [
    { label: 'Overview', icon: LayoutDashboard, href: '/dashboard/brand' },
    { label: 'My Campaigns', icon: Video, href: '/dashboard/brand/campaigns' },
    { label: 'Billing', icon: CreditCard, href: '/dashboard/brand/billing' },
    { label: 'Settings', icon: Settings, href: '/dashboard/settings' },
  ];

  return (
    <DashboardLayout role="Brand" items={sidebarItems}>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Campaigns</h1>
          <p className="text-gray-500 text-sm">Manage your active briefs and creator submissions.</p>
        </div>
        <Link 
          href="/dashboard/brand/campaigns/new"
          className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
        >
          <Plus size={18} />
          Create Campaign
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-400">Loading campaigns...</div>
        ) : campaigns.length === 0 ? (
          <div className="p-20 text-center">
            <div className="w-16 h-16 bg-gray-50 text-gray-300 rounded-full flex items-center justify-center mx-auto mb-4">
              <Video size={32} />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">No campaigns yet</h3>
            <p className="text-gray-500 mb-6">Launch your first campaign to start receiving UGC.</p>
            <Link href="/dashboard/brand/campaigns/new" className="text-indigo-600 font-bold hover:underline">
              Get Started →
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {campaigns.map((campaign) => (
              <Link 
                key={campaign.id} 
                href={`/dashboard/brand/campaigns/${campaign.id}`}
                className="flex items-center justify-between p-6 hover:bg-gray-50/50 transition-colors group"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">{campaign.title}</h3>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      campaign.status === 'active' ? 'bg-green-50 text-green-600' : 'bg-gray-50 text-gray-500'
                    }`}>
                      {campaign.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span>Created {new Date(campaign.created_at).toLocaleDateString()}</span>
                    <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                    <span className="font-medium text-gray-700">{campaign.campaign_applications[0]?.count || 0} Applications</span>
                    <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                    <span className="font-medium text-gray-700">{campaign.deliverables[0]?.count || 0} Videos</span>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right hidden md:block">
                    <div className="text-sm font-bold text-gray-900">${campaign.payout_amount}</div>
                    <div className="text-[10px] text-gray-400 uppercase font-bold">Per Video</div>
                  </div>
                  <ChevronRight size={20} className="text-gray-300 group-hover:text-indigo-600 transition-all group-hover:translate-x-1" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
