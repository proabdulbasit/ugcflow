import Navbar from '@/components/Navbar';

const SAMPLE_MEDIA = [
  {
    type: 'video' as const,
    src: encodeURI('/WhatsApp Video 2026-06-14 at 15.42.00.mp4'),
  },
  {
    type: 'image' as const,
    src: encodeURI('/WhatsApp Image 2026-06-14 at 15.42.07.jpeg'),
  },
  {
    type: 'video' as const,
    src: encodeURI('/WhatsApp Video 2026-06-14 at 15.42.23.mp4'),
  },
];

export default function HowItWorks() {
  const steps = [
    { title: "1. Choose a Package", desc: "Select the UGC package that fits your brand's needs and budget." },
    { title: "2. Submit Your Brief", desc: "Tell us about your product and the type of content you're looking for." },
    { title: "3. We Match Creators", desc: "Our team sources and assigns vetted creators — you never chase or manage them yourself." },
    { title: "4. Review & Launch Ads", desc: "Approve finished video ads in your dashboard and run them on TikTok, Meta, and more." }
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

        <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
          {SAMPLE_MEDIA.map((item, i) => (
            <div
              key={i}
              className="relative aspect-[9/16] overflow-hidden rounded-2xl border border-gray-100 bg-gray-50 shadow-sm"
            >
              {item.type === 'video' ? (
                <video
                  src={item.src}
                  controls
                  playsInline
                  preload="metadata"
                  className="h-full w-full object-cover"
                />
              ) : (
                <img
                  src={item.src}
                  alt="Sample UGC content"
                  className="h-full w-full object-cover"
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
