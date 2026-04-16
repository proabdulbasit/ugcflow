BEGIN;

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert into profiles
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    (NEW.raw_user_meta_data->>'role')::user_role
  );

  -- Insert into creators if role is creator
  IF (NEW.raw_user_meta_data->>'role' = 'creator') THEN
    INSERT INTO public.creators (id, status)
    VALUES (NEW.id, 'pending');
  END IF;

  -- Insert into brands if role is brand
  IF (NEW.raw_user_meta_data->>'role' = 'brand') THEN
    INSERT INTO public.brands (id, status)
    VALUES (NEW.id, 'pending');
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user creation
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

COMMIT;