'use client';
import Navbar from '@/components/Navbar';
import { Check, Zap, AlertCircle, ArrowRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import StripePurchaseButton from '@/components/StripePurchaseButton';

export default function PricingPage() {
  const [packages, setPackages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const supabase = createClient();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: { user: authUser } } = await supabase.auth.getUser();
        setUser(authUser);

        const { data, error: fetchError } = await supabase
          .from('packages')
          .select('*')
          .order('price', { ascending: true });
        
        if (fetchError) throw fetchError;
        if (data) setPackages(data);
      } catch (err: any) {
        console.error('Error fetching data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">Simple, Transparent Pricing</h1>
          <p className="text-xl text-gray-600">High-quality UGC content at scale. No hidden fees.</p>
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
        ) : packages.length === 0 ? (
          <div className="max-w-md mx-auto bg-gray-50 p-12 rounded-3xl border border-gray-100 text-center">
            <Zap className="mx-auto text-gray-400 mb-4" size={48} />
            <h3 className="text-xl font-bold text-gray-900 mb-2">No packages available</h3>
            <p className="text-gray-500 mb-6">We're currently updating our pricing plans. Please check back later or contact support.</p>
            <Link href="/" className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold inline-block">Back to Home</Link>
          </div>
        ) : (
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {packages.map((pkg) => (
                <div 
                  key={pkg.id} 
                  className={`relative flex flex-col bg-white rounded-3xl border ${pkg.name.includes('Growth') ? 'border-indigo-600 ring-1 ring-indigo-600' : 'border-gray-100'} p-8 shadow-sm hover:shadow-md transition-all`}
                >
                  {pkg.name.includes('Growth') && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-indigo-600 text-white px-4 py-1 rounded-full text-sm font-bold">
                      Most Popular
                    </div>
                  )}
                  
                  <div className="mb-8">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{pkg.name}</h3>
                    <div className="flex items-baseline gap-1 mb-4">
                      <span className="text-4xl font-extrabold text-gray-900">${pkg.price}</span>
                      <span className="text-gray-500 font-medium">/one-time</span>
                    </div>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {pkg.name.includes('Starter') ? 'Best for testing creatives' : 
                       pkg.name.includes('Growth') ? 'Best for consistent ad testing' : 
                       'Best for brands ready to scale'}
                    </p>
                  </div>

                  <ul className="space-y-4 mb-8 flex-grow">
                    {pkg.description?.split('. ').map((feature: string, idx: number) => (
                      feature && (
                        <li key={idx} className="flex items-start gap-3 text-gray-700">
                          <Check size={18} className="text-indigo-600 mt-1 shrink-0" />
                          <span className="text-sm leading-tight">{feature.replace(/\.$/, '')}</span>
                        </li>
                      )
                    ))}
                  </ul>

                  <div className="mt-auto">
                    {user ? (
                      <div className="w-full">
                        <StripePurchaseButton 
                          priceId={pkg.stripe_price_id} 
                          packageId={pkg.id}
                        />
                      </div>
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
              ))}
            </div>

            <div className="mt-20 bg-indigo-50 rounded-3xl p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="max-w-md">
                <h3 className="text-2xl font-bold text-indigo-900 mb-2">Ready to scale your content?</h3>
                <p className="text-indigo-700">Apply as a brand today. Once approved, you can purchase credits and start your first campaign immediately.</p>
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
