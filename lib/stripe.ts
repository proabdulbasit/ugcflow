import Stripe from 'stripe';

let stripeSingleton: Stripe | null = null;

export function getStripe() {
  if (stripeSingleton) return stripeSingleton;

  const apiKey = process.env.STRIPE_TEST_SECRET_KEY;
  if (!apiKey) {
    throw new Error('Missing STRIPE_TEST_SECRET_KEY');
  }

  stripeSingleton = new Stripe(apiKey);
  return stripeSingleton;
}
