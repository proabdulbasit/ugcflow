BEGIN;

CREATE OR REPLACE FUNCTION increment_brand_credits(brand_id_input UUID, amount_input INTEGER)
RETURNS VOID AS $$
BEGIN
  UPDATE brands
  SET credits = credits + amount_input
  WHERE id = brand_id_input;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMIT;
