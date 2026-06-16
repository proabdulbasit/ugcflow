import { NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe';
import { API_URL } from '@/lib/api/client';

export async function POST(req: Request) {
  try {
    const { sessionId } = await req.json();
    if (!sessionId) return NextResponse.json({ error: 'sessionId required' }, { status: 400 });

    const stripe = getStripe();
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (session.payment_status !== 'paid') {
      return NextResponse.json({ ok: false, status: session.payment_status });
    }

    const metadata = (session.metadata ?? {}) as Record<string, string>;
    const brandId = metadata.brandId;
    const packageId = metadata.packageId;

    if (!brandId || !packageId) {
      return NextResponse.json({ error: 'Missing brandId/packageId metadata' }, { status: 400 });
    }

    const paymentIntentId = (session.payment_intent as string | null) ?? null;
    if (!paymentIntentId) {
      return NextResponse.json({ error: 'Missing payment_intent on session' }, { status: 400 });
    }

    const res = await fetch(`${API_URL}/api/payments/reconcile`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-internal-secret': process.env.JWT_SECRET || '',
      },
      body: JSON.stringify({
        brandId,
        packageId,
        paymentIntentId,
        amount: session.amount_total ? session.amount_total / 100 : undefined,
      }),
    });

    const json = await res.json();
    if (!res.ok) return NextResponse.json(json, { status: res.status });
    return NextResponse.json(json);
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? 'Unknown error' }, { status: 500 });
  }
}
