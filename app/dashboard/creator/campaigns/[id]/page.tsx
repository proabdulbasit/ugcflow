'use client';
import DashboardLayout from '@/components/DashboardLayout';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { LayoutDashboard, Video, CreditCard, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function NewCampaign() {
  const [loading, setLoading] = useState(false);
  const supabase = createClient();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const title = formData.get('title') as string;
    const brief = formData.get('brief') as string;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('campaigns')
      .insert({
        brand_id: user.id,
        title,
        brief,
        status: 'active'
      });

    if (error) {
      alert(error.message);
    } else {
      router.push('/dashboard/brand');
    }
    setLoading(false);
  };

  const sidebarItems = [
    { label: 'Overview', icon: LayoutDashboard, href: '/dashboard/brand' },
    { label: 'My Campaigns', icon: Video, href: '/dashboard/brand/campaigns' },
    { label: 'Billing', icon: CreditCard, href: '/dashboard/brand/billing' },
  ];

  return (
    <DashboardLayout role="Brand" items={sidebarItems}>
      <div className="max-w-2xl mx-auto">
        <Link href="/dashboard/brand" className="flex items-center gap-2 text-gray-500 hover:text-indigo-600 mb-6 transition-colors">
          <ArrowLeft size={18} />
          Back to Dashboard
        </Link>
        
        <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
          <h1 className="text-2xl font-bold mb-6">Create New Campaign</h1>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Campaign Title</label>
              <input 
                name="title" 
                required 
                placeholder="e.g. Summer Skincare Routine"
                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Campaign Brief</label>
              <textarea 
                name="brief" 
                required 
                placeholder="Describe what you're looking for, key talking points, and any specific requirements..."
                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none h-48"
              ></textarea>
            </div>
            <button 
              disabled={loading} 
              type="submit" 
              className="w-full py-4 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Launch Campaign'}
            </button>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}
