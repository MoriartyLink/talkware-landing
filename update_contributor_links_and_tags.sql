-- Contributor profile links and editable tag colors.
-- Run this in the Supabase SQL editor.

ALTER TABLE public.contributors
  ADD COLUMN IF NOT EXISTS github_url TEXT,
  ADD COLUMN IF NOT EXISTS linkedin_url TEXT;

CREATE TABLE IF NOT EXISTS public.contributor_tags (
  value TEXT PRIMARY KEY,
  label TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#34d399',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.contributor_tags ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read-only access for contributor tags" ON public.contributor_tags;
DROP POLICY IF EXISTS "Allow admin full access for contributor tags" ON public.contributor_tags;

CREATE POLICY "Allow public read-only access for contributor tags"
  ON public.contributor_tags
  FOR SELECT
  USING (true);

CREATE POLICY "Allow admin full access for contributor tags"
  ON public.contributor_tags
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

GRANT SELECT ON public.contributor_tags TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.contributor_tags TO authenticated;

INSERT INTO public.contributor_tags (value, label, color)
VALUES
  ('founding_team', 'Founding Team', '#f59e0b'),
  ('co_creator', 'Co-Creator', '#8b5cf6'),
  ('volunteer', 'Volunteer', '#34d399'),
  ('website_contributor', 'Website Contributor', '#38bdf8')
ON CONFLICT (value) DO UPDATE
SET
  label = EXCLUDED.label,
  color = EXCLUDED.color;
