-- Bridges Supabase Auth (`auth.users`) with our `public.profiles` table.
--
-- Prisma cannot manage foreign keys into the `auth` schema (Supabase owns it),
-- so we add the FK + auto-provisioning trigger here as a follow-up to migrations.
-- Safe to re-run: uses IF NOT EXISTS / OR REPLACE.

-- 1. Enforce that every profiles.id matches an auth.users.id.
--    ON DELETE CASCADE: if a user is removed from Supabase Auth, their profile is removed too.
ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_id_fkey;

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_id_fkey
  FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- 2. Trigger: whenever a new user signs up via Supabase Auth,
--    automatically create a matching row in public.profiles.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    NEW.raw_user_meta_data->>'avatar_url',
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
