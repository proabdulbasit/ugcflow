import Navbar from '@/components/Navbar';

export default function Terms() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="pt-32 pb-20 px-6 max-w-4xl mx-auto prose prose-indigo prose-sm md:prose-base">
        <h1 className="text-4xl font-black text-gray-900 mb-4 tracking-tight">Terms of Service</h1>
        <p className="text-gray-500 mb-12">Last updated: February 10, 2024</p>

        <section className="mb-10">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Acceptance of Terms</h2>
          <p className="text-gray-600 leading-relaxed">
            By accessing or using UGCFlow ("the Platform"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">2. User Roles & Accounts</h2>
          <p className="text-gray-600 leading-relaxed mb-4">
            <strong>Brands:</strong> Companies seeking content creation services. Brands must provide accurate company information and are responsible for the briefs they issue.
          </p>
          <p className="text-gray-600 leading-relaxed">
            <strong>Creators:</strong> Individuals providing content creation services. Creators represent that they own all rights to the content they upload until transferred to the Brand.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Credits & Payments</h2>
          <ul className="list-disc pl-6 text-gray-600 space-y-2">
            <li>Credits are purchased by Brands and have no cash value.</li>
            <li>One (1) credit is typically equivalent to one (1) approved UGC video deliverable.</li>
            <li>Credits are non-refundable once a Creator has been hired for a campaign.</li>
            <li>Payments are processed securely via Stripe. UGCFlow does not store credit card information.</li>
          </ul>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Content Rights & Licensing</h2>
          <p className="text-gray-600 leading-relaxed mb-4">
            Upon the Brand's approval of a deliverable and the successful deduction of a credit:
          </p>
          <ul className="list-disc pl-6 text-gray-600 space-y-2">
            <li>The Creator grants the Brand a perpetual, worldwide, royalty-free license to use, edit, and distribute the content for organic and paid advertising purposes.</li>
            <li>The Creator retains the right to use the content in their personal portfolio unless otherwise agreed upon in writing.</li>
          </ul>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Limitation of Liability</h2>
          <p className="text-gray-600 leading-relaxed">
            UGCFlow is a marketplace platform. We are not responsible for the quality of content, the conduct of users, or any damages arising from the use of content produced through the platform.
          </p>
        </section>

        <div className="mt-20 p-8 bg-gray-50 rounded-3xl border border-gray-100 text-center">
          <p className="text-gray-500 text-sm">Questions about our terms? Contact us at legal@ugcflow.com</p>
        </div>
      </div>
    </div>
  );
}
