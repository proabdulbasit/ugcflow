BEGIN;

-- Allow brands to create/update their own campaigns.
-- Without this, INSERT into campaigns fails with RLS violation.

ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Brands can create own campaigns" ON public.campaigns;
CREATE POLICY "Brands can create own campaigns"
ON public.campaigns
FOR INSERT
WITH CHECK (brand_id = auth.uid());

DROP POLICY IF EXISTS "Brands can update own campaigns" ON public.campaigns;
CREATE POLICY "Brands can update own campaigns"
ON public.campaigns
FOR UPDATE
USING (brand_id = auth.uid())
WITH CHECK (brand_id = auth.uid());

COMMIT;

