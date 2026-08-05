-- Multi-label per card. Replaces the single `component` field with a
-- workspace-scoped labels table + many-to-many join, matching the design mockup.
-- The old `cards.component` column stays for backward compat and is backfilled
-- into labels below. Safe to re-run.

CREATE TABLE IF NOT EXISTS public.labels (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  name         TEXT NOT NULL,
  color        TEXT NOT NULL,
  created_at   TIMESTAMP(3) NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMP(3) NOT NULL DEFAULT NOW(),
  CONSTRAINT labels_workspace_name_key UNIQUE (workspace_id, name)
);

CREATE INDEX IF NOT EXISTS labels_workspace_id_idx ON public.labels(workspace_id);

CREATE TABLE IF NOT EXISTS public.card_labels (
  card_id  UUID NOT NULL REFERENCES public.cards(id) ON DELETE CASCADE,
  label_id UUID NOT NULL REFERENCES public.labels(id) ON DELETE CASCADE,
  PRIMARY KEY (card_id, label_id)
);

CREATE INDEX IF NOT EXISTS card_labels_label_id_idx ON public.card_labels(label_id);

-- RLS default-deny matching our pattern (Prisma bypasses via postgres role)
ALTER TABLE public.labels      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.card_labels ENABLE ROW LEVEL SECURITY;

-- Backfill: turn each unique (workspace_id, component) into a Label, then link
-- every card with that component into the join table. Deterministic color per
-- component name so the palette matches what the UI already computes.
INSERT INTO public.labels (workspace_id, name, color)
SELECT DISTINCT
  workspace_id,
  component,
  CASE (abs(hashtext(component)) % 8)
    WHEN 0 THEN '#8B5CF6'
    WHEN 1 THEN '#3B82F6'
    WHEN 2 THEN '#14B8A6'
    WHEN 3 THEN '#EF4444'
    WHEN 4 THEN '#64748B'
    WHEN 5 THEN '#EC4899'
    WHEN 6 THEN '#F59E0B'
    ELSE       '#22C55E'
  END AS color
FROM public.cards
WHERE component IS NOT NULL AND component <> ''
ON CONFLICT (workspace_id, name) DO NOTHING;

INSERT INTO public.card_labels (card_id, label_id)
SELECT c.id, l.id
FROM public.cards c
JOIN public.labels l ON l.workspace_id = c.workspace_id AND l.name = c.component
WHERE c.component IS NOT NULL AND c.component <> ''
ON CONFLICT DO NOTHING;
