-- Checklist items on cards. Each card can have any number of items; each item
-- tracks its own done state, creator, and (when checked) who checked it.
-- Order via fractional `position` so reorder never needs to renumber siblings.
-- Safe to re-run.

CREATE TABLE IF NOT EXISTS public.card_checklist_items (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  card_id     UUID NOT NULL REFERENCES public.cards(id) ON DELETE CASCADE,
  text        TEXT NOT NULL,
  done        BOOLEAN NOT NULL DEFAULT FALSE,
  position    DOUBLE PRECISION NOT NULL,
  created_by  UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  done_by     UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  done_at     TIMESTAMP(3),
  created_at  TIMESTAMP(3) NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMP(3) NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS card_checklist_items_card_position_idx
  ON public.card_checklist_items(card_id, position);

ALTER TABLE public.card_checklist_items ENABLE ROW LEVEL SECURITY;
