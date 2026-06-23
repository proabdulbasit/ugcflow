'use client';
import DashboardLayout from '@/components/DashboardLayout';
import { Check, ExternalLink, Search, X } from 'lucide-react';
import { useEffect, useState, type ReactNode } from 'react';
import { getAdminBrands, updateBrandStatus } from '@/lib/api';
import { ApiError } from '@/lib/api/client';
import { toast } from '@/lib/toast';

type BrandRow = any;

function mapBrand(b: any): BrandRow {
  return {
    ...b,
    company_name: b.company_name ?? b.companyName,
    website_url: b.website_url ?? b.websiteUrl,
    brand_goals: b.brand_goals ?? b.brandGoals,
    abn: b.abn,
    created_at: b.created_at ?? b.createdAt,
    profiles: b.profiles
      ? {
          full_name: b.profiles.full_name ?? b.profiles.fullName,
          email: b.profiles.email,
        }
      : null,
  };
}

function DetailField({
  label,
  children,
  className = '',
}: {
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <dt className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">{label}</dt>
      <dd className="text-sm text-gray-900">{children}</dd>
    </div>
  );
}

function BrandDetailModal({
  brand,
  updatingId,
  onClose,
  onUpdateStatus,
}: {
  brand: BrandRow;
  updatingId: string | null;
  onClose: () => void;
  onUpdateStatus: (id: string, status: 'approved' | 'rejected') => void;
}) {
  const statusBadge = (status: string) => (
    <span
      className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
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
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Brand Application</h2>
            <p className="text-sm text-gray-500">Review company details and account info</p>
          </div>
          <button type="button" onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500" aria-label="Close">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
            <DetailField label="Company Name" className="sm:col-span-2">
              {brand.company_name?.trim() || '—'}
            </DetailField>
            <DetailField label="Contact Name">{brand.profiles?.full_name?.trim() || '—'}</DetailField>
            <DetailField label="Email">
              {brand.profiles?.email ? (
                <a href={`mailto:${brand.profiles.email}`} className="text-indigo-600 hover:underline">
                  {brand.profiles.email}
                </a>
              ) : (
                '—'
              )}
            </DetailField>
            <DetailField label="Status">{statusBadge(brand.status ?? 'pending')}</DetailField>
            <DetailField label="Applied">
              {brand.created_at ? new Date(brand.created_at).toLocaleString() : '—'}
            </DetailField>
            <DetailField label="Website" className="sm:col-span-2">
              {brand.website_url ? (
                <a
                  href={brand.website_url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-indigo-600 hover:underline break-all"
                >
                  {brand.website_url}
                  <ExternalLink size={14} className="shrink-0" />
                </a>
              ) : (
                '—'
              )}
            </DetailField>
            <DetailField label="ABN (Australian Business Number)">
              {brand.abn?.trim() ? (
                <span className="font-mono font-medium">{brand.abn.trim()}</span>
              ) : (
                <span className="text-gray-500">Not provided</span>
              )}
            </DetailField>
            <DetailField label="Credits">{brand.credits ?? 0}</DetailField>
            <DetailField label="Brand Goals" className="sm:col-span-2">
              <span className="whitespace-pre-wrap">{brand.brand_goals?.trim() || '—'}</span>
            </DetailField>
          </dl>

          <div className="flex flex-col sm:flex-row gap-3 pt-2 border-t border-gray-100">
            <button
              type="button"
              onClick={() => onUpdateStatus(brand.id, 'approved')}
              disabled={updatingId === brand.id || brand.status === 'approved'}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-green-600 text-white font-bold hover:bg-green-700 disabled:opacity-50"
            >
              <Check size={18} /> Approve Brand
            </button>
            <button
              type="button"
              onClick={() => onUpdateStatus(brand.id, 'rejected')}
              disabled={updatingId === brand.id || brand.status === 'rejected'}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 disabled:opacity-50"
            >
              <X size={18} /> Reject Brand
            </button>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center justify-center px-5 py-3 rounded-xl bg-gray-100 text-gray-700 font-bold hover:bg-gray-200 sm:ml-auto"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminBrandsPage() {
  const [brands, setBrands] = useState<BrandRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [selectedBrand, setSelectedBrand] = useState<BrandRow | null>(null);

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
    const abn = (b.abn ?? '').toLowerCase();
    return name.includes(q) || email.includes(q) || fullName.includes(q) || website.includes(q) || abn.includes(q);
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
        <p className="text-gray-500 text-sm">Approve or reject brand applications. Click View Details to see ABN and full profile.</p>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm mb-6 flex items-center gap-3">
        <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400">
          <Search size={18} />
        </div>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search company, website, email, or ABN…"
          className="flex-1 p-3 outline-none text-sm"
        />
        <button
          onClick={fetchBrands}
          className="px-4 py-2 rounded-xl bg-gray-50 text-gray-700 text-sm font-bold hover:bg-gray-100 transition-all"
        >
          Refresh
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[900px]">
          <thead>
            <tr className="bg-gray-50 text-gray-500 text-xs font-bold uppercase tracking-wider">
              <th className="px-6 py-4">Company</th>
              <th className="px-6 py-4">Contact</th>
              <th className="px-6 py-4">ABN</th>
              <th className="px-6 py-4">Website</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-6 py-10 text-center text-gray-400">
                  Loading brands…
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-10 text-center text-gray-400 italic">
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
                    {b.abn?.trim() ? (
                      <div className="text-sm font-mono text-gray-800 mb-1">{b.abn.trim()}</div>
                    ) : null}
                    <button
                      type="button"
                      onClick={() => setSelectedBrand(b)}
                      className="text-xs font-bold text-indigo-600 hover:underline"
                    >
                      View Details
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 truncate max-w-[180px]">{b.website_url ?? '—'}</div>
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

      {selectedBrand ? (
        <BrandDetailModal
          brand={selectedBrand}
          updatingId={updatingId}
          onClose={() => setSelectedBrand(null)}
          onUpdateStatus={async (id, status) => {
            await handleUpdateBrandStatus(id, status);
            setSelectedBrand(null);
          }}
        />
      ) : null}
    </DashboardLayout>
  );
}
