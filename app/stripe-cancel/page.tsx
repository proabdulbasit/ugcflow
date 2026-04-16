import Link from 'next/link';

export default function CancelPage() {
  const accent = '#ec625c';
  const buttonStart = '#f07a74';
  return (
    <main className="min-h-screen w-full flex items-center justify-center p-6">
      <div
        className="w-full max-w-lg rounded-md shadow-lg p-10 text-center bg-white border-t-4"
        style={{ borderTopColor: accent }}
      >
        <div
          className="mx-auto mb-6 h-14 w-14 rounded-full flex items-center justify-center shadow-md"
          style={{ backgroundColor: accent }}
        >
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M7 7L17 17M17 7L7 17" stroke="#ffffff" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <h1 className="text-3xl font-semibold tracking-wide" style={{ color: accent }}>Purchase Canceled</h1>
        <p className="mt-4 text-gray-700">You can return to the product page and resend the payment at any time.</p>
        <div className="mt-10">
          <Link
            href="/"
            className="inline-flex items-center bg-[#ec625c] justify-center rounded-md px-5 py-2.5 text-white transition-opacity"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </main>
  );
}