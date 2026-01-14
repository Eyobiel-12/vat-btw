-- Migration: Initial Database Schema
-- Description: Creates all tables, indexes, triggers, and RLS policies
-- Created: 2024-01-01

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- USERS & AUTHENTICATION
-- ============================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  company_name TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- CLIENTS (Klanten)
-- ============================================
CREATE TABLE IF NOT EXISTS public.clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  company_name TEXT,
  kvk_number TEXT,
  btw_number TEXT,
  address TEXT,
  postal_code TEXT,
  city TEXT,
  email TEXT,
  phone TEXT,
  notes TEXT,
  fiscal_year_start INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- GROOTBOEK SCHEMA (Chart of Accounts)
-- ============================================
CREATE TABLE IF NOT EXISTS public.grootboek_accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  account_number TEXT NOT NULL,
  account_name TEXT NOT NULL,
  account_type TEXT NOT NULL CHECK (account_type IN ('activa', 'passiva', 'kosten', 'omzet')),
  btw_code TEXT,
  btw_percentage DECIMAL(5,2),
  rubriek TEXT,
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(client_id, account_number)
);

-- ============================================
-- BTW CODES REFERENCE TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.btw_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  percentage DECIMAL(5,2),
  rubriek TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('verschuldigd', 'voorbelasting', 'verlegd', 'geen')),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- BOEKINGSREGELS (Journal Entries)
-- ============================================
CREATE TABLE IF NOT EXISTS public.boekingsregels (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  boekstuk_nummer TEXT,
  boekdatum DATE NOT NULL,
  omschrijving TEXT NOT NULL,
  grootboek_account_id UUID REFERENCES public.grootboek_accounts(id),
  account_number TEXT NOT NULL,
  debet DECIMAL(15,2) DEFAULT 0,
  credit DECIMAL(15,2) DEFAULT 0,
  btw_code TEXT,
  btw_bedrag DECIMAL(15,2) DEFAULT 0,
  tegenhrekening TEXT,
  factuurnummer TEXT,
  relatie TEXT,
  periode INTEGER,
  jaar INTEGER NOT NULL,
  is_validated BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- BTW AANGIFTES (VAT Returns)
-- ============================================
CREATE TABLE IF NOT EXISTS public.btw_aangiftes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  periode_type TEXT NOT NULL CHECK (periode_type IN ('maand', 'kwartaal', 'jaar')),
  periode INTEGER NOT NULL,
  jaar INTEGER NOT NULL,
  rubriek_1a_omzet DECIMAL(15,2) DEFAULT 0,
  rubriek_1a_btw DECIMAL(15,2) DEFAULT 0,
  rubriek_1b_omzet DECIMAL(15,2) DEFAULT 0,
  rubriek_1b_btw DECIMAL(15,2) DEFAULT 0,
  rubriek_1c_omzet DECIMAL(15,2) DEFAULT 0,
  rubriek_1c_btw DECIMAL(15,2) DEFAULT 0,
  rubriek_1d_omzet DECIMAL(15,2) DEFAULT 0,
  rubriek_1d_btw DECIMAL(15,2) DEFAULT 0,
  rubriek_1e_omzet DECIMAL(15,2) DEFAULT 0,
  rubriek_2a_omzet DECIMAL(15,2) DEFAULT 0,
  rubriek_3a_omzet DECIMAL(15,2) DEFAULT 0,
  rubriek_3b_omzet DECIMAL(15,2) DEFAULT 0,
  rubriek_4a_omzet DECIMAL(15,2) DEFAULT 0,
  rubriek_4a_btw DECIMAL(15,2) DEFAULT 0,
  rubriek_4b_omzet DECIMAL(15,2) DEFAULT 0,
  rubriek_4b_btw DECIMAL(15,2) DEFAULT 0,
  rubriek_5a_btw DECIMAL(15,2) DEFAULT 0,
  rubriek_5b_btw DECIMAL(15,2) DEFAULT 0,
  rubriek_5b_grondslag DECIMAL(15,2) DEFAULT 0,
  rubriek_5c_btw DECIMAL(15,2) DEFAULT 0,
  rubriek_5d_btw DECIMAL(15,2) DEFAULT 0,
  rubriek_5e_btw DECIMAL(15,2) DEFAULT 0,
  status TEXT DEFAULT 'concept' CHECK (status IN ('concept', 'definitief', 'ingediend')),
  ingediend_op TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(client_id, periode_type, periode, jaar)
);

-- ============================================
-- UPLOAD LOGS
-- ============================================
CREATE TABLE IF NOT EXISTS public.upload_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id),
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL CHECK (file_type IN ('grootboek', 'boekingsregels')),
  records_processed INTEGER DEFAULT 0,
  records_failed INTEGER DEFAULT 0,
  status TEXT DEFAULT 'processing' CHECK (status IN ('processing', 'completed', 'failed')),
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_clients_user_id ON public.clients(user_id);
CREATE INDEX IF NOT EXISTS idx_grootboek_client_id ON public.grootboek_accounts(client_id);
CREATE INDEX IF NOT EXISTS idx_grootboek_account_number ON public.grootboek_accounts(client_id, account_number);
CREATE INDEX IF NOT EXISTS idx_boekingsregels_client_id ON public.boekingsregels(client_id);
CREATE INDEX IF NOT EXISTS idx_boekingsregels_datum ON public.boekingsregels(client_id, boekdatum);
CREATE INDEX IF NOT EXISTS idx_boekingsregels_jaar_periode ON public.boekingsregels(client_id, jaar, periode);
CREATE INDEX IF NOT EXISTS idx_btw_aangiftes_client ON public.btw_aangiftes(client_id, jaar, periode);

-- ============================================
-- TRIGGERS
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_clients_updated_at ON public.clients;
CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON public.clients
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_grootboek_updated_at ON public.grootboek_accounts;
CREATE TRIGGER update_grootboek_updated_at BEFORE UPDATE ON public.grootboek_accounts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_boekingsregels_updated_at ON public.boekingsregels;
CREATE TRIGGER update_boekingsregels_updated_at BEFORE UPDATE ON public.boekingsregels
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_btw_aangiftes_updated_at ON public.btw_aangiftes;
CREATE TRIGGER update_btw_aangiftes_updated_at BEFORE UPDATE ON public.btw_aangiftes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

