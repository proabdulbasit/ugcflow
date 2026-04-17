'use client';
import { useState } from 'react';
import { Zap } from 'lucide-react';

interface StripePurchaseButtonProps {
  priceId: string;
  packageId: string;
}

export default function StripePurchaseButton({ priceId, packageId }: StripePurchaseButtonProps) {
  const [loading, setLoading] = useState(false);

  const handlePurchase = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/stripe-create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          priceId,
          metadata: { packageId }
        }),
      });

      const body = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(body.error || `Checkout failed (${response.status})`);
      }
      if (body.error) throw new Error(body.error);
      if (body.url) window.location.href = body.url;
    } catch (err: any) {
      alert(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handlePurchase}
      disabled={loading}
      className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white px-6 py-4 rounded-xl font-bold hover:bg-indigo-700 transition-all disabled:opacity-50 shadow-lg shadow-indigo-100"
    >
      {loading ? (
        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      ) : (
        <>
          <Zap size={18} className="fill-white" />
          Get Started
        </>
      )}
    </button>
  );
}
