'use client';
import Navbar from '@/components/Navbar';
import Link from 'next/link';
import { useState } from 'react';
import { applyCreator } from '@/lib/api/auth';
import { ApiError } from '@/lib/api/client';
import { toast } from '@/lib/toast';

export default function CreatorApply() {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const fullName = formData.get('fullName') as string;
    const portfolioUrl = formData.get('portfolioUrl') as string;
    const bio = formData.get('bio') as string;
    const password = formData.get('password') as string;
    const passwordConfirm = formData.get('passwordConfirm') as string;

    if (password !== passwordConfirm) {
      toast.error('Passwords do not match.');
      setLoading(false);
      return;
    }
    if (password.length < 8) {
      toast.error('Password must be at least 8 characters.');
      setLoading(false);
      return;
    }

    try {
      await applyCreator({
        email,
        password,
        fullName,
        portfolioUrl,
        bio,
      });
      setSubmitted(true);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 max-w-md text-center">
          <h1 className="text-2xl font-bold mb-4">Application Received!</h1>
          <p className="text-gray-600 mb-6">
            We&apos;ve received your portfolio. An admin will review it and approve or reject your account.
            You&apos;ll be able to log in once your application is approved.
          </p>
          <Link
            href="/"
            className="block w-full py-3 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 transition-colors"
          >
            Back to Home
          </Link>
          <p className="text-sm text-gray-500 mt-4">
            Already approved?{' '}
            <Link href="/login?role=creator" className="text-indigo-600 font-semibold hover:underline">
              Creator login
            </Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="pt-32 pb-20 px-6 max-w-2xl mx-auto">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          <h1 className="text-3xl font-bold mb-2">Join our Creator Network</h1>
          <p className="text-gray-600 mb-8">Show us your best work and start working with top brands.</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input name="fullName" required type="text" className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="Jane Doe" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <input name="email" required type="email" className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="jane@example.com" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Portfolio URL (TikTok, Instagram, or Website)</label>
              <input name="portfolioUrl" required type="url" className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="https://tiktok.com/@username" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Short Bio</label>
              <textarea
                name="bio"
                required
                placeholder="Tell us about your content style and experience..."
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
              {loading ? 'Submitting...' : 'Apply as Creator'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
