import Navbar from '@/components/Navbar';

export default function HowItWorks() {
  const steps = [
    { title: "1. Choose a Package", desc: "Select the UGC package that fits your brand's needs and budget." },
    { title: "2. Submit Your Brief", desc: "Tell us about your product and the type of content you're looking for." },
    { title: "3. We Match Creators", desc: "Our team assigns the best-vetted creators for your specific niche." },
    { title: "4. Content Delivery", desc: "Review and download your high-quality UGC directly from your dashboard." }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="pt-32 pb-20 px-6 max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-12 text-center">How It Works</h1>
        <div className="space-y-12">
          {steps.map((step, i) => (
            <div key={i} className="flex gap-6 items-start">
              <div className="w-12 h-12 bg-indigo-600 text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold text-xl">
                {i + 1}
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-2">{step.title}</h3>
                <p className="text-gray-600 text-lg">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
