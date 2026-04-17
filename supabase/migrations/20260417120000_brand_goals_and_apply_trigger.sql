BEGIN;

ALTER TABLE public.brands ADD COLUMN IF NOT EXISTS brand_goals TEXT;

-- Persist apply-form fields from auth metadata so signup works even when email confirmation is required (no client session yet).
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    COALESCE((new.raw_user_meta_data->>'role')::user_role, 'creator'::user_role)
  );

  IF (new.raw_user_meta_data->>'role') = 'creator' THEN
    INSERT INTO public.creators (id, status, portfolio_url, bio)
    VALUES (
      new.id,
      'pending',
      NULLIF(TRIM(new.raw_user_meta_data->>'portfolio_url'), ''),
      NULLIF(TRIM(new.raw_user_meta_data->>'bio'), '')
    );
  ELSIF (new.raw_user_meta_data->>'role') = 'brand' THEN
    INSERT INTO public.brands (id, status, company_name, website_url, brand_goals)
    VALUES (
      new.id,
      'pending',
      NULLIF(TRIM(new.raw_user_meta_data->>'company_name'), ''),
      NULLIF(TRIM(new.raw_user_meta_data->>'website_url'), ''),
      NULLIF(TRIM(new.raw_user_meta_data->>'brand_goals'), '')
    );
  END IF;

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMIT;
