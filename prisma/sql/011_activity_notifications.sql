-- Activity log + notifications tables. Feeds the Recent Activity panel and the
-- bell dropdown. Safe to re-run.

-- Activities: workspace-scoped event stream. `type` is a string so we can add
-- new event kinds without a schema change; UI decides how to render each.
-- `meta` (JSONB) carries per-event context (e.g. {fromList, toList} for moves).
CREATE TABLE IF NOT EXISTS public.activities (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id   UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  actor_id       UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  type           TEXT NOT NULL,
  board_id       UUID REFERENCES public.boards(id) ON DELETE CASCADE,
  card_id        UUID REFERENCES public.cards(id) ON DELETE CASCADE,
  target_user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  meta           JSONB,
  created_at     TIMESTAMP(3) NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS activities_workspace_created_idx
  ON public.activities (workspace_id, created_at DESC);

CREATE INDEX IF NOT EXISTS activities_card_created_idx
  ON public.activities (card_id, created_at DESC);

CREATE INDEX IF NOT EXISTS activities_actor_created_idx
  ON public.activities (actor_id, created_at DESC);

ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;

-- Notifications: one row per unread event delivered to a recipient. `read_at`
-- is NULL until they've seen it. `message` is pre-rendered so the bell dropdown
-- doesn't need to reconstruct context from the referenced entities.
CREATE TABLE IF NOT EXISTS public.notifications (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  actor_id     UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  type         TEXT NOT NULL,
  board_id     UUID REFERENCES public.boards(id) ON DELETE CASCADE,
  card_id      UUID REFERENCES public.cards(id) ON DELETE CASCADE,
  message      TEXT NOT NULL,
  read_at      TIMESTAMP(3),
  created_at   TIMESTAMP(3) NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS notifications_recipient_created_idx
  ON public.notifications (recipient_id, created_at DESC);

CREATE INDEX IF NOT EXISTS notifications_recipient_unread_idx
  ON public.notifications (recipient_id) WHERE read_at IS NULL;

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
