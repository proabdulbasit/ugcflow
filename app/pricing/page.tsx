'use client';
import Navbar from '@/components/Navbar';
import { Check, Zap, AlertCircle, ArrowRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getPackages } from '@/lib/api';
import { getMe } from '@/lib/api/auth';
import { ApiError } from '@/lib/api/client';
import {
  CAMPAIGN_CREDIT_COST,
  CREDITS_PER_VIDEO,
  formatPackagePrice,
  mergePackagesForPricing,
  packageCredits,
  type PricingPackage,
} from '@/lib/packages';
import Link from 'next/link';
import StripePurchaseButton from '@/components/StripePurchaseButton';

export default function PricingPage() {
  const [packages, setPackages] = useState<PricingPackage[]>(mergePackagesForPricing());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        try {
          const { user: authUser } = await getMe();
          setUser(authUser);
        } catch {
          setUser(null);
        }

        const { packages: data } = await getPackages();
        setPackages(mergePackagesForPricing(data));
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err instanceof ApiError ? err.message : 'Failed to load pricing');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="pt-24 sm:pt-32 pb-16 sm:pb-20 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto text-center mb-12 sm:mb-16">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">Simple, Transparent Pricing</h1>
          <p className="text-base sm:text-xl text-gray-600">
            Choose a UGC package, launch campaign briefs, and get video ads delivered by our creator network.
          </p>
          <p className="text-sm text-gray-500 mt-3">
            Each campaign uses {CAMPAIGN_CREDIT_COST} credits per UGC video ({CREDITS_PER_VIDEO} credits = 1 video).
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        ) : error ? (
          <div className="max-w-md mx-auto bg-red-50 p-6 rounded-2xl border border-red-100 text-center">
            <AlertCircle className="mx-auto text-red-600 mb-4" size={32} />
            <h3 className="text-lg font-bold text-red-900 mb-2">Failed to load pricing</h3>
            <p className="text-red-700 text-sm mb-4">{error}</p>
            <button onClick={() => window.location.reload()} className="text-indigo-600 font-bold hover:underline">Try Again</button>
          </div>
        ) : (
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {packages.map((pkg) => {
                const isGrowth = pkg.tier === 'growth';

                return (
                  <div
                    key={pkg.tier}
                    className={`relative flex flex-col bg-white rounded-3xl border ${
                      isGrowth ? 'border-indigo-600 ring-1 ring-indigo-600' : 'border-gray-100'
                    } p-8 shadow-sm hover:shadow-md transition-all`}
                  >
                    {isGrowth && (
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-indigo-600 text-white px-4 py-1 rounded-full text-sm font-bold">
                        Most Popular
                      </div>
                    )}

                    <div className="mb-8">
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">{pkg.name}</h3>
                      <div className="flex items-baseline gap-1 mb-4">
                        <span className="text-4xl font-extrabold text-gray-900">
                          {formatPackagePrice(pkg.price, pkg.currency)}
                        </span>
                        <span className="text-gray-500 font-medium">/ one-time</span>
                      </div>
                      <div className="inline-flex items-center gap-2 mb-3 bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-full text-xs font-bold">
                        {packageCredits(pkg.videoCount)} credits · {pkg.videoCount} video{pkg.videoCount === 1 ? '' : 's'}
                      </div>
                      <p className="text-gray-600 text-sm leading-relaxed">{pkg.tagline}</p>
                    </div>

                    <div className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-400">Includes</div>
                    <ul className="space-y-4 mb-8 flex-grow">
                      {pkg.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-3 text-gray-700">
                          <Check size={18} className="text-indigo-600 mt-1 shrink-0" />
                          <span className="text-sm leading-tight">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <div className="mt-auto">
                      {user?.role === 'brand' ? (
                        pkg.id ? (
                          <StripePurchaseButton priceId={pkg.stripe_price_id} packageId={pkg.id} />
                        ) : (
                          <p className="text-center text-sm text-gray-500">Package checkout unavailable — contact support.</p>
                        )
                      ) : user ? (
                        <Link
                          href="/dashboard"
                          className="w-full inline-flex items-center justify-center rounded-xl bg-gray-100 px-6 py-4 text-gray-700 font-bold hover:bg-gray-200 transition-all"
                        >
                          Go to Dashboard
                        </Link>
                      ) : (
                        <Link
                          href="/login"
                          className="w-full inline-flex items-center justify-center rounded-xl bg-indigo-600 px-6 py-4 text-white font-bold hover:bg-indigo-700 transition-all"
                        >
                          Login to Buy
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-20 bg-indigo-50 rounded-3xl p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="max-w-md">
                <h3 className="text-2xl font-bold text-indigo-900 mb-2">Ready to scale your content?</h3>
                <p className="text-indigo-700">
                  Apply as a brand, purchase a package, then launch campaign briefs. Higher tiers unlock more creators per campaign and revision rounds.
                </p>
              </div>
              <Link
                href="/brand-apply"
                className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-bold hover:bg-indigo-700 transition-all flex items-center gap-2 whitespace-nowrap"
              >
                Apply Now
                <ArrowRight size={20} />
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
