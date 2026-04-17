-- Run this on a BRAND NEW Supabase project if you see errors like:
--   "Could not find the table 'public.brands' in the schema cache"
-- It creates the core tables/enums + minimal RLS + trigger used by this app.

BEGIN;

-- Enums (idempotent)
DO $$ BEGIN
  CREATE TYPE public.user_role AS ENUM ('admin', 'creator', 'brand');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE public.application_status AS ENUM ('pending', 'approved', 'rejected');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Core tables
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text unique not null,
  full_name text,
  role public.user_role not null default 'creator',
  created_at timestamptz not null default timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.creators (
  id uuid references public.profiles(id) on delete cascade primary key,
  portfolio_url text,
  bio text,
  status public.application_status not null default 'pending',
  created_at timestamptz not null default timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.brands (
  id uuid references public.profiles(id) on delete cascade primary key,
  company_name text,
  website_url text,
  brand_goals text,
  status public.application_status not null default 'pending',
  created_at timestamptz not null default timezone('utc'::text, now())
);

-- RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.creators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;

-- Minimal policies for app usage
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT TO authenticated
  USING ((SELECT auth.uid()) = id);

DROP POLICY IF EXISTS "Creators can view own record" ON public.creators;
CREATE POLICY "Creators can view own record" ON public.creators
  FOR SELECT TO authenticated
  USING ((SELECT auth.uid()) = id);

DROP POLICY IF EXISTS "Creators can update own record" ON public.creators;
CREATE POLICY "Creators can update own record" ON public.creators
  FOR UPDATE TO authenticated
  USING ((SELECT auth.uid()) = id);

DROP POLICY IF EXISTS "Brands can view own record" ON public.brands;
CREATE POLICY "Brands can view own record" ON public.brands
  FOR SELECT TO authenticated
  USING ((SELECT auth.uid()) = id);

DROP POLICY IF EXISTS "Brands can update own record" ON public.brands;
CREATE POLICY "Brands can update own record" ON public.brands
  FOR UPDATE TO authenticated
  USING ((SELECT auth.uid()) = id);

-- Trigger: create profile + role rows on signup
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
  )
  ON CONFLICT (id) DO NOTHING;

  IF v_role = 'creator'::public.user_role THEN
    INSERT INTO public.creators (id, status, portfolio_url, bio)
    VALUES (
      new.id,
      'pending',
      NULLIF(trim(new.raw_user_meta_data->>'portfolio_url'), ''),
      NULLIF(trim(new.raw_user_meta_data->>'bio'), '')
    )
    ON CONFLICT (id) DO NOTHING;
  ELSIF v_role = 'brand'::public.user_role THEN
    INSERT INTO public.brands (id, status, company_name, website_url, brand_goals)
    VALUES (
      new.id,
      'pending',
      NULLIF(trim(new.raw_user_meta_data->>'company_name'), ''),
      NULLIF(trim(new.raw_user_meta_data->>'website_url'), ''),
      NULLIF(trim(new.raw_user_meta_data->>'brand_goals'), '')
    )
    ON CONFLICT (id) DO NOTHING;
  END IF;

  RETURN new;
END;
$$;

ALTER FUNCTION public.handle_new_user() OWNER TO postgres;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

COMMIT;

