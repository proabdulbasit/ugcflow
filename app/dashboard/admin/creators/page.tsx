'use client';
import DashboardLayout from '@/components/DashboardLayout';
import { LayoutDashboard, Video, Search, DollarSign, ChevronRight, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';

export default function CreatorAssignments() {
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchAssignments = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch campaigns where the creator is assigned
      const { data } = await supabase
        .from('campaign_creators')
        .select(`
          campaign_id,
          campaigns (
            id,
            title,
            payout_amount,
            brands (company_name)
          )
        `)
        .eq('creator_id', user.id);

      // Fetch deliverables for these campaigns to show status
      const { data: deliverables } = await supabase
        .from('deliverables')
        .select('campaign_id, status')
        .eq('creator_id', user.id);

      if (data) {
        const formatted = data.map((item: any) => ({
          ...item.campaigns,
          deliverableStatus: deliverables?.find(d => d.campaign_id === item.campaign_id)?.status || 'not_started'
        }));
        setAssignments(formatted);
      }
      setLoading(false);
    };
    fetchAssignments();
  }, []);

  const sidebarItems = [
    { label: 'Overview', icon: LayoutDashboard, href: '/dashboard/creator' },
    { label: 'Browse Jobs', icon: Search, href: '/dashboard/creator/browse' },
    { label: 'My Assignments', icon: Video, href: '/dashboard/creator/assignments' },
    { label: 'Earnings', icon: DollarSign, href: '/dashboard/creator/earnings' },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved': return <span className="bg-green-50 text-green-600 px-2 py-1 rounded-full text-[10px] font-bold uppercase">Approved</span>;
      case 'pending': return <span className="bg-orange-50 text-orange-600 px-2 py-1 rounded-full text-[10px] font-bold uppercase">Pending Review</span>;
      case 'rejected': return <span className="bg-red-50 text-red-600 px-2 py-1 rounded-full text-[10px] font-bold uppercase">Revision Requested</span>;
      default: return <span className="bg-gray-50 text-gray-500 px-2 py-1 rounded-full text-[10px] font-bold uppercase">Not Started</span>;
    }
  };

  return (
    <DashboardLayout role="Creator" items={sidebarItems}>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">My Assignments</h1>
        <p className="text-gray-500 text-sm">Track your active projects and upload deliverables.</p>
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-400">Loading assignments...</div>
      ) : assignments.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-gray-100 text-center">
          <Video className="mx-auto text-gray-300 mb-4" size={48} />
          <h3 className="text-xl font-bold text-gray-900">No assignments yet</h3>
          <p className="text-gray-500 mb-8">Apply to campaigns in the browse section to get hired.</p>
          <Link href="/dashboard/creator/browse" className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all">
            Browse Jobs
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {assignments.map((assignment) => (
            <Link 
              key={assignment.id} 
              href={`/dashboard/creator/assignments/${assignment.id}`}
              className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all flex items-center justify-between group"
            >
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">{assignment.title}</h3>
                  {getStatusBadge(assignment.deliverableStatus)}
                </div>
                <div className="text-sm text-indigo-600 font-medium mb-2">{assignment.brands?.company_name}</div>
                <div className="text-xs text-gray-400 font-bold uppercase tracking-wider">
                  Payout: <span className="text-gray-900">${assignment.payout_amount}</span>
                </div>
              </div>
              <ChevronRight size={20} className="text-gray-300 group-hover:text-indigo-600 transition-all group-hover:translate-x-1" />
            </Link>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
