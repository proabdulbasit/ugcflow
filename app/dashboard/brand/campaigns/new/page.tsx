'use client';
import DashboardLayout from '@/components/DashboardLayout';
import { Video, CreditCard, Settings, LayoutDashboard, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export default function NewCampaign() {
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [brief, setBrief] = useState('');
  const campaignCostCredits = 89;
  const supabase = createClient();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: brand } = await supabase.from('brands').select('credits').eq('id', user.id).single();
    const available = Number(brand?.credits ?? 0);
    if (!Number.isFinite(available) || available < campaignCostCredits) {
      alert(`Not enough credits. You need ${campaignCostCredits} credits to create a campaign.`);
      setLoading(false);
      return;
    }

    const { data: spent, error: spendError } = await supabase.rpc('spend_brand_credits', {
      brand_id_input: user.id,
      amount_input: campaignCostCredits,
    });
    if (spendError) {
      alert(spendError.message);
      setLoading(false);
      return;
    }
    if (!spent) {
      alert(`Not enough credits. You need ${campaignCostCredits} credits to create a campaign.`);
      setLoading(false);
      return;
    }

    const { error } = await supabase.from('campaigns').insert({
      brand_id: user.id,
      title,
      brief,
      status: 'active'
    });

    if (error) {
      alert(error.message);
    } else {
      router.push('/dashboard/brand/campaigns');
    }
    setLoading(false);
  };

  const sidebarItems = [
    { label: 'Overview', icon: LayoutDashboard, href: '/dashboard/brand' },
    { label: 'My Campaigns', icon: Video, href: '/dashboard/brand/campaigns' },
    { label: 'Billing', icon: CreditCard, href: '/dashboard/brand/billing' },
    { label: 'Settings', icon: Settings, href: '/dashboard/settings' },
  ];

  return (
    <DashboardLayout role="Brand" items={sidebarItems}>
      <div className="max-w-2xl mx-auto">
        <Link 
          href="/dashboard/brand/campaigns" 
          className="flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft size={18} />
          Back to Campaigns
        </Link>

        <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
          <h1 className="text-2xl font-bold mb-2">Create New Campaign</h1>
          <p className="text-gray-500 mb-8 text-sm">Fill out the details below to start receiving applications from creators.</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Campaign Title</label>
              <input
                required
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="e.g. Summer Skincare Routine UGC"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Campaign Brief & Requirements</label>
              <textarea
                required
                value={brief}
                onChange={(e) => setBrief(e.target.value)}
                className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none h-48"
                placeholder="Describe what you're looking for, key talking points, and any specific requirements..."
              ></textarea>
            </div>

            <div className="bg-gray-50 border border-gray-100 rounded-2xl p-5">
              <div className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Campaign cost</div>
              <div className="text-lg font-black text-gray-900">{campaignCostCredits} credits</div>
              <div className="text-xs text-gray-500 mt-1">Credits are deducted when you launch.</div>
            </div>

            <button
              disabled={loading}
              type="submit"
              className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all disabled:opacity-50 shadow-lg shadow-indigo-100"
            >
              {loading ? 'Launching...' : 'Launch Campaign'}
            </button>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}
