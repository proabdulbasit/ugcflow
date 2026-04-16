BEGIN;

-- Clear existing packages to ensure we only have the requested ones
DELETE FROM packages;

-- Insert new packages with their Stripe price IDs
INSERT INTO packages (name, description, price, video_count, stripe_price_id) VALUES
('Starter Package', '3 high-quality videos. UGC style. Delivered ready for ads/social. Ideal for testing creatives.', 499, 3, 'price_1Sz5C5H47DjWNnloB5xIGo5B'),
('Growth Package', '10 high-quality videos. Mixed hooks & angles. Ad-ready formats. Best value for scaling campaigns.', 1299, 10, 'price_1Sz5CWH47DjWNnlogjKsTXvY');

COMMIT;
