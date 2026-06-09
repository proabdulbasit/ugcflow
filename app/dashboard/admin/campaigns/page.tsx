'use client';
import DashboardLayout from '@/components/DashboardLayout';
import { LayoutDashboard, Users, Video, CreditCard, Eye, Settings } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getAdminCampaigns } from '@/lib/api';
import { ApiError } from '@/lib/api/client';
import Link from 'next/link';

export default function AdminCampaigns() {
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCampaigns = async () => {
    setLoading(true);
    try {
      const { campaigns: data } = await getAdminCampaigns();
      setCampaigns(
        data.map((c: any) => ({
          ...c,
          id: c.id ?? c._id?.toString(),
          payout_amount: c.payout_amount ?? c.payoutAmount,
          brands: c.brands
            ? { company_name: c.brands.company_name ?? c.brands.companyName }
            : null,
        }))
      );
    } catch (err) {
      if (err instanceof ApiError) console.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  return (
    <DashboardLayout role="Admin" navRole="admin">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Campaign Management</h1>
        <p className="text-gray-500 text-sm">Monitor and manage all active UGC campaigns.</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-50 text-gray-500 text-xs font-bold uppercase tracking-wider">
              <th className="px-6 py-4">Campaign Title</th>
              <th className="px-6 py-4">Brand</th>
              <th className="px-6 py-4">Payout</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-400">Loading campaigns...</td></tr>
            ) : campaigns.length === 0 ? (
              <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-400 italic">No campaigns found.</td></tr>
            ) : campaigns.map((campaign) => (
              <tr key={campaign.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="font-bold text-gray-900">{campaign.title}</div>
                  <div className="text-xs text-gray-500 line-clamp-1">{campaign.brief}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">{campaign.brands?.company_name}</div>
                </td>
                <td className="px-6 py-4">
                  <span className="font-bold text-gray-900">${campaign.payout_amount}</span>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    campaign.status === 'active' ? 'bg-green-50 text-green-600' :
                    campaign.status === 'completed' ? 'bg-blue-50 text-blue-600' :
                    'bg-gray-50 text-gray-600'
                  }`}>
                    {campaign.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <Link 
                    href={`/dashboard/admin/campaigns/${campaign.id}`}
                    className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-800 text-sm font-bold"
                  >
                    <Eye size={16} /> Details
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  );
}
