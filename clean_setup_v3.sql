-- CORRECTED FINAL CLEAN SETUP SCRIPT
-- This script uses the correct 'FOR ALL' syntax for Supabase RLS policies.

-- 1. Drop existing tables to start fresh
DROP TABLE IF EXISTS public.events CASCADE;
DROP TABLE IF EXISTS public.highlights CASCADE;
DROP TABLE IF EXISTS public.co_creators CASCADE;
DROP TABLE IF EXISTS public.volunteers CASCADE;

-- 2. Create Tables with the correct fields
CREATE TABLE public.events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    date TEXT,
    type TEXT CHECK (type IN ('Meetup', 'Training')),
    location TEXT,
    speaker TEXT,
    description TEXT,
    link TEXT,
    archived BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE public.highlights (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    num TEXT,
    title TEXT,
    date TEXT,
    place TEXT,
    time TEXT,
    image_url TEXT,
    highlight TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE public.co_creators (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE public.volunteers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Enable RLS
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.highlights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.co_creators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.volunteers ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS Policies (Corrected Syntax)
-- Public Read Access
CREATE POLICY "Allow public read-only access for events" ON public.events FOR SELECT USING (true);
CREATE POLICY "Allow public read-only access for highlights" ON public.highlights FOR SELECT USING (true);
CREATE POLICY "Allow public read-only access for co_creators" ON public.co_creators FOR SELECT USING (true);
CREATE POLICY "Allow public read-only access for volunteers" ON public.volunteers FOR SELECT USING (true);

-- Admin Full Access (Corrected with USING and WITH CHECK)
CREATE POLICY "Allow admin full access for events" ON public.events FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow admin full access for highlights" ON public.highlights FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow admin full access for co_creators" ON public.co_creators FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow admin full access for volunteers" ON public.volunteers FOR ALL TO authenticated USING (true) WITH CHECK (true);
