import { NextResponse } from 'next/server';
import type Stripe from 'stripe';
import { getStripe } from '@/lib/stripe';
import { getServerUser } from '@/lib/auth/server';
import { API_URL } from '@/lib/api/client';

type PackageRecord = {
  id: string;
  name: string;
  price: number;
};

function isValidStripePriceId(priceId: unknown): priceId is string {
  return typeof priceId === 'string' && priceId.trim().startsWith('price_');
}

function toStripeMetadata(metadata: Record<string, unknown>): Stripe.MetadataParam {
  const result: Stripe.MetadataParam = {};
  for (const [key, value] of Object.entries(metadata)) {
    if (value === undefined) continue;
    result[key] = value === null ? '' : String(value);
  }
  return result;
}

async function fetchPackage(packageId: string): Promise<PackageRecord | null> {
  const pkgRes = await fetch(`${API_URL}/api/packages/${packageId}`);
  const pkg = await pkgRes.json();
  if (!pkgRes.ok) return null;
  return pkg as PackageRecord;
}

async function createCheckoutWithPriceData(
  pkg: PackageRecord,
  userEmail: string,
  metadata: Record<string, unknown>,
  baseUrl: string
) {
  const stripe = getStripe();
  const unitAmount = Math.round(Number(pkg.price) * 100);
  if (!Number.isFinite(unitAmount) || unitAmount <= 0) {
    throw new Error('Invalid package price for checkout');
  }

  return stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: { name: pkg.name },
          unit_amount: unitAmount,
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
    success_url: `${baseUrl}/dashboard/brand/billing?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${baseUrl}/pricing`,
    customer_email: userEmail,
    metadata: toStripeMetadata(metadata),
  });
}

export async function POST(req: Request) {
  try {
    const user = await getServerUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (user.role !== 'brand') {
      return NextResponse.json({ error: 'Only brand accounts can purchase credits' }, { status: 403 });
    }

    const { priceId, metadata } = await req.json();
    const packageId = metadata?.packageId as string | undefined;

    if (!isValidStripePriceId(priceId) && !packageId) {
      return NextResponse.json(
        { error: 'Package ID is required when Stripe price is not configured' },
        { status: 400 }
      );
    }

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const sessionMetadata = toStripeMetadata({ ...metadata, brandId: user.userId });

    // No Stripe price on package — build checkout from DB price.
    if (!isValidStripePriceId(priceId)) {
      if (!packageId) {
        return NextResponse.json({ error: 'Package not found for checkout' }, { status: 404 });
      }

      const pkg = await fetchPackage(packageId);
      if (!pkg) {
        return NextResponse.json({ error: 'Package not found for checkout' }, { status: 404 });
      }

      const session = await createCheckoutWithPriceData(pkg, user.email, sessionMetadata, baseUrl);
      return NextResponse.json({ url: session.url });
    }

    const stripe = getStripe();

    try {
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [{ price: priceId, quantity: 1 }],
        mode: 'payment',
        success_url: `${baseUrl}/dashboard/brand/billing?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${baseUrl}/pricing`,
        customer_email: user.email,
        metadata: sessionMetadata,
      });
      return NextResponse.json({ url: session.url });
    } catch (e: any) {
      const message = String(e?.message || '');
      const isMissingPrice = message.toLowerCase().includes('no such price');
      if (!isMissingPrice || !packageId) throw e;

      const pkg = await fetchPackage(packageId);
      if (!pkg) {
        return NextResponse.json({ error: 'Package not found for checkout fallback' }, { status: 404 });
      }

      const session = await createCheckoutWithPriceData(pkg, user.email, sessionMetadata, baseUrl);
      return NextResponse.json({ url: session.url });
    }
  } catch (err: any) {
    console.error('Stripe Session Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
