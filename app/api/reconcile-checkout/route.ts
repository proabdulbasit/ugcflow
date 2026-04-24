import { NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe';
import { createServiceRoleClient } from '@/lib/supabase/admin';

const CREDITS_BY_PACKAGE_NAME: Array<{ match: RegExp; credits: number }> = [
  { match: /starter/i, credits: 267 },
  { match: /growth/i, credits: 534 },
  { match: /scale/i, credits: 890 },
];

export async function POST(req: Request) {
  try {
    const { sessionId } = await req.json();
    if (!sessionId) return NextResponse.json({ error: 'sessionId required' }, { status: 400 });

    const stripe = getStripe();
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (session.payment_status !== 'paid') {
      return NextResponse.json({ ok: false, status: session.payment_status });
    }

    const metadata = (session.metadata ?? {}) as any;
    const brandId = metadata.brandId as string | undefined;
    const packageId = metadata.packageId as string | undefined;

    if (!brandId || !packageId) {
      return NextResponse.json({ error: 'Missing brandId/packageId metadata' }, { status: 400 });
    }

    const paymentIntentId = (session.payment_intent as string | null) ?? null;
    if (!paymentIntentId) {
      return NextResponse.json({ error: 'Missing payment_intent on session' }, { status: 400 });
    }

    const supabase = createServiceRoleClient();

    // Idempotency: if this intent already recorded, do nothing.
    const { data: existing } = await supabase
      .from('payments')
      .select('id')
      .eq('stripe_payment_intent_id', paymentIntentId)
      .limit(1);
    if (existing && existing.length > 0) {
      return NextResponse.json({ ok: true, alreadyProcessed: true });
    }

    // Load package to compute credits and record payment amount.
    const { data: pkg, error: pkgError } = await supabase
      .from('packages')
      .select('name, video_count, price')
      .eq('id', packageId)
      .single();
    if (pkgError || !pkg) return NextResponse.json({ error: 'Package not found' }, { status: 404 });

    const creditsToAdd =
      CREDITS_BY_PACKAGE_NAME.find((x) => x.match.test(String(pkg.name)))?.credits ?? Number(pkg.video_count) ?? 0;

    // Update credits + insert payment (best-effort atomicity via ordered ops + idempotency guard above).
    const { error: creditError } = await supabase.rpc('increment_brand_credits', {
      brand_id_input: brandId,
      amount_input: creditsToAdd,
    });
    if (creditError) {
      // Fallback in case the RPC wasn't migrated yet.
      const { data: brandRow, error: brandErr } = await supabase.from('brands').select('credits').eq('id', brandId).single();
      if (brandErr) {
        return NextResponse.json({ error: 'Failed to update credits', details: creditError }, { status: 500 });
      }
      const nextCredits = Number(brandRow?.credits ?? 0) + Number(creditsToAdd ?? 0);
      const { error: updErr } = await supabase.from('brands').update({ credits: nextCredits }).eq('id', brandId);
      if (updErr) {
        return NextResponse.json({ error: 'Failed to update credits', details: creditError }, { status: 500 });
      }
    }

    const { error: paymentError } = await supabase.from('payments').insert({
      brand_id: brandId,
      package_id: packageId,
      amount: pkg.price,
      stripe_payment_intent_id: paymentIntentId,
      status: 'completed',
    });

    if (paymentError) {
      // Credits have been added, but payment row failed to insert; still return ok with warning.
      return NextResponse.json({ ok: true, creditsAdded: creditsToAdd, warning: 'Payment insert failed' });
    }

    return NextResponse.json({ ok: true, creditsAdded: creditsToAdd });
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? 'Unknown error' }, { status: 500 });
  }
}

