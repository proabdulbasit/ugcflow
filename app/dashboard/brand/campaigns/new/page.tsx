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
  const [payout, setPayout] = useState(150);
  const supabase = createClient();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from('campaigns').insert({
      brand_id: user.id,
      title,
      brief,
      payout_amount: payout,
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

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Creator Payout (per video)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">$</span>
                <input
                  required
                  type="number"
                  value={payout}
                  onChange={(e) => setPayout(Number(e.target.value))}
                  className="w-full p-3 pl-8 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  min="50"
                />
              </div>
              <p className="text-xs text-gray-400 mt-2">Minimum payout is $50 per video.</p>
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
