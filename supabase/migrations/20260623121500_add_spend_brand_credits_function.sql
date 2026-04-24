BEGIN;

-- Atomically spend credits for the currently-authenticated brand.
-- Returns true if credits were deducted, false if insufficient credits.

CREATE OR REPLACE FUNCTION public.spend_brand_credits(brand_id_input uuid, amount_input integer)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_credits integer;
BEGIN
  IF auth.uid() IS NULL OR auth.uid() <> brand_id_input THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  IF amount_input IS NULL OR amount_input <= 0 THEN
    RAISE EXCEPTION 'Invalid amount_input';
  END IF;

  SELECT credits INTO current_credits FROM public.brands WHERE id = brand_id_input FOR UPDATE;
  current_credits := COALESCE(current_credits, 0);

  IF current_credits < amount_input THEN
    RETURN FALSE;
  END IF;

  UPDATE public.brands
  SET credits = credits - amount_input
  WHERE id = brand_id_input;

  RETURN TRUE;
END;
$$;

REVOKE ALL ON FUNCTION public.spend_brand_credits(uuid, integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.spend_brand_credits(uuid, integer) TO anon, authenticated, service_role;

COMMIT;

