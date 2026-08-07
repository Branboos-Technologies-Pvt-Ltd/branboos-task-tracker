-- One-shot bootstrap for a freshly-created Supabase project (post `prisma db push`).
-- Idempotent: safe to run on any DB that may or may not already have this state.
--
-- Fixes the state left after original 002 failed because `prefix` was already
-- NOT NULL on a `db push`-created workspaces table.

-- created_at + updated_at explicitly set — `@updatedAt` in Prisma is a
-- client-side hook, not a DB default, so raw SQL INSERTs must provide it.
INSERT INTO public.workspaces (name, slug, prefix, created_at, updated_at)
VALUES ('BranBoos', 'branboos', 'BRAN', NOW(), NOW())
ON CONFLICT (slug) DO UPDATE
  SET name = EXCLUDED.name,
      prefix = EXCLUDED.prefix,
      updated_at = NOW();

-- Re-assert the signup trigger — first user gets `owner`, everyone after is `member`.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  wsid UUID;
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

  SELECT id INTO wsid FROM public.workspaces WHERE slug = 'branboos' LIMIT 1;
  IF wsid IS NOT NULL THEN
    INSERT INTO public.workspace_members (workspace_id, profile_id, role, joined_at)
    VALUES (
      wsid,
      NEW.id,
      CASE
        WHEN (SELECT COUNT(*) FROM public.workspace_members WHERE workspace_id = wsid) = 0
        THEN 'owner'::public.workspace_role
        ELSE 'member'::public.workspace_role
      END,
      NOW()
    )
    ON CONFLICT DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
