'use client';
import DashboardLayout from '@/components/DashboardLayout';
import { LayoutDashboard, Video, CreditCard, Settings, Zap, CheckCircle2 } from 'lucide-react';
import { Suspense, useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

function BrandBillingInner() {
  const [credits, setCredits] = useState(0);
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [reconciling, setReconciling] = useState(false);
  const [reconcileMessage, setReconcileMessage] = useState<string | null>(null);
  const supabase = createClient();
  const searchParams = useSearchParams();
  const router = useRouter();

  const fetchBillingData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Fetch credits
    const { data: brand } = await supabase
      .from('brands')
      .select('credits')
      .eq('id', user.id)
      .single();

    if (brand) setCredits(brand.credits || 0);

    // Fetch payment history
    const { data: paymentsData } = await supabase
      .from('payments')
      .select(`
          *,
          packages (name)
        `)
      .eq('brand_id', user.id)
      .order('created_at', { ascending: false });

    if (paymentsData) setPayments(paymentsData);
  };

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      await fetchBillingData();
      setLoading(false);
    };
    run();
  }, []);

  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    if (!sessionId) return;
    if (reconciling) return;

    const run = async () => {
      setReconciling(true);
      setReconcileMessage('Confirming your purchase…');
      try {
        const res = await fetch('/api/reconcile-checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId }),
        });
        const json = await res.json().catch(() => ({}));
        if (!res.ok) {
          setReconcileMessage(json?.error || 'Failed to confirm purchase.');
        } else if (json?.alreadyProcessed) {
          setReconcileMessage('Purchase already processed.');
        } else if (json?.creditsAdded) {
          setReconcileMessage(`Credits added: ${json.creditsAdded}`);
        } else {
          setReconcileMessage('Purchase confirmed.');
        }
      } finally {
        router.replace('/dashboard/brand/billing');
        await fetchBillingData();
        setReconciling(false);
      }
    };
    run();
  }, [reconciling, router, searchParams]);

  const sidebarItems = [
    { label: 'Overview', icon: LayoutDashboard, href: '/dashboard/brand' },
    { label: 'My Campaigns', icon: Video, href: '/dashboard/brand/campaigns' },
    { label: 'Billing', icon: CreditCard, href: '/dashboard/brand/billing' },
    { label: 'Settings', icon: Settings, href: '/dashboard/settings' },
  ];

  return (
    <DashboardLayout role="Brand" items={sidebarItems}>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Billing & Credits</h1>
        <p className="text-gray-500 text-sm">Manage your credits and view your transaction history.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="md:col-span-2 bg-indigo-600 rounded-3xl p-8 text-white shadow-xl shadow-indigo-100 flex flex-col md:flex-row justify-between items-center gap-6">
          <div>
            <div className="text-indigo-100 text-sm font-medium mb-1">Available Credits</div>
            <div className="text-5xl font-extrabold mb-2">{loading ? '...' : credits}</div>
            <p className="text-indigo-100 text-sm">Creating a campaign costs 89 credits.</p>
            {reconcileMessage ? (
              <p className="text-indigo-100 text-xs mt-2">{reconcileMessage}</p>
            ) : null}
          </div>
          <Link 
            href="/pricing" 
            className="bg-white text-indigo-600 px-8 py-4 rounded-2xl font-bold hover:bg-indigo-50 transition-all flex items-center gap-2"
          >
            <Zap size={18} className="fill-indigo-600" />
            Buy More Credits
          </Link>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-center text-center">
          <div className="w-12 h-12 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 size={24} />
          </div>
          <h3 className="font-bold text-gray-900">Auto-Refill</h3>
          <p className="text-gray-500 text-sm mt-1">Never run out of content. Enable auto-refill in settings.</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-50">
          <h3 className="font-bold text-gray-900">Payment History</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-xs font-bold uppercase tracking-wider">
                <th className="px-6 py-4">Package</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-400">Loading history...</td></tr>
              ) : payments.length === 0 ? (
                <tr><td colSpan={4} className="px-6 py-12 text-sm text-center text-gray-400 italic">No payments found.</td></tr>
              ) : payments.map((payment) => (
                <tr key={payment.id}>
                  <td className="px-6 py-4 font-medium text-gray-900">{payment.packages?.name || 'Custom Package'}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{new Date(payment.created_at).toLocaleDateString()}</td>
                  <td className="px-6 py-4 font-bold text-gray-900">${payment.amount}</td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-green-50 text-green-600">
                      {payment.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default function BrandBilling() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50" />}>
      <BrandBillingInner />
    </Suspense>
  );
}
