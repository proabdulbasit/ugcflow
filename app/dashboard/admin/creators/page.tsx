'use client';
import DashboardLayout from '@/components/DashboardLayout';
import { Check, CreditCard, LayoutDashboard, Search, Settings, Users, Video, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getAdminCreators, updateCreatorStatus } from '@/lib/api';
import { ApiError } from '@/lib/api/client';
import { toast } from '@/lib/toast';

type CreatorRow = any;

function mapCreator(c: any): CreatorRow {
  return {
    ...c,
    created_at: c.created_at ?? c.createdAt,
    profiles: c.profiles
      ? {
          full_name: c.profiles.full_name ?? c.profiles.fullName,
          email: c.profiles.email,
        }
      : null,
    address: c.address,
  };
}

export default function AdminCreatorsPage() {
  const [creators, setCreators] = useState<CreatorRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [query, setQuery] = useState('');

  const fetchCreators = async () => {
    setLoading(true);
    try {
      const { creators: data } = await getAdminCreators();
      setCreators(data.map(mapCreator));
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Failed to load creators');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCreators();
  }, []);

  const handleUpdateCreatorStatus = async (id: string, status: 'approved' | 'rejected') => {
    setUpdatingId(id);
    try {
      await updateCreatorStatus(id, status);
      fetchCreators();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Update failed');
    } finally {
      setUpdatingId(null);
    }
  };

  const filtered = creators.filter((c: any) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    const name = (c.profiles?.full_name ?? '').toLowerCase();
    const email = (c.profiles?.email ?? '').toLowerCase();
    const status = (c.status ?? '').toLowerCase();
    const address = (c.address ?? '').toLowerCase();
    return name.includes(q) || email.includes(q) || status.includes(q) || address.includes(q);
  });

  const statusBadge = (status: string) => (
    <span
      className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
        status === 'approved'
          ? 'bg-green-50 text-green-600'
          : status === 'rejected'
            ? 'bg-red-50 text-red-600'
            : 'bg-orange-50 text-orange-600'
      }`}
    >
      {status}
    </span>
  );

  return (
    <DashboardLayout role="Admin" navRole="admin">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Creators</h1>
        <p className="text-gray-500 text-sm">Approve or reject creator applications.</p>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm mb-6 flex items-center gap-3">
        <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400">
          <Search size={18} />
        </div>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search name, email, or status…"
          className="flex-1 p-3 outline-none text-sm"
        />
        <button
          onClick={fetchCreators}
          className="px-4 py-2 rounded-xl bg-gray-50 text-gray-700 text-sm font-bold hover:bg-gray-100 transition-all"
        >
          Refresh
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[920px]">
          <thead>
            <tr className="bg-gray-50 text-gray-500 text-xs font-bold uppercase tracking-wider">
              <th className="px-6 py-4">Creator</th>
              <th className="px-6 py-4">Address</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Applied</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-6 py-10 text-center text-gray-400">
                  Loading creators…
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-10 text-center text-gray-400 italic">
                  No creators found.
                </td>
              </tr>
            ) : (
              filtered.map((c: any) => (
                <tr key={c.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-bold text-gray-900">{c.profiles?.full_name ?? 'Unnamed creator'}</div>
                    <div className="text-xs text-gray-500">{c.profiles?.email ?? '—'}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-700 max-w-xs whitespace-pre-wrap">{c.address || '—'}</div>
                  </td>
                  <td className="px-6 py-4">{statusBadge(c.status ?? 'pending')}</td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-700">
                      {c.created_at ? new Date(c.created_at).toLocaleDateString() : '—'}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="inline-flex items-center gap-2">
                      <button
                        onClick={() => handleUpdateCreatorStatus(c.id, 'approved')}
                        disabled={updatingId === c.id || c.status === 'approved'}
                        className="inline-flex items-center gap-1 px-3 py-2 rounded-lg bg-green-600 text-white text-sm font-bold hover:bg-green-700 disabled:opacity-50"
                      >
                        <Check size={16} /> Approve
                      </button>
                      <button
                        onClick={() => handleUpdateCreatorStatus(c.id, 'rejected')}
                        disabled={updatingId === c.id || c.status === 'rejected'}
                        className="inline-flex items-center gap-1 px-3 py-2 rounded-lg bg-red-600 text-white text-sm font-bold hover:bg-red-700 disabled:opacity-50"
                      >
                        <X size={16} /> Reject
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
