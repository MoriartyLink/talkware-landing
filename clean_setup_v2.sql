-- FINAL CLEAN SETUP SCRIPT
-- This script drops the existing tables and recreates them with the correct schema
-- WARNING: This will delete any data currently in these tables. 
-- Since you are about to run the seed script, this is the best way to fix the errors.

-- 1. Drop existing tables to start fresh
DROP TABLE IF EXISTS public.events;
DROP TABLE IF EXISTS public.highlights;
DROP TABLE IF EXISTS public.co_creators;

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

-- 3. Enable RLS
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.highlights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.co_creators ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS Policies
CREATE POLICY "Allow public read-only access for events" ON public.events FOR SELECT USING (true);
CREATE POLICY "Allow public read-only access for highlights" ON public.highlights FOR SELECT USING (true);
CREATE POLICY "Allow public read-only access for co_creators" ON public.co_creators FOR SELECT USING (true);

CREATE POLICY "Allow admin full access for events" ON public.events ALL TO authenticated USING (true);
CREATE POLICY "Allow admin full access for highlights" ON public.highlights ALL TO authenticated USING (true);
CREATE POLICY "Allow admin full access for co_creators" ON public.co_creators ALL TO authenticated USING (true);
