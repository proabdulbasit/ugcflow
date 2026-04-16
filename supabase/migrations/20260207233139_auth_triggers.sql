BEGIN;

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  -- Insert into profiles
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    (new.raw_user_meta_data->>'role')::user_role
  );

  -- Insert into role-specific tables
  IF (new.raw_user_meta_data->>'role') = 'creator' THEN
    INSERT INTO public.creators (id, status)
    VALUES (new.id, 'pending');
  ELSIF (new.raw_user_meta_data->>'role') = 'brand' THEN
    INSERT INTO public.brands (id, status)
    VALUES (new.id, 'pending');
  END IF;

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user creation
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

COMMIT;
