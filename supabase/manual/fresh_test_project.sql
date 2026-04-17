-- =============================================================================
-- FRESH SUPABASE PROJECT — paste this entire file in: SQL Editor → New query → Run
-- Use this when your existing project keeps returning:
--   {"code":"unexpected_failure","message":"Database error saving new user"}
--
-- Steps:
-- 1) dashboard.supabase.com → New project (separate from production)
-- 2) Apply this app's schema to that project (pick ONE):
--      • From repo: `supabase link --project-ref <NEW_REF>` then `supabase db push`
--      • This creates public.profiles / brands / creators + enums so the trigger works.
-- 3) If signup still fails after db push, paste & run THIS file (sections B, then C if needed)
-- 4) Project Settings → API → copy URL, anon key, service_role key
-- 5) Copy env.test.example → .env.local and fill keys; run `npm run dev` and retry /brand-apply
-- =============================================================================

-- -----------------------------------------------------------------------------
-- A) Optional: if you ALREADY have conflicting objects from old experiments,
--    uncomment these lines, run once, then comment again and run the rest.
-- -----------------------------------------------------------------------------
-- DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
-- DROP FUNCTION IF EXISTS public.handle_new_user();

-- -----------------------------------------------------------------------------
-- B) Ensure signup trigger can write rows (fixes RLS blocking inserts)
-- -----------------------------------------------------------------------------

ALTER TABLE public.brands ADD COLUMN IF NOT EXISTS brand_goals TEXT;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_role public.user_role;
  v_role_text text;
BEGIN
  v_role_text := lower(trim(COALESCE(new.raw_user_meta_data->>'role', '')));
  v_role := CASE v_role_text
    WHEN 'admin' THEN 'admin'::public.user_role
    WHEN 'brand' THEN 'brand'::public.user_role
    WHEN 'creator' THEN 'creator'::public.user_role
    ELSE 'creator'::public.user_role
  END;

  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    new.id,
    new.email,
    NULLIF(trim(new.raw_user_meta_data->>'full_name'), ''),
    v_role
  );

  IF v_role = 'creator'::public.user_role THEN
    INSERT INTO public.creators (id, status, portfolio_url, bio)
    VALUES (
      new.id,
      'pending',
      NULLIF(trim(new.raw_user_meta_data->>'portfolio_url'), ''),
      NULLIF(trim(new.raw_user_meta_data->>'bio'), '')
    );
  ELSIF v_role = 'brand'::public.user_role THEN
    INSERT INTO public.brands (id, status, company_name, website_url, brand_goals)
    VALUES (
      new.id,
      'pending',
      NULLIF(trim(new.raw_user_meta_data->>'company_name'), ''),
      NULLIF(trim(new.raw_user_meta_data->>'website_url'), ''),
      NULLIF(trim(new.raw_user_meta_data->>'brand_goals'), '')
    );
  END IF;

  RETURN new;
END;
$$;

ALTER FUNCTION public.handle_new_user() OWNER TO postgres;

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" ON public.profiles
FOR INSERT TO authenticated
WITH CHECK ((SELECT auth.uid()) = id);

DROP POLICY IF EXISTS "Users can insert own creator row" ON public.creators;
CREATE POLICY "Users can insert own creator row" ON public.creators
FOR INSERT TO authenticated
WITH CHECK ((SELECT auth.uid()) = id);

DROP POLICY IF EXISTS "Users can insert own brand row" ON public.brands;
CREATE POLICY "Users can insert own brand row" ON public.brands
FOR INSERT TO authenticated
WITH CHECK ((SELECT auth.uid()) = id);

-- -----------------------------------------------------------------------------
-- C) NUCLEAR OPTION — only on a throwaway test project (never production)
--    If signup STILL fails after A+B, uncomment the 3 lines below and run again.
--    This turns off RLS on these tables so the trigger can always insert.
-- -----------------------------------------------------------------------------
-- ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.creators DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.brands DISABLE ROW LEVEL SECURITY;
