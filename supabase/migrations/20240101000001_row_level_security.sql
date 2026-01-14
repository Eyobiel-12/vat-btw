-- Migration: Row Level Security Policies
-- Description: Sets up RLS policies for all tables
-- Created: 2024-01-01

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grootboek_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.boekingsregels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.btw_aangiftes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.upload_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.btw_codes ENABLE ROW LEVEL SECURITY;

-- PROFILES POLICIES
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- CLIENTS POLICIES
DROP POLICY IF EXISTS "Users can view own clients" ON public.clients;
CREATE POLICY "Users can view own clients" ON public.clients
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own clients" ON public.clients;
CREATE POLICY "Users can insert own clients" ON public.clients
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own clients" ON public.clients;
CREATE POLICY "Users can update own clients" ON public.clients
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own clients" ON public.clients;
CREATE POLICY "Users can delete own clients" ON public.clients
  FOR DELETE USING (auth.uid() = user_id);

-- GROOTBOEK POLICIES
DROP POLICY IF EXISTS "Users can view own grootboek" ON public.grootboek_accounts;
CREATE POLICY "Users can view own grootboek" ON public.grootboek_accounts
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.clients 
      WHERE clients.id = grootboek_accounts.client_id 
      AND clients.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can insert own grootboek" ON public.grootboek_accounts;
CREATE POLICY "Users can insert own grootboek" ON public.grootboek_accounts
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.clients 
      WHERE clients.id = grootboek_accounts.client_id 
      AND clients.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can update own grootboek" ON public.grootboek_accounts;
CREATE POLICY "Users can update own grootboek" ON public.grootboek_accounts
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.clients 
      WHERE clients.id = grootboek_accounts.client_id 
      AND clients.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can delete own grootboek" ON public.grootboek_accounts;
CREATE POLICY "Users can delete own grootboek" ON public.grootboek_accounts
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.clients 
      WHERE clients.id = grootboek_accounts.client_id 
      AND clients.user_id = auth.uid()
    )
  );

-- BOEKINGSREGELS POLICIES
DROP POLICY IF EXISTS "Users can view own boekingsregels" ON public.boekingsregels;
CREATE POLICY "Users can view own boekingsregels" ON public.boekingsregels
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.clients 
      WHERE clients.id = boekingsregels.client_id 
      AND clients.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can insert own boekingsregels" ON public.boekingsregels;
CREATE POLICY "Users can insert own boekingsregels" ON public.boekingsregels
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.clients 
      WHERE clients.id = boekingsregels.client_id 
      AND clients.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can update own boekingsregels" ON public.boekingsregels;
CREATE POLICY "Users can update own boekingsregels" ON public.boekingsregels
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.clients 
      WHERE clients.id = boekingsregels.client_id 
      AND clients.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can delete own boekingsregels" ON public.boekingsregels;
CREATE POLICY "Users can delete own boekingsregels" ON public.boekingsregels
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.clients 
      WHERE clients.id = boekingsregels.client_id 
      AND clients.user_id = auth.uid()
    )
  );

-- BTW AANGIFTES POLICIES
DROP POLICY IF EXISTS "Users can view own btw aangiftes" ON public.btw_aangiftes;
CREATE POLICY "Users can view own btw aangiftes" ON public.btw_aangiftes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.clients 
      WHERE clients.id = btw_aangiftes.client_id 
      AND clients.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can insert own btw aangiftes" ON public.btw_aangiftes;
CREATE POLICY "Users can insert own btw aangiftes" ON public.btw_aangiftes
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.clients 
      WHERE clients.id = btw_aangiftes.client_id 
      AND clients.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can update own btw aangiftes" ON public.btw_aangiftes;
CREATE POLICY "Users can update own btw aangiftes" ON public.btw_aangiftes
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.clients 
      WHERE clients.id = btw_aangiftes.client_id 
      AND clients.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can delete own btw aangiftes" ON public.btw_aangiftes;
CREATE POLICY "Users can delete own btw aangiftes" ON public.btw_aangiftes
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.clients 
      WHERE clients.id = btw_aangiftes.client_id 
      AND clients.user_id = auth.uid()
    )
  );

-- UPLOAD LOGS POLICIES
DROP POLICY IF EXISTS "Users can view own upload logs" ON public.upload_logs;
CREATE POLICY "Users can view own upload logs" ON public.upload_logs
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own upload logs" ON public.upload_logs;
CREATE POLICY "Users can insert own upload logs" ON public.upload_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- BTW CODES POLICIES (Public read access)
DROP POLICY IF EXISTS "Anyone can view btw codes" ON public.btw_codes;
CREATE POLICY "Anyone can view btw codes" ON public.btw_codes
  FOR SELECT USING (true);

