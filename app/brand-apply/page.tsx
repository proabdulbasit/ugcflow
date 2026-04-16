'use client';
import Navbar from '@/components/Navbar';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function BrandApply() {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const fullName = formData.get('fullName') as string;
    const companyName = formData.get('companyName') as string;
    const websiteUrl = formData.get('websiteUrl') as string;
    const brandGoals = formData.get('brandGoals') as string;

    // 1. Sign up the user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password: Math.random().toString(36).slice(-12),
      options: {
        data: {
          full_name: fullName,
          role: 'brand'
        }
      }
    });

    if (authError) {
      alert(authError.message);
      setLoading(false);
      return;
    }

    // 2. Update the brand record
    if (authData.user) {
      const { error: brandError } = await supabase
        .from('brands')
        .update({
          company_name: companyName,
          website_url: websiteUrl,
          brand_goals: brandGoals,
          status: 'pending'
        })
        .eq('id', authData.user.id);

      if (brandError) {
        console.error(brandError);
      }
    }

    setLoading(false);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 max-w-md text-center">
          <h1 className="text-2xl font-bold mb-4">Application Received!</h1>
          <p className="text-gray-600 mb-6">We've sent a confirmation email. Our team will review your brand and get back to you shortly.</p>
          <button onClick={() => window.location.href = '/'} className="w-full py-3 bg-indigo-600 text-white rounded-lg font-bold">
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="pt-32 pb-20 px-6 max-w-2xl mx-auto">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          <h1 className="text-3xl font-bold mb-2">Work with UGCFlow</h1>
          <p className="text-gray-600 mb-8">Tell us about your brand and we'll help you scale your content.</p>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input name="fullName" required type="text" className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                <input name="companyName" required type="text" className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <input name="email" required type="email" className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Website URL</label>
              <input name="websiteUrl" required type="url" className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="https://yourbrand.com" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">About the brand and brand goals</label>
              <textarea 
                name="brandGoals" 
                required 
                placeholder="Tell us about your brand, what you sell, and what you hope to achieve with UGC..."
                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none h-32"
              ></textarea>
            </div>
            <button disabled={loading} type="submit" className="w-full py-4 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 transition-colors disabled:opacity-50">
              {loading ? 'Submitting...' : 'Submit Application'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
