-- Extend profiles with login details
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS phone text,
  ADD COLUMN IF NOT EXISTS date_of_birth date,
  ADD COLUMN IF NOT EXISTS gender text,
  ADD COLUMN IF NOT EXISTS country text,
  ADD COLUMN IF NOT EXISTS last_login_at timestamptz,
  ADD COLUMN IF NOT EXISTS last_login_provider text,
  ADD COLUMN IF NOT EXISTS last_login_ip text,
  ADD COLUMN IF NOT EXISTS login_count integer NOT NULL DEFAULT 0;

-- Ensure user_id is unique (needed for ON CONFLICT in handle_new_user)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'profiles_user_id_key'
  ) THEN
    ALTER TABLE public.profiles ADD CONSTRAINT profiles_user_id_key UNIQUE (user_id);
  END IF;
END$$;

-- Make sure new-user trigger exists on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- updated_at trigger on profiles
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Track sign-ins: bump login_count + last_login_* on every auth.users update of last_sign_in_at
CREATE OR REPLACE FUNCTION public.handle_user_login()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.last_sign_in_at IS DISTINCT FROM OLD.last_sign_in_at THEN
    UPDATE public.profiles
    SET last_login_at = NEW.last_sign_in_at,
        last_login_provider = COALESCE(NEW.raw_app_meta_data->>'provider', last_login_provider),
        login_count = login_count + 1
    WHERE user_id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_login ON auth.users;
CREATE TRIGGER on_auth_user_login
AFTER UPDATE OF last_sign_in_at ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_user_login();

-- Backfill profiles for any existing auth users
INSERT INTO public.profiles (user_id, email, full_name, avatar_url, provider, last_login_at)
SELECT u.id,
       u.email,
       COALESCE(u.raw_user_meta_data->>'full_name', u.raw_user_meta_data->>'name'),
       COALESCE(u.raw_user_meta_data->>'avatar_url', u.raw_user_meta_data->>'picture'),
       COALESCE(u.raw_app_meta_data->>'provider', 'email'),
       u.last_sign_in_at
FROM auth.users u
ON CONFLICT (user_id) DO NOTHING;