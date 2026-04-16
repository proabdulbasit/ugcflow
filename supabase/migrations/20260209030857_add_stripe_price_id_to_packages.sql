BEGIN;

ALTER TABLE packages ADD COLUMN stripe_price_id TEXT;

-- Update existing packages with placeholder or real IDs if we had them, 
-- but for now just adding the column is enough.
-- We will update them after creating Stripe prices.

COMMIT;