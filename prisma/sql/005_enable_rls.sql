-- Enable Row-Level Security on every table in the public schema.
--
-- Our app authorises via server actions (assertBoardAccess, requireProfile).
-- Prisma connects as the Supabase `postgres` role, which BYPASSRLS by default,
-- so server queries continue to work. The point of enabling RLS is to shut the
-- back door: the public `anon` / `authenticated` roles (which anyone with the
-- anon key can invoke over PostgREST) can no longer read or write our tables.
--
-- We deliberately add NO policies for anon/authenticated. Empty policy set +
-- RLS enabled = default deny. If we ever want to expose realtime subscriptions
-- or REST access, we add targeted policies at that time.
--
-- Safe to re-run.

ALTER TABLE public.profiles                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspaces                ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_members         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_card_sequences  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.boards                    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lists                     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cards                     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments                  ENABLE ROW LEVEL SECURITY;

-- Also FORCE RLS on the sensitive tables so even the table owner is subject to
-- policies — belt and braces in case the connection role ever changes.
ALTER TABLE public.profiles                  FORCE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_members         FORCE ROW LEVEL SECURITY;
ALTER TABLE public.cards                     FORCE ROW LEVEL SECURITY;
ALTER TABLE public.comments                  FORCE ROW LEVEL SECURITY;

-- postgres role always bypasses RLS in Supabase — re-grant explicitly so the
-- pooled Prisma connection is never accidentally restricted.
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO postgres;
