-- Track who created each list so we can allow members to delete lists they
-- created themselves (only if the list is empty). Admins/owners can delete any list.
-- Safe to re-run.

ALTER TABLE public.lists
  ADD COLUMN IF NOT EXISTS created_by UUID;

-- Backfill: attribute existing lists to the workspace owner (or first member).
UPDATE public.lists l
SET created_by = (
  SELECT wm.profile_id
  FROM public.boards b
  JOIN public.workspace_members wm ON wm.workspace_id = b.workspace_id
  WHERE b.id = l.board_id
  ORDER BY (wm.role = 'owner') DESC, wm.joined_at ASC
  LIMIT 1
)
WHERE created_by IS NULL;

-- Enforce FK once backfill is complete. ON DELETE SET NULL so removing a user
-- doesn't cascade-delete their lists (or worse, all their cards).
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'lists_created_by_fkey'
      AND table_name = 'lists'
  ) THEN
    ALTER TABLE public.lists
      ADD CONSTRAINT lists_created_by_fkey
      FOREIGN KEY (created_by) REFERENCES public.profiles(id)
      ON DELETE SET NULL
      NOT VALID;
    ALTER TABLE public.lists VALIDATE CONSTRAINT lists_created_by_fkey;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS lists_created_by_idx ON public.lists(created_by);
