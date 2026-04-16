import Navbar from '@/components/Navbar';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="pt-32 pb-20 px-6 max-w-4xl mx-auto prose prose-indigo prose-sm md:prose-base">
        <h1 className="text-4xl font-black text-gray-900 mb-4 tracking-tight">Privacy Policy</h1>
        <p className="text-gray-500 mb-12">Last updated: February 10, 2024</p>

        <section className="mb-10">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Information We Collect</h2>
          <p className="text-gray-600 leading-relaxed mb-4">
            We collect information you provide directly to us when you create an account, apply as a creator, or purchase credits as a brand. This includes:
          </p>
          <ul className="list-disc pl-6 text-gray-600 space-y-2">
            <li><strong>Account Information:</strong> Name, email address, and password.</li>
            <li><strong>Profile Information:</strong> Company name, website URL, portfolio links, and bios.</li>
            <li><strong>Payment Information:</strong> We use Stripe for payments. We do not store your credit card details on our servers.</li>
          </ul>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">2. How We Use Your Information</h2>
          <p className="text-gray-600 leading-relaxed mb-4">
            We use the information we collect to:
          </p>
          <ul className="list-disc pl-6 text-gray-600 space-y-2">
            <li>Provide, maintain, and improve our services.</li>
            <li>Process transactions and send related information (receipts, credit updates).</li>
            <li>Send technical notices, updates, and security alerts.</li>
            <li>Connect Brands with Creators for content production.</li>
          </ul>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Data Sharing</h2>
          <p className="text-gray-600 leading-relaxed">
            We do not sell your personal data. We share information only as necessary to provide our services, such as sharing a Creator's portfolio with a Brand or sharing transaction data with Stripe.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Data Security</h2>
          <p className="text-gray-600 leading-relaxed">
            We use industry-standard security measures to protect your information. However, no method of transmission over the Internet is 100% secure, and we cannot guarantee absolute security.
          </p>
        </section>

        <div className="mt-20 p-8 bg-gray-50 rounded-3xl border border-gray-100 text-center">
          <p className="text-gray-500 text-sm">Questions about your data? Contact us at privacy@ugcflow.com</p>
        </div>
      </div>
    </div>
  );
}
