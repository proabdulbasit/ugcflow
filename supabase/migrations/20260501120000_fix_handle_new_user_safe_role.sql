-- Fixes signup failures from handle_new_user():
-- 1) Invalid ::user_role cast when role metadata is missing/malformed (was causing "Database error saving new user")
-- 2) Explicit search_path for SECURITY DEFINER (Supabase recommendation)
-- 3) Re-assert brand_goals column for projects that updated the function without running ALTER

BEGIN;

ALTER TABLE public.brands ADD COLUMN IF NOT EXISTS brand_goals TEXT;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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

COMMIT;
