'use client';
import DashboardLayout from '@/components/DashboardLayout';
import { LayoutDashboard, Video, Search, DollarSign, Clock, CheckCircle2, TrendingUp } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getCreatorOverview } from '@/lib/api';
import { ApiError } from '@/lib/api/client';
import Link from 'next/link';

export default function CreatorDashboard() {
  const [stats, setStats] = useState({ activeJobs: 0, totalEarnings: 0, pendingReview: 0 });
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await getCreatorOverview();
        setStats({
          activeJobs: data.activeAssignments || 0,
          totalEarnings: data.totalEarnings || 0,
          pendingReview: data.pendingDeliverables || 0,
        });
      } catch (err) {
        if (err instanceof ApiError) console.error(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <DashboardLayout role="Creator" navRole="creator">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Creator Overview</h1>
        <p className="text-gray-500 text-sm">Track your active projects and earnings.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="text-gray-500 text-sm mb-1">Active Assignments</div>
          <div className="text-2xl font-bold">{loading ? '...' : stats.activeJobs}</div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="text-gray-500 text-sm mb-1">Pending Review</div>
          <div className="text-2xl font-bold text-orange-600">{loading ? '...' : stats.pendingReview}</div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="text-gray-500 text-sm mb-1">Total Earnings</div>
          <div className="text-2xl font-bold text-green-600">${loading ? '...' : stats.totalEarnings.toLocaleString()}</div>
        </div>
      </div>

      {stats.activeJobs === 0 && !loading && (
        <div className="bg-white p-12 rounded-3xl border border-gray-100 shadow-sm text-center">
          <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <Search size={40} />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Find your next gig</h3>
          <p className="text-gray-500 mb-8 max-w-md mx-auto">
            Browse open campaigns and apply to start working with top brands.
          </p>
          <Link 
            href="/dashboard/creator/browse" 
            className="inline-block bg-indigo-600 text-white px-8 py-4 rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
          >
            Browse Open Jobs
          </Link>
        </div>
      )}
    </DashboardLayout>
  );
}
