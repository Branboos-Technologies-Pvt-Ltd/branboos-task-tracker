-- FORCE ROW LEVEL SECURITY was too aggressive: the auth-bridge trigger
-- (SECURITY DEFINER as postgres) inserts into public.profiles and
-- public.workspace_members on signup. With FORCE + no policies, those
-- inserts would fail. Regular RLS (without FORCE) exempts the table
-- owner and superuser, which is what we want — Prisma still works,
-- the trigger still works, only the anon/authenticated roles are blocked.

ALTER TABLE public.profiles          NO FORCE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_members NO FORCE ROW LEVEL SECURITY;
ALTER TABLE public.cards             NO FORCE ROW LEVEL SECURITY;
ALTER TABLE public.comments          NO FORCE ROW LEVEL SECURITY;
