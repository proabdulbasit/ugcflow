import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe';
import { createServiceRoleClient } from '@/lib/supabase/admin';

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

  const supabase = createServiceRoleClient();

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as any;
    const { brandId, packageId } = session.metadata;

    if (!brandId || !packageId) {
      console.error('Missing metadata in session:', session.id);
      return NextResponse.json({ error: 'Missing metadata' }, { status: 400 });
    }

    // 1. Get package details
    const { data: pkg, error: pkgError } = await supabase
      .from('packages')
      .select('video_count, price')
      .eq('id', packageId)
      .single();

    if (pkgError || !pkg) {
      console.error('Package not found:', packageId);
      return NextResponse.json({ error: 'Package not found' }, { status: 404 });
    }

    // 2. Update brand credits using the RPC function
    const { error: creditError } = await supabase.rpc('increment_brand_credits', {
      brand_id_input: brandId,
      amount_input: pkg.video_count
    });

    if (creditError) {
      console.error('Error updating credits:', creditError);
      return NextResponse.json({ error: 'Failed to update credits' }, { status: 500 });
    }

    // 3. Record the payment
    const { error: paymentError } = await supabase
      .from('payments')
      .insert({
        brand_id: brandId,
        package_id: packageId,
        amount: pkg.price,
        stripe_payment_intent_id: session.payment_intent as string,
        status: 'completed'
      });

    if (paymentError) {
      console.error('Error recording payment:', paymentError);
    }
  }

  return NextResponse.json({ received: true });
}
