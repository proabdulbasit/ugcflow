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
    
    if (!supabase) {
      alert('App configuration error: Supabase environment variables are missing.');
      return;
    }

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const fullName = formData.get('fullName') as string;
    const companyName = formData.get('companyName') as string;
    const websiteUrl = formData.get('websiteUrl') as string;
    const brandGoals = formData.get('brandGoals') as string;
    const password = formData.get('password') as string;
    const passwordConfirm = formData.get('passwordConfirm') as string;

    if (password !== passwordConfirm) {
      alert('Passwords do not match.');
      setLoading(false);
      return;
    }
    if (password.length < 8) {
      alert('Password must be at least 8 characters.');
      setLoading(false);
      return;
    }

    // Application fields are copied into brands via DB trigger from user metadata (works with email confirmation).
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role: 'brand',
          company_name: companyName,
          website_url: websiteUrl,
          brand_goals: brandGoals,
        },
      },
    });

    if (authError) {
      alert(authError.message);
      setLoading(false);
      return;
    }

    // When a session exists, keep row in sync (redundant with trigger if migrations applied).
    if (authData.user && authData.session) {
      const { error: brandError } = await supabase
        .from('brands')
        .update({
          company_name: companyName,
          website_url: websiteUrl,
          brand_goals: brandGoals,
          status: 'pending',
        })
        .eq('id', authData.user.id);

      if (brandError) {
        console.error(brandError);
        alert(brandError.message);
        setLoading(false);
        return;
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
          <p className="text-gray-600 mb-6">
            If email confirmation is enabled on your project, check your inbox to verify your account before signing in. Our team will review your brand and get back to you shortly.
          </p>
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input
                  name="password"
                  required
                  type="password"
                  minLength={8}
                  autoComplete="new-password"
                  className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="At least 8 characters"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirm password</label>
                <input
                  name="passwordConfirm"
                  required
                  type="password"
                  minLength={8}
                  autoComplete="new-password"
                  className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
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
