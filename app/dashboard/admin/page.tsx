'use client';
import DashboardLayout from '@/components/DashboardLayout';
import { Check, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getAdminOverview, updateCreatorStatus, updateBrandStatus } from '@/lib/api';
import { ApiError } from '@/lib/api/client';
import { toast } from '@/lib/toast';

function mapCreator(c: any) {
  return {
    ...c,
    profiles: c.profiles
      ? {
          full_name: c.profiles.full_name ?? c.profiles.fullName,
          email: c.profiles.email,
        }
      : null,
  };
}

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    pendingCreators: 0,
    pendingBrands: 0,
    activeBrands: 0,
    openCampaigns: 0,
    pendingSubmissions: 0,
    approvedSubmissions: 0,
    rejectedSubmissions: 0,
    revenue: 0,
  });
  const [pendingApplications, setPendingApplications] = useState<any[]>([]);
  const [pendingBrandApplications, setPendingBrandApplications] = useState<any[]>([]);
  const [recentPayments, setRecentPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const data = await getAdminOverview();
      setStats({
        pendingCreators: data.pendingCreators || 0,
        pendingBrands: data.pendingBrands || 0,
        activeBrands: data.approvedBrands || 0,
        openCampaigns: data.activeCampaigns || 0,
        pendingSubmissions: data.pendingSubmissions || 0,
        approvedSubmissions: data.approvedSubmissions || 0,
        rejectedSubmissions: data.rejectedSubmissions || 0,
        revenue: data.revenue || 0,
      });
      setPendingApplications((data.pendingCreatorList ?? []).map(mapCreator));
      setPendingBrandApplications(data.pendingBrandList ?? []);
      setRecentPayments(
        (data.recentPayments ?? []).map((p: any) => ({
          ...p,
          created_at: p.created_at ?? p.createdAt,
          brands: p.brands ?? (p.brand ? { company_name: p.brand.companyName } : null),
        }))
      );
    } catch (err) {
      if (err instanceof ApiError) console.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUpdateCreatorStatus = async (id: string, status: 'approved' | 'rejected') => {
    try {
      await updateCreatorStatus(id, status);
      fetchData();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Update failed');
    }
  };

  const handleUpdateBrandStatus = async (id: string, status: 'approved' | 'rejected') => {
    try {
      await updateBrandStatus(id, status);
      toast.success(status === 'approved' ? 'Brand approved' : 'Brand rejected');
      fetchData();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Update failed');
    }
  };

  return (
    <DashboardLayout role="Admin" navRole="admin">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Admin Overview</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <div className="text-gray-500 text-sm mb-1">Pending Creators</div>
          <div className="text-2xl font-bold text-orange-600">{loading ? '...' : stats.pendingCreators}</div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <div className="text-gray-500 text-sm mb-1">Pending Brands</div>
          <div className="text-2xl font-bold text-orange-600">{loading ? '...' : stats.pendingBrands}</div>
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <div className="text-gray-500 text-sm mb-1">Pending Submissions</div>
          <div className="text-2xl font-bold text-orange-600">{loading ? '...' : stats.pendingSubmissions}</div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <div className="text-gray-500 text-sm mb-1">Approved Submissions</div>
          <div className="text-2xl font-bold text-green-600">{loading ? '...' : stats.approvedSubmissions}</div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <div className="text-gray-500 text-sm mb-1">Rejected Submissions</div>
          <div className="text-2xl font-bold text-red-600">{loading ? '...' : stats.rejectedSubmissions}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
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
                    onClick={() => handleUpdateCreatorStatus(creator.id, 'approved')}
                    className="p-1.5 bg-green-50 text-green-600 rounded hover:bg-green-100 transition-colors"
                  >
                    <Check size={16} />
                  </button>
                  <button 
                    onClick={() => handleUpdateCreatorStatus(creator.id, 'rejected')}
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

        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <h3 className="font-bold mb-4">New Brand Applications</h3>
          <div className="space-y-4">
            {pendingBrandApplications.length > 0 ? pendingBrandApplications.map((brand: any) => (
              <div key={brand.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
                <div>
                  <div className="font-medium">{brand.company_name ?? brand.profiles?.full_name}</div>
                  <div className="text-xs text-gray-500">{brand.profiles?.email}</div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleUpdateBrandStatus(brand.id, 'approved')}
                    className="p-1.5 bg-green-50 text-green-600 rounded hover:bg-green-100 transition-colors"
                  >
                    <Check size={16} />
                  </button>
                  <button
                    onClick={() => handleUpdateBrandStatus(brand.id, 'rejected')}
                    className="p-1.5 bg-red-50 text-red-600 rounded hover:bg-red-100 transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
            )) : (
              <div className="text-center py-8 text-gray-400 italic">No pending brand applications.</div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
