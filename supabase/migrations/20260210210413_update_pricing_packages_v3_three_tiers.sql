BEGIN;

-- Clear existing packages
DELETE FROM packages;

-- Insert new packages with their Stripe price IDs
INSERT INTO packages (name, description, price, video_count, stripe_price_id) VALUES
('Starter Package', '3 high-quality UGC videos. Hook + demo style. Ad-ready formatting. Fast turnaround. Ideal for small campaigns & new brands.', 499, 3, 'price_1SzO5HH47DjWNnloFB4SiIoD'),
('Growth Package', '6 high-quality UGC videos. Multiple hooks & angles. Mix of problem/solution + testimonial styles. Optimised for paid social. Batch delivery.', 899, 6, 'price_1SzO5kH47DjWNnlo2TIA9UQH'),
('Scale Package', '10 high-quality UGC videos. Multi-angle concepts. Hook variations included. Paid + organic ready. Priority creator matching & briefing.', 1299, 10, 'price_1SzO6AH47DjWNnloGXGEXgXK');

COMMIT;
