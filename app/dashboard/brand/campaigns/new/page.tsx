'use client';
import DashboardLayout from '@/components/DashboardLayout';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { createBrandCampaign } from '@/lib/api';
import { ApiError } from '@/lib/api/client';
import { TARGET_PLATFORMS, VIDEO_FORMATS } from '@/lib/campaign-brief';
import { toast } from '@/lib/toast';
import { useRouter } from 'next/navigation';

export default function NewCampaign() {
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [brief, setBrief] = useState('');
  const [referenceVideoUrl, setReferenceVideoUrl] = useState('');
  const [productUrl, setProductUrl] = useState('');
  const [targetPlatform, setTargetPlatform] = useState('tiktok');
  const [videoFormat, setVideoFormat] = useState('vertical_9_16');
  const [talkingPoints, setTalkingPoints] = useState('');
  const [dosAndDonts, setDosAndDonts] = useState('');
  const campaignCostCredits = 89;
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await createBrandCampaign({
        title,
        brief,
        referenceVideoUrl: referenceVideoUrl || undefined,
        productUrl: productUrl || undefined,
        targetPlatform,
        videoFormat,
        talkingPoints: talkingPoints || undefined,
        dosAndDonts: dosAndDonts || undefined,
      });
      toast.success('Campaign brief submitted. Our team will source creators and manage delivery.');
      router.push('/dashboard/brand/campaigns');
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Failed to create campaign');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout role="Brand" navRole="brand">
      <div className="max-w-2xl mx-auto">
        <Link
          href="/dashboard/brand/campaigns"
          className="flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft size={18} />
          Back to Campaigns
        </Link>

        <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
          <h1 className="text-2xl font-bold mb-2">Submit Your Campaign Brief</h1>
          <p className="text-gray-500 mb-8 text-sm leading-relaxed">
            Tell us what you need for your video ads. UGCFlow handles creator sourcing, briefing, and management —
            you focus on selling.
          </p>

          <form onSubmit={handleSubmit} className="space-y-8">
            <section className="space-y-4">
              <h2 className="text-sm font-bold uppercase tracking-wider text-gray-400">Campaign overview</h2>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Campaign title</label>
                <input
                  required
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="e.g. Summer Skincare Routine UGC"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Campaign brief & requirements</label>
                <textarea
                  required
                  value={brief}
                  onChange={(e) => setBrief(e.target.value)}
                  className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none h-40"
                  placeholder="Describe your product, target audience, ad angle, hooks, and any specific requirements for the video..."
                />
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-sm font-bold uppercase tracking-wider text-gray-400">References & assets</h2>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Reference / inspiration video link</label>
                <input
                  type="url"
                  value={referenceVideoUrl}
                  onChange={(e) => setReferenceVideoUrl(e.target.value)}
                  className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="https://tiktok.com/... or link to a video style you want to match"
                />
                <p className="text-xs text-gray-500 mt-1">Share an example ad or UGC video that matches the style you want.</p>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Product or landing page URL</label>
                <input
                  type="url"
                  value={productUrl}
                  onChange={(e) => setProductUrl(e.target.value)}
                  className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="https://yourbrand.com/product"
                />
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-sm font-bold uppercase tracking-wider text-gray-400">Video specs</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Target platform</label>
                  <select
                    value={targetPlatform}
                    onChange={(e) => setTargetPlatform(e.target.value)}
                    className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                  >
                    {TARGET_PLATFORMS.map((p) => (
                      <option key={p.value} value={p.value}>{p.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Video format</label>
                  <select
                    value={videoFormat}
                    onChange={(e) => setVideoFormat(e.target.value)}
                    className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                  >
                    {VIDEO_FORMATS.map((f) => (
                      <option key={f.value} value={f.value}>{f.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-sm font-bold uppercase tracking-wider text-gray-400">Creator guidance</h2>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Key talking points & call-to-action</label>
                <textarea
                  value={talkingPoints}
                  onChange={(e) => setTalkingPoints(e.target.value)}
                  className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none h-28"
                  placeholder="Must-mention benefits, offer code, CTA (e.g. shop now, link in bio)..."
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Do&apos;s & don&apos;ts</label>
                <textarea
                  value={dosAndDonts}
                  onChange={(e) => setDosAndDonts(e.target.value)}
                  className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none h-28"
                  placeholder="Do: show product in use. Don't: mention competitors..."
                />
              </div>
            </section>

            <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-5">
              <div className="text-xs font-bold uppercase tracking-wider text-indigo-700 mb-1">What happens next</div>
              <p className="text-sm text-indigo-900 mb-3">
                After you launch, our team sources vetted creators, manages the brief, and delivers ready-to-run video ads to your dashboard.
              </p>
              <div className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Campaign cost</div>
              <div className="text-lg font-black text-gray-900">{campaignCostCredits} credits</div>
              <div className="text-xs text-gray-500 mt-1">Credits are deducted when you launch.</div>
            </div>

            <button
              disabled={loading}
              type="submit"
              className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all disabled:opacity-50 shadow-lg shadow-indigo-100"
            >
              {loading ? 'Submitting brief...' : 'Launch Campaign'}
            </button>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}
