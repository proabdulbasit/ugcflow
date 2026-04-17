-- Signup fails with "Database error saving new user" when:
-- 1) RLS blocks INSERT into profiles / creators / brands (no INSERT policies), and the trigger
--    does not run as a role that bypasses RLS.
-- 2) handle_new_user search_path / owner does not match Supabase docs.
--
-- This migration aligns with https://supabase.com/docs/guides/auth/managing-user-data

BEGIN;

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

-- Run trigger as postgres so RLS does not block inserts (Supabase default superuser role).
ALTER FUNCTION public.handle_new_user() OWNER TO postgres;

-- Belt-and-suspenders: allow authenticated users to insert only their own rows (API / JWT flows).
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

COMMIT;
