BEGIN;

-- Create packages table if it doesn't exist
CREATE TABLE IF NOT EXISTS packages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL NOT NULL,
    video_count INTEGER NOT NULL,
    stripe_price_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE packages ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anyone to read packages
DROP POLICY IF EXISTS "Allow public read access" ON packages;
CREATE POLICY "Allow public read access" ON packages
    FOR SELECT
    USING (true);

-- Clear existing packages to ensure we only have the requested ones
DELETE FROM packages;

-- Insert new packages with their Stripe price IDs
INSERT INTO packages (name, description, price, video_count, stripe_price_id) VALUES
('Starter Package', '3 high-quality videos. UGC style. Delivered ready for ads/social. Ideal for testing creatives.', 499, 3, 'price_1Sz5C5H47DjWNnloB5xIGo5B'),
('Growth Package', '10 high-quality videos. Mixed hooks & angles. Ad-ready formats. Best value for scaling campaigns.', 1299, 10, 'price_1Sz5CWH47DjWNnlogjKsTXvY');

COMMIT;
