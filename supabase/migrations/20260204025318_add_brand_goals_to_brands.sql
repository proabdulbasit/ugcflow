BEGIN;

-- Create a storage bucket for video deliverables
INSERT INTO storage.buckets (id, name, public) VALUES ('videos', 'videos', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload videos
-- In a production app, you'd restrict this more tightly to creators assigned to campaigns
CREATE POLICY "Authenticated users can upload videos" ON storage.objects FOR INSERT TO authenticated WITH CHECK (
  bucket_id = 'videos'
);

-- Allow public access to view videos
CREATE POLICY "Public access to videos" ON storage.objects FOR SELECT TO public USING (
  bucket_id = 'videos'
);

COMMIT;
