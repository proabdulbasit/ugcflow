import { NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: Request) {
  try {
    const stripe = getStripe();
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { priceId, metadata } = await req.json();

    const packageId = metadata?.packageId as string | undefined;

    if (!priceId && !packageId) {
      return NextResponse.json(
        { error: 'Price ID (or packageId for fallback) is required' },
        { status: 400 }
      );
    }

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

    let session;
    try {
      // Primary path: use Stripe Price IDs stored in DB.
      session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: `${baseUrl}/dashboard/brand/billing?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${baseUrl}/pricing`,
        customer_email: user.email,
        metadata: {
          ...metadata,
          brandId: user.id,
        },
      });
    } catch (e: any) {
      // Fallback: if a project is using placeholder price IDs, build price_data from DB package price.
      const message = String(e?.message || '');
      const isMissingPrice = message.toLowerCase().includes('no such price');
      if (!isMissingPrice || !packageId) throw e;

      const { data: pkg, error: pkgError } = await supabase
        .from('packages')
        .select('name, price')
        .eq('id', packageId)
        .single();

      if (pkgError || !pkg) {
        return NextResponse.json(
          { error: 'Package not found for checkout fallback' },
          { status: 404 }
        );
      }

      const unitAmount = Math.round(Number(pkg.price) * 100);
      if (!Number.isFinite(unitAmount) || unitAmount <= 0) {
        return NextResponse.json(
          { error: 'Invalid package price for checkout fallback' },
          { status: 400 }
        );
      }

      session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: pkg.name,
              },
              unit_amount: unitAmount,
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: `${baseUrl}/dashboard/brand/billing?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${baseUrl}/pricing`,
        customer_email: user.email,
        metadata: {
          ...metadata,
          brandId: user.id,
        },
      });
    }

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error('Stripe Session Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
