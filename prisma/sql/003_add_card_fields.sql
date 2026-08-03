-- Add `component` (freeform tag) and `start_date` fields to cards.
-- Safe to re-run: IF NOT EXISTS guards both columns.

ALTER TABLE public.cards
  ADD COLUMN IF NOT EXISTS component TEXT;

ALTER TABLE public.cards
  ADD COLUMN IF NOT EXISTS start_date TIMESTAMP(3);
