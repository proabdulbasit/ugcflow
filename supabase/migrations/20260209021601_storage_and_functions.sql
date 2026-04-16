BEGIN;

-- Function to atomically increment brand credits
CREATE OR REPLACE FUNCTION increment_brand_credits(brand_id_input UUID, amount_input INTEGER)
RETURNS VOID AS $$
BEGIN
    UPDATE brands
    SET credits = COALESCE(credits, 0) + amount_input
    WHERE id = brand_id_input;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add credits column to brands if not exists
ALTER TABLE brands ADD COLUMN IF NOT EXISTS credits INTEGER DEFAULT 0;

-- Add payout_amount to campaigns if not exists (it was used in code but might be missing in schema)
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS payout_amount NUMERIC DEFAULT 150;

-- Storage Setup
-- Note: The 'videos' bucket must be created in the Supabase dashboard.
-- These policies assume the bucket exists.

-- Enable RLS on storage.objects if not already enabled (usually handled by Supabase)
-- But we can define policies for our specific bucket.

CREATE POLICY "Public Access to Videos" ON storage.objects FOR SELECT USING (bucket_id = 'videos');

CREATE POLICY "Creators can upload videos" ON storage.objects FOR INSERT 
WITH CHECK (
    bucket_id = 'videos' AND 
    (auth.role() = 'authenticated')
);

CREATE POLICY "Users can delete own videos" ON storage.objects FOR DELETE
USING (bucket_id = 'videos' AND auth.uid() = owner);

COMMIT;
