-- Check if 'founders' table exists (should NOT exist if using founding_team)
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('founders', 'founding_team');

-- Check for any foreign keys, views, or functions referencing 'founders'
SELECT 
  tc.table_name, 
  tc.constraint_name, 
  tc.constraint_type,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints tc
LEFT JOIN information_schema.key_column_usage kcu
  ON tc.constraint_name = kcu.constraint_name
LEFT JOIN information_schema.constraint_column_usage ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.table_schema = 'public'
  AND (ccu.table_name = 'founders' OR tc.table_name = 'founders');

-- Check PostgREST schema cache (requires superuser, may not work in Supabase)
-- This is informational only
SELECT schemaname, tablename 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('founders', 'founding_team');
