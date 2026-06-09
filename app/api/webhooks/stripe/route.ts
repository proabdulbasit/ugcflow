import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe';
import { API_URL } from '@/lib/api/client';

export async function POST(req: Request) {
  const stripe = getStripe();
  const body = await req.text();
  const signature = (await headers()).get('Stripe-Signature') as string;

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error(`Webhook Error: ${err.message}`);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as any;
    const { brandId, packageId } = session.metadata;

    if (!brandId || !packageId) {
      console.error('Missing metadata in session:', session.id);
      return NextResponse.json({ error: 'Missing metadata' }, { status: 400 });
    }

    const res = await fetch(`${API_URL}/api/payments/webhook-complete`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-internal-secret': process.env.JWT_SECRET || '',
      },
      body: JSON.stringify({
        brandId,
        packageId,
        paymentIntentId: session.payment_intent as string,
      }),
    });

    if (!res.ok) {
      const json = await res.json().catch(() => ({}));
      console.error('Backend webhook handler failed:', json);
      return NextResponse.json({ error: 'Failed to process payment' }, { status: 500 });
    }
  }

  return NextResponse.json({ received: true });
}
