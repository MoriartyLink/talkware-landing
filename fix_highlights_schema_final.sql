-- This script fixes ALL missing columns in the highlights table, including 'date'
-- Run this in your Supabase SQL Editor

ALTER TABLE public.highlights 
ADD COLUMN IF NOT EXISTS num TEXT,
ADD COLUMN IF NOT EXISTS title TEXT,
ADD COLUMN IF NOT EXISTS date TEXT,
ADD COLUMN IF NOT EXISTS place TEXT,
ADD COLUMN IF NOT EXISTS time TEXT,
ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Verify the table structure
-- SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'highlights';
