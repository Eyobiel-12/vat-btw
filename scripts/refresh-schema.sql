-- Refresh Supabase Schema Cache
-- Run this if you get "schema cache" errors

-- This script helps refresh the PostgREST schema cache
-- Run this in Supabase SQL Editor after creating tables

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- Ensure tables are in public schema
ALTER TABLE IF EXISTS clients SET SCHEMA public;
ALTER TABLE IF EXISTS profiles SET SCHEMA public;
ALTER TABLE IF EXISTS grootboek_accounts SET SCHEMA public;
ALTER TABLE IF EXISTS btw_codes SET SCHEMA public;
ALTER TABLE IF EXISTS boekingsregels SET SCHEMA public;
ALTER TABLE IF EXISTS btw_aangiftes SET SCHEMA public;
ALTER TABLE IF EXISTS upload_logs SET SCHEMA public;

-- Note: Supabase will automatically refresh the schema cache
-- If issues persist, go to: Settings > API > and click "Reload schema"

