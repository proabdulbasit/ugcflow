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
('Starter Package', '3 high-quality UGC videos. Hook + demo style. Ad-ready formatting. Fast turnaround. Ideal for small campaigns & new brands.', 499, 3, 'price_1Sz5C5H47DjWNnloB5xIGo5B'),
('Growth Package', '6 high-quality UGC videos. Multiple hooks & angles. Mix of problem/solution + testimonial styles. Optimised for paid social. Batch delivery.', 899, 6, 'price_1Sz5CWH47DjWNnlogjKsTXvY'),
('Scale Package', '10 high-quality UGC videos. Multi-angle concepts. Hook variations included. Paid + organic ready. Priority creator matching & briefing.', 1299, 10, 'price_1SzO5HH47DjWNnloFB4SiIoD');

COMMIT;
