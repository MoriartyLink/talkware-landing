-- 1. Create Tables
CREATE TABLE IF NOT EXISTS public.events (
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

CREATE TABLE IF NOT EXISTS public.highlights (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    num TEXT,
    title TEXT,
    date TEXT,
    place TEXT,
    time TEXT,
    image_url TEXT,
    highlight TEXT NOT NULL,
    event_id UUID REFERENCES public.events(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.co_creators (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.volunteers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.founding_team (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    image_url TEXT,
    active BOOLEAN DEFAULT true NOT NULL,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

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

-- 2. Enable RLS
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.highlights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.co_creators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.volunteers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.founding_team ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contributors ENABLE ROW LEVEL SECURITY;

-- 3. Create RLS Policies (Public Read, Admin Write)
-- Allow anyone to read
CREATE OR REPLACE POLICY "Allow public read-only access for events" ON public.events FOR SELECT USING (true);
CREATE OR REPLACE POLICY "Allow public read-only access for highlights" ON public.highlights FOR SELECT USING (true);
CREATE OR REPLACE POLICY "Allow public read-only access for co_creators" ON public.co_creators FOR SELECT USING (true);
CREATE OR REPLACE POLICY "Allow public read-only access for volunteers" ON public.volunteers FOR SELECT USING (true);
CREATE OR REPLACE POLICY "Allow public read-only access for founding_team" ON public.founding_team FOR SELECT USING (true);
CREATE OR REPLACE POLICY "Allow public read-only access for contributors" ON public.contributors FOR SELECT USING (true);

-- Allow only authenticated users (Admin) to insert/update/delete
CREATE OR REPLACE POLICY "Allow admin full access for events" ON public.events FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE OR REPLACE POLICY "Allow admin full access for highlights" ON public.highlights FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE OR REPLACE POLICY "Allow admin full access for co_creators" ON public.co_creators FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE OR REPLACE POLICY "Allow admin full access for volunteers" ON public.volunteers FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE OR REPLACE POLICY "Allow admin full access for founding_team" ON public.founding_team FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE OR REPLACE POLICY "Allow admin full access for contributors" ON public.contributors FOR ALL TO authenticated USING (true) WITH CHECK (true);

GRANT SELECT ON public.contributors TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.contributors TO authenticated;

-- 4. Create Storage Bucket for assets
-- Note: Run this in the Supabase Dashboard if the bucket doesn't exist
-- INSERT INTO storage.buckets (id, name, public) VALUES ('assets', 'assets', true);

-- Storage Policies
-- Allow public access to read files
CREATE OR REPLACE POLICY "Public Access" ON storage.objects FOR SELECT USING ( bucket_id = 'assets' );

-- Allow authenticated users to upload/manage files
CREATE OR REPLACE POLICY "Admin Access" ON storage.objects FOR ALL TO authenticated USING ( bucket_id = 'assets' );

-- 5. Event Detail Tables
CREATE TABLE IF NOT EXISTS public.event_media (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    event_id UUID REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
    media_type TEXT CHECK (media_type IN ('photo', 'video')) NOT NULL,
    title TEXT,
    url TEXT NOT NULL,
    caption TEXT,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.event_sections (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    event_id UUID REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
    section_type TEXT CHECK (section_type IN ('highlight', 'activity', 'game', 'win')) NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    subtitle TEXT,
    icon TEXT,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Enable RLS for event detail tables
ALTER TABLE public.event_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_sections ENABLE ROW LEVEL SECURITY;

-- 7. RLS Policies for event detail tables
CREATE POLICY "Allow public read-only access for event_media" ON public.event_media FOR SELECT USING (true);
CREATE POLICY "Allow public read-only access for event_sections" ON public.event_sections FOR SELECT USING (true);

CREATE POLICY "Allow admin full access for event_media" ON public.event_media FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow admin full access for event_sections" ON public.event_sections FOR ALL TO authenticated USING (true) WITH CHECK (true);
