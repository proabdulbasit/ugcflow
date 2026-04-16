'use client';

import Navbar from '@/components/Navbar';
import Link from 'next/link';
import { CheckCircle2, Play, Users, Zap, Star } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      {/* Hero Sections*/   }
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 text-indigo-600 text-sm font-medium mb-8">
            <Star size={16} className="fill-indigo-600" />
            <span>Trusted by 500+ E-commerce Brands</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-gray-900 mb-6">
            High-Converting <span className="text-indigo-600">UGC</span> <br />
            Done For You.
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-10">
            Stop chasing creators. We handle the sourcing, briefing, and management so you get high-quality video ads that actually sell.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/brand-apply" className="px-8 py-4 bg-indigo-600 text-white rounded-full font-bold text-lg hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200">
              Get Started Now
            </Link>
            <Link href="/how-it-works" className="px-8 py-4 bg-white text-gray-900 border border-gray-200 rounded-full font-bold text-lg hover:bg-gray-50 transition-all">
              See How It Works
            </Link>
          </div>
        </div>
      </section>

      {/* Social Proof / Stats */}
      <section className="py-12 border-y border-gray-100 bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-gray-900">2,000+</div>
              <div className="text-sm text-gray-500">Videos Delivered</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-gray-900">150+</div>
              <div className="text-sm text-gray-500">Vetted Creators</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-gray-900">4.9/5</div>
              <div className="text-sm text-gray-500">Average Rating</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-gray-900">7 Days</div>
              <div className="text-sm text-gray-500">Avg. Turnaround</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Brands Choose UGCFlow</h2>
            <p className="text-gray-600">We take the friction out of content creation.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-12">
            {[
              {
                title: "Vetted Creators Only",
                desc: "We don't just accept anyone. Our creators are hand-picked for their ability to drive conversions.",
                icon: Users
              },
              {
                title: "Fast Turnaround",
                desc: "Get your raw or edited content in as little as 7 days. No more waiting weeks for a single video.",
                icon: Zap
              },
              {
                title: "Full Usage Rights",
                desc: "Every video comes with full organic and paid usage rights. Scale your ads without worry.",
                icon: CheckCircle2
              }
            ].map((feature, i) => (
              <div key={i} className="p-8 rounded-2xl border border-gray-100 hover:shadow-xl transition-shadow">
                <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center mb-6">
                  <feature.icon size={24} />
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-indigo-900 text-white rounded-[3rem] mx-6 mb-20">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to scale your creative?</h2>
          <p className="text-indigo-100 text-xl mb-10">Join the top brands using UGCFlow to dominate TikTok, Reels, and Shorts.</p>
          <Link href="/brand-apply" className="px-10 py-5 bg-white text-indigo-900 rounded-full font-bold text-lg hover:bg-indigo-50 transition-all inline-block">
            Apply as a Brand
          </Link>
        </div>
      </section>

      <footer className="py-12 border-t border-gray-100 text-center text-gray-500 text-sm">
        <div className="flex justify-center gap-6 mb-4">
          <Link href="/terms" className="hover:text-indigo-600 transition-colors">Terms of Service</Link>
          <Link href="/privacy" className="hover:text-indigo-600 transition-colors">Privacy Policy</Link>
        </div>
        <p>© 2024 UGCFlow. All rights reserved.</p>
      </footer>
    </div>
  );
}
