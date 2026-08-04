-- Add workspace prefix + per-workspace card numbering, so every card gets a
-- Jira-style key like BRAN-1, BRAN-2, etc. Safe to re-run.

-- 1. Workspace prefix (e.g., BRAN for Branboos). Default seeded then made NOT NULL.
ALTER TABLE public.workspaces
  ADD COLUMN IF NOT EXISTS prefix TEXT;

UPDATE public.workspaces
SET prefix = UPPER(SUBSTRING(REGEXP_REPLACE(slug, '[^a-zA-Z]', '', 'g'), 1, 4))
WHERE prefix IS NULL AND slug IS NOT NULL;

-- Fallback for any workspace with an empty prefix after the derivation
UPDATE public.workspaces SET prefix = 'WORK' WHERE prefix IS NULL OR prefix = '';

ALTER TABLE public.workspaces
  ALTER COLUMN prefix SET NOT NULL;

-- 2. Per-workspace card counter — a small table so we don't race on MAX().
CREATE TABLE IF NOT EXISTS public.workspace_card_sequences (
  workspace_id UUID PRIMARY KEY REFERENCES public.workspaces(id) ON DELETE CASCADE,
  last_number INT NOT NULL DEFAULT 0
);

-- 3. cards.number and cards.workspace_id (denormalised for fast lookup + uniqueness).
ALTER TABLE public.cards
  ADD COLUMN IF NOT EXISTS number INT;

ALTER TABLE public.cards
  ADD COLUMN IF NOT EXISTS workspace_id UUID;

-- Backfill workspace_id via lists → boards → workspaces.
UPDATE public.cards c
SET workspace_id = b.workspace_id
FROM public.lists l
JOIN public.boards b ON b.id = l.board_id
WHERE c.list_id = l.id AND c.workspace_id IS NULL;

-- Backfill sequential numbers per workspace ordered by created_at.
WITH numbered AS (
  SELECT id,
         ROW_NUMBER() OVER (PARTITION BY workspace_id ORDER BY created_at, id) AS n
  FROM public.cards
  WHERE number IS NULL
)
UPDATE public.cards c
SET number = numbered.n
FROM numbered
WHERE c.id = numbered.id;

-- Seed the sequence table so future createCard picks up from the current max.
INSERT INTO public.workspace_card_sequences (workspace_id, last_number)
SELECT workspace_id, COALESCE(MAX(number), 0)
FROM public.cards
WHERE workspace_id IS NOT NULL
GROUP BY workspace_id
ON CONFLICT (workspace_id) DO UPDATE
SET last_number = GREATEST(workspace_card_sequences.last_number, EXCLUDED.last_number);

-- Make workspace_id + number required and enforce uniqueness of the pair
-- (only after backfill so we never fail on existing rows).
ALTER TABLE public.cards
  ALTER COLUMN workspace_id SET NOT NULL,
  ALTER COLUMN number SET NOT NULL;

ALTER TABLE public.cards
  ADD CONSTRAINT cards_workspace_id_fkey
  FOREIGN KEY (workspace_id) REFERENCES public.workspaces(id) ON DELETE CASCADE
  NOT VALID;

ALTER TABLE public.cards VALIDATE CONSTRAINT cards_workspace_id_fkey;

CREATE UNIQUE INDEX IF NOT EXISTS cards_workspace_id_number_key
  ON public.cards (workspace_id, number);

CREATE INDEX IF NOT EXISTS cards_assignee_id_idx ON public.cards (assignee_id);
