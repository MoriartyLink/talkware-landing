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

-- 2. Enable RLS
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.highlights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.co_creators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.volunteers ENABLE ROW LEVEL SECURITY;

-- 3. Create RLS Policies (Public Read, Admin Write)
-- Allow anyone to read
CREATE OR REPLACE POLICY "Allow public read-only access for events" ON public.events FOR SELECT USING (true);
CREATE OR REPLACE POLICY "Allow public read-only access for highlights" ON public.highlights FOR SELECT USING (true);
CREATE OR REPLACE POLICY "Allow public read-only access for co_creators" ON public.co_creators FOR SELECT USING (true);
CREATE OR REPLACE POLICY "Allow public read-only access for volunteers" ON public.volunteers FOR SELECT USING (true);

-- Allow only authenticated users (Admin) to insert/update/delete
CREATE OR REPLACE POLICY "Allow admin full access for events" ON public.events ALL TO authenticated USING (true);
CREATE OR REPLACE POLICY "Allow admin full access for highlights" ON public.highlights ALL TO authenticated USING (true);
CREATE OR REPLACE POLICY "Allow admin full access for co_creators" ON public.co_creators ALL TO authenticated USING (true);
CREATE OR REPLACE POLICY "Allow admin full access for volunteers" ON public.volunteers ALL TO authenticated USING (true);

-- 4. Create Storage Bucket for assets
-- Note: Run this in the Supabase Dashboard if the bucket doesn't exist
-- INSERT INTO storage.buckets (id, name, public) VALUES ('assets', 'assets', true);

-- Storage Policies
-- Allow public access to read files
CREATE OR REPLACE POLICY "Public Access" ON storage.objects FOR SELECT USING ( bucket_id = 'assets' );

-- Allow authenticated users to upload/manage files
CREATE OR REPLACE POLICY "Admin Access" ON storage.objects FOR ALL TO authenticated USING ( bucket_id = 'assets' );
