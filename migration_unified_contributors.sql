-- ============================================================
-- MIGRATION: Unified Contributors Table
-- ============================================================
-- This migration combines co_creators, volunteers, and founding_team
-- into a single `contributors` table with a `tag` column to
-- differentiate contributor types.
-- ============================================================

-- 1. Create the new unified table
CREATE TABLE IF NOT EXISTS public.contributors (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    tag TEXT NOT NULL DEFAULT 'volunteer',
    image_url TEXT,
    github_url TEXT,
    linkedin_url TEXT,
    active BOOLEAN DEFAULT true NOT NULL,
    points INT DEFAULT 0 NOT NULL CHECK (points >= 0),
    joined_at DATE DEFAULT CURRENT_DATE NOT NULL,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Keep this migration safe for databases where an earlier version of this
-- table already exists.
ALTER TABLE public.contributors
    DROP CONSTRAINT IF EXISTS contributors_tag_check;

ALTER TABLE public.contributors
    ADD COLUMN IF NOT EXISTS tag TEXT NOT NULL DEFAULT 'volunteer',
    ADD COLUMN IF NOT EXISTS github_url TEXT,
    ADD COLUMN IF NOT EXISTS linkedin_url TEXT,
    ADD COLUMN IF NOT EXISTS active BOOLEAN DEFAULT true NOT NULL,
    ADD COLUMN IF NOT EXISTS points INT DEFAULT 0 NOT NULL,
    ADD COLUMN IF NOT EXISTS joined_at DATE DEFAULT CURRENT_DATE NOT NULL,
    ADD COLUMN IF NOT EXISTS sort_order INT DEFAULT 0;

UPDATE public.contributors
SET
    tag = COALESCE(NULLIF(trim(tag), ''), 'volunteer'),
    active = COALESCE(active, true),
    points = COALESCE(points, 0),
    joined_at = COALESCE(joined_at, CURRENT_DATE),
    sort_order = COALESCE(sort_order, 0);

ALTER TABLE public.contributors
    ALTER COLUMN tag SET DEFAULT 'volunteer',
    ALTER COLUMN tag SET NOT NULL,
    ALTER COLUMN active SET DEFAULT true,
    ALTER COLUMN active SET NOT NULL,
    ALTER COLUMN points SET DEFAULT 0,
    ALTER COLUMN points SET NOT NULL,
    ALTER COLUMN joined_at SET DEFAULT CURRENT_DATE,
    ALTER COLUMN joined_at SET NOT NULL,
    ALTER COLUMN sort_order SET DEFAULT 0;

ALTER TABLE public.contributors
    DROP CONSTRAINT IF EXISTS contributors_points_check;

ALTER TABLE public.contributors
    ADD CONSTRAINT contributors_points_check CHECK (points >= 0);

-- 2. Enable RLS
ALTER TABLE public.contributors ENABLE ROW LEVEL SECURITY;

-- 3. RLS Policies
DROP POLICY IF EXISTS "Allow public read-only access for contributors" ON public.contributors;
DROP POLICY IF EXISTS "Allow admin full access for contributors" ON public.contributors;

CREATE POLICY "Allow public read-only access for contributors"
    ON public.contributors FOR SELECT
    TO anon, authenticated
    USING (true);

CREATE POLICY "Allow admin full access for contributors"
    ON public.contributors FOR ALL TO authenticated USING (true) WITH CHECK (true);

GRANT SELECT ON public.contributors TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.contributors TO authenticated;

-- 4. Migrate existing data from old tables (run only once!)
-- Migrate founding_team
DO $$
BEGIN
    IF to_regclass('public.founding_team') IS NOT NULL THEN
        INSERT INTO public.contributors (name, role, tag, image_url, active, sort_order, created_at)
        SELECT name, role, 'founding_team', image_url, active, sort_order, created_at
        FROM public.founding_team ft
        WHERE NOT EXISTS (
            SELECT 1 FROM public.contributors c
            WHERE c.name = ft.name AND c.tag = 'founding_team'
        );
    END IF;
END $$;

-- Migrate co_creators (skip duplicates that are already in founding_team)
DO $$
BEGIN
    IF to_regclass('public.co_creators') IS NOT NULL THEN
        INSERT INTO public.contributors (name, role, tag, image_url, active, sort_order, created_at)
        SELECT cc.name, cc.role, 'co_creator', cc.image_url, true, 0, cc.created_at
        FROM public.co_creators cc
        WHERE NOT EXISTS (
            SELECT 1 FROM public.contributors c
            WHERE c.name = cc.name AND c.tag IN ('founding_team', 'co_creator')
        );
    END IF;
END $$;

-- Migrate volunteers
DO $$
BEGIN
    IF to_regclass('public.volunteers') IS NOT NULL THEN
        INSERT INTO public.contributors (name, role, tag, image_url, active, sort_order, created_at)
        SELECT v.name, v.role, 'volunteer', v.image_url, true, 0, v.created_at
        FROM public.volunteers v
        WHERE NOT EXISTS (
            SELECT 1 FROM public.contributors c
            WHERE c.name = v.name AND c.tag = 'volunteer'
        );
    END IF;
END $$;

-- 5. (Optional) Drop old tables after verifying data migration
-- WARNING: Uncomment these only after confirming data is correct!
-- DROP TABLE IF EXISTS public.co_creators CASCADE;
-- DROP TABLE IF EXISTS public.volunteers CASCADE;
-- DROP TABLE IF EXISTS public.founding_team CASCADE;

-- 6. Create index for fast filtering by tag
CREATE INDEX IF NOT EXISTS idx_contributors_tag ON public.contributors(tag);
CREATE INDEX IF NOT EXISTS idx_contributors_active ON public.contributors(active);
