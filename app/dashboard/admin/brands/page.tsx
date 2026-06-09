'use client';
import DashboardLayout from '@/components/DashboardLayout';
import { LayoutDashboard, Users, Video, CreditCard, Settings, Check, X, Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getAdminBrands, updateBrandStatus } from '@/lib/api';
import { ApiError } from '@/lib/api/client';
import { toast } from '@/lib/toast';

type BrandRow = any;

function mapBrand(b: any): BrandRow {
  return {
    ...b,
    company_name: b.company_name ?? b.companyName,
    website_url: b.website_url ?? b.websiteUrl,
    created_at: b.created_at ?? b.createdAt,
    profiles: b.profiles
      ? {
          full_name: b.profiles.full_name ?? b.profiles.fullName,
          email: b.profiles.email,
        }
      : null,
  };
}

export default function AdminBrandsPage() {
  const [brands, setBrands] = useState<BrandRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [query, setQuery] = useState('');

  const fetchBrands = async () => {
    setLoading(true);
    try {
      const { brands: data } = await getAdminBrands();
      setBrands(data.map(mapBrand));
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Failed to load brands');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBrands();
  }, []);

  const handleUpdateBrandStatus = async (brandId: string, status: 'approved' | 'rejected') => {
    setUpdatingId(brandId);
    try {
      await updateBrandStatus(brandId, status);
      fetchBrands();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Update failed');
    } finally {
      setUpdatingId(null);
    }
  };

  const filtered = brands.filter((b: any) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    const name = (b.company_name ?? '').toLowerCase();
    const email = (b.profiles?.email ?? '').toLowerCase();
    const fullName = (b.profiles?.full_name ?? '').toLowerCase();
    const website = (b.website_url ?? '').toLowerCase();
    return name.includes(q) || email.includes(q) || fullName.includes(q) || website.includes(q);
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
        <h1 className="text-2xl font-bold text-gray-900">Brands</h1>
        <p className="text-gray-500 text-sm">Approve or reject brand applications.</p>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm mb-6 flex items-center gap-3">
        <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400">
          <Search size={18} />
        </div>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search company, website, or email…"
          className="flex-1 p-3 outline-none text-sm"
        />
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[780px]">
          <thead>
            <tr className="bg-gray-50 text-gray-500 text-xs font-bold uppercase tracking-wider">
              <th className="px-6 py-4">Company</th>
              <th className="px-6 py-4">Contact</th>
              <th className="px-6 py-4">Website</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-6 py-10 text-center text-gray-400">
                  Loading brands…
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-10 text-center text-gray-400 italic">
                  No brands found.
                </td>
              </tr>
            ) : (
              filtered.map((b: any) => (
                <tr key={b.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-bold text-gray-900">{b.company_name ?? '—'}</div>
                    <div className="text-xs text-gray-500">{new Date(b.created_at).toLocaleDateString()}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{b.profiles?.full_name ?? '—'}</div>
                    <div className="text-xs text-gray-500">{b.profiles?.email ?? '—'}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{b.website_url ?? '—'}</div>
                  </td>
                  <td className="px-6 py-4">{statusBadge(b.status ?? 'pending')}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="inline-flex items-center gap-2">
                      <button
                        onClick={() => handleUpdateBrandStatus(b.id, 'approved')}
                        disabled={updatingId === b.id || b.status === 'approved'}
                        className="inline-flex items-center gap-1 px-3 py-2 rounded-lg bg-green-600 text-white text-sm font-bold hover:bg-green-700 disabled:opacity-50"
                      >
                        <Check size={16} /> Approve
                      </button>
                      <button
                        onClick={() => handleUpdateBrandStatus(b.id, 'rejected')}
                        disabled={updatingId === b.id || b.status === 'rejected'}
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
