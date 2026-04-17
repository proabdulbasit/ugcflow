-- If public.handle_new_user() throws, Supabase Auth returns:
--   {"code":"unexpected_failure","message":"Database error saving new user"}
--
-- This migration makes the trigger NON-BLOCKING:
-- - Any error inserting into public.profiles/brands/creators is caught
-- - Signup proceeds (trigger returns NEW)
-- - The error is still visible in Postgres logs (as WARNING)
--
-- Use this when you need signup to work immediately, while you investigate
-- the underlying schema/RLS mismatch in a controlled way.

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
  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'handle_new_user failed for user % (%): %',
      new.id,
      COALESCE(new.email, '<no email>'),
      SQLSTATE,
      SQLERRM;
    -- do NOT block signup
  END;

  RETURN new;
END;
$$;

ALTER FUNCTION public.handle_new_user() OWNER TO postgres;

COMMIT;

