-- Seed the default Branboos workspace and make the auth trigger auto-add
-- every new user to it as a `member`. First person to sign up can be
-- promoted to `owner` manually via Supabase SQL editor.
--
-- Safe to re-run: uses ON CONFLICT DO NOTHING and CREATE OR REPLACE.

INSERT INTO public.workspaces (id, name, slug, created_at, updated_at)
VALUES (
  '00000000-0000-0000-0000-00000000b005',  -- fixed UUID so we can reference it in the trigger
  'Branboos',
  'branboos',
  NOW(),
  NOW()
)
ON CONFLICT (slug) DO NOTHING;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  default_workspace_id UUID := '00000000-0000-0000-0000-00000000b005';
  is_first_user BOOLEAN;
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

  -- First user to sign up becomes the workspace owner.
  SELECT NOT EXISTS (
    SELECT 1 FROM public.workspace_members WHERE workspace_id = default_workspace_id
  ) INTO is_first_user;

  INSERT INTO public.workspace_members (workspace_id, profile_id, role, joined_at)
  VALUES (
    default_workspace_id,
    NEW.id,
    CASE WHEN is_first_user THEN 'owner'::workspace_role ELSE 'member'::workspace_role END,
    NOW()
  )
  ON CONFLICT (workspace_id, profile_id) DO NOTHING;

  RETURN NEW;
END;
$$;
