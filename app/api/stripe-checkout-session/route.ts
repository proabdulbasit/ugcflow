import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const sessionId = searchParams.get('session_id');
  if (!sessionId) return new NextResponse('session_id required', { status: 400 });

  const session = await stripe.checkout.sessions.retrieve(sessionId);
  const items = await stripe.checkout.sessions.listLineItems(sessionId);

  return NextResponse.json({
    id: session.id,
    payment_status: session.payment_status,
    amount_total: session.amount_total,
    currency: session.currency,
    customer: session.customer,
    items,
  });
}
