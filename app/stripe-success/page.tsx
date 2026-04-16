import Link from 'next/link';

export default async function SuccessPage({
  searchParams,
}: { searchParams: { session_id?: string } }) {
  const sessionId = searchParams.session_id;
  let data: any = null;

  if (sessionId) {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    try {
      const res = await fetch(`${baseUrl}/api/stripe-checkout-session?session_id=${sessionId}`, { cache: 'no-store' });
      if (res.ok) {
        data = await res.json();
      }
    } catch {}
  }

  const paid = data?.payment_status === 'paid';

  const accent = paid ? '#5ec66f' : '#2e6de6';
  const firstItem = data?.items?.data?.[0] || null;
  const productName = firstItem?.description || firstItem?.price?.nickname || '';

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
          {paid ? (
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M20 7L9 18L4 13" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          ) : (
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="6" cy="12" r="2" fill="#ffffff"/>
              <circle cx="12" cy="12" r="2" fill="#ffffff"/>
              <circle cx="18" cy="12" r="2" fill="#ffffff"/>
            </svg>
          )}
        </div>

        <h1 className="text-3xl font-semibold tracking-wide" style={{ color: accent }}>
          {paid ? 'Purchase Success' : 'Confirming Purchase...'}
        </h1>

        {paid && (
          <div className="mt-4 text-gray-700">
            {productName ? (
              <p className="mb-2"><b>Product:</b> {productName}</p>
            ) : null}
            <p>
              <b>Price:</b> {(data.amount_total ?? 0) / 100} {data.currency?.toUpperCase()}
            </p>
          </div>
        )}

        <div className="mt-10">
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-md px-5 py-2.5 text-white transition-opacity"
            style={{ backgroundColor: accent }}
          >
            Back to Home
          </Link>
        </div>
      </div>
    </main>
  );
}