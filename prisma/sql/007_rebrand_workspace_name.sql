-- Rebrand the display name from "Branboos" to "BranBoos" (two capital Bs)
-- to match the official BranBoos Technologies wordmark.
-- The slug stays lowercase "branboos" — that's a URL identifier, not a display name.

UPDATE public.workspaces
SET name = 'BranBoos'
WHERE slug = 'branboos' AND name = 'Branboos';
