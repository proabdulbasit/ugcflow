BEGIN;

-- Add credits to brands table
ALTER TABLE brands ADD COLUMN IF NOT EXISTS credits INTEGER DEFAULT 0 NOT NULL;

-- Update the handle_new_user function to ensure brands start with 0 credits (already handled by default)
-- No changes needed to the trigger function.

COMMIT;
