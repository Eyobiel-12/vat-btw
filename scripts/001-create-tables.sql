-- BTW Assist Database Schema
-- Dutch VAT/BTW Accounting System

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- USERS & AUTHENTICATION
-- ============================================
-- Note: Supabase Auth handles user authentication
-- This table extends the auth.users with profile info

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
  kvk_number TEXT, -- Kamer van Koophandel number
  btw_number TEXT, -- BTW identification number
  address TEXT,
  postal_code TEXT,
  city TEXT,
  email TEXT,
  phone TEXT,
  notes TEXT,
  fiscal_year_start INTEGER DEFAULT 1, -- Month (1-12)
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- GROOTBOEK SCHEMA (Chart of Accounts)
-- ============================================
CREATE TABLE IF NOT EXISTS public.grootboek_accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  account_number TEXT NOT NULL, -- e.g., "1000", "4000"
  account_name TEXT NOT NULL, -- e.g., "Kas", "Omzet binnenland"
  account_type TEXT NOT NULL CHECK (account_type IN ('activa', 'passiva', 'kosten', 'omzet')),
  btw_code TEXT, -- e.g., "1a", "1b", "5b", "geen"
  btw_percentage DECIMAL(5,2), -- e.g., 21.00, 9.00, 0.00
  rubriek TEXT, -- Belastingdienst rubriek
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
  code TEXT NOT NULL UNIQUE, -- e.g., "1a", "1b", "2a", "5b"
  description TEXT NOT NULL,
  percentage DECIMAL(5,2),
  rubriek TEXT NOT NULL, -- Belastingdienst rubriek
  type TEXT NOT NULL CHECK (type IN ('verschuldigd', 'voorbelasting', 'verlegd', 'geen')),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default Dutch BTW codes
INSERT INTO public.btw_codes (code, description, percentage, rubriek, type) VALUES
  ('1a', 'Leveringen/diensten belast met hoog tarief', 21.00, '1a', 'verschuldigd'),
  ('1b', 'Leveringen/diensten belast met laag tarief', 9.00, '1b', 'verschuldigd'),
  ('1c', 'Leveringen/diensten belast met overige tarieven', 0.00, '1c', 'verschuldigd'),
  ('1d', 'Privégebruik', 21.00, '1d', 'verschuldigd'),
  ('1e', 'Leveringen/diensten belast met 0% of niet bij u belast', 0.00, '1e', 'geen'),
  ('2a', 'Leveringen naar landen buiten de EU', 0.00, '2a', 'geen'),
  ('3a', 'Leveringen naar landen binnen de EU', 0.00, '3a', 'geen'),
  ('3b', 'Diensten naar landen binnen de EU', 0.00, '3b', 'geen'),
  ('4a', 'Leveringen uit landen buiten de EU', 21.00, '4a', 'verlegd'),
  ('4b', 'Leveringen uit landen binnen de EU', 21.00, '4b', 'verlegd'),
  ('5b', 'Voorbelasting', 21.00, '5b', 'voorbelasting'),
  ('5b-laag', 'Voorbelasting laag tarief', 9.00, '5b', 'voorbelasting'),
  ('geen', 'Geen BTW', 0.00, 'geen', 'geen')
ON CONFLICT (code) DO NOTHING;

-- ============================================
-- BOEKINGSREGELS (Journal Entries / Transactions)
-- ============================================
CREATE TABLE IF NOT EXISTS public.boekingsregels (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  boekstuk_nummer TEXT, -- Document/voucher number
  boekdatum DATE NOT NULL,
  omschrijving TEXT NOT NULL,
  grootboek_account_id UUID REFERENCES public.grootboek_accounts(id),
  account_number TEXT NOT NULL, -- Denormalized for quick access
  debet DECIMAL(15,2) DEFAULT 0,
  credit DECIMAL(15,2) DEFAULT 0,
  btw_code TEXT,
  btw_bedrag DECIMAL(15,2) DEFAULT 0,
  tegenhrekening TEXT, -- Counter account
  factuurnummer TEXT, -- Invoice number
  relatie TEXT, -- Customer/Supplier name
  periode INTEGER, -- Period (1-12 for months, or quarter)
  jaar INTEGER NOT NULL, -- Year
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
  periode INTEGER NOT NULL, -- Month (1-12), Quarter (1-4), or 0 for year
  jaar INTEGER NOT NULL,
  
  -- Rubriek 1: Prestaties binnenland
  rubriek_1a_omzet DECIMAL(15,2) DEFAULT 0,
  rubriek_1a_btw DECIMAL(15,2) DEFAULT 0,
  rubriek_1b_omzet DECIMAL(15,2) DEFAULT 0,
  rubriek_1b_btw DECIMAL(15,2) DEFAULT 0,
  rubriek_1c_omzet DECIMAL(15,2) DEFAULT 0,
  rubriek_1c_btw DECIMAL(15,2) DEFAULT 0,
  rubriek_1d_omzet DECIMAL(15,2) DEFAULT 0,
  rubriek_1d_btw DECIMAL(15,2) DEFAULT 0,
  rubriek_1e_omzet DECIMAL(15,2) DEFAULT 0,
  
  -- Rubriek 2: Leveringen naar het buitenland
  rubriek_2a_omzet DECIMAL(15,2) DEFAULT 0,
  
  -- Rubriek 3: Leveringen naar/diensten binnen EU
  rubriek_3a_omzet DECIMAL(15,2) DEFAULT 0,
  rubriek_3b_omzet DECIMAL(15,2) DEFAULT 0,
  
  -- Rubriek 4: Leveringen uit het buitenland
  rubriek_4a_omzet DECIMAL(15,2) DEFAULT 0,
  rubriek_4a_btw DECIMAL(15,2) DEFAULT 0,
  rubriek_4b_omzet DECIMAL(15,2) DEFAULT 0,
  rubriek_4b_btw DECIMAL(15,2) DEFAULT 0,
  
  -- Rubriek 5: Voorbelasting & Totalen
  rubriek_5a_btw DECIMAL(15,2) DEFAULT 0, -- Verschuldigde BTW (sum of 1+4)
  rubriek_5b_btw DECIMAL(15,2) DEFAULT 0, -- Voorbelasting
  rubriek_5c_btw DECIMAL(15,2) DEFAULT 0, -- Subtotaal
  rubriek_5d_btw DECIMAL(15,2) DEFAULT 0, -- Vermindering (kleineondernemersregeling)
  rubriek_5e_btw DECIMAL(15,2) DEFAULT 0, -- Totaal te betalen/ontvangen
  
  status TEXT DEFAULT 'concept' CHECK (status IN ('concept', 'definitief', 'ingediend')),
  ingediend_op TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(client_id, periode_type, periode, jaar)
);

-- ============================================
-- UPLOAD LOGS (Track file uploads)
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
-- INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX IF NOT EXISTS idx_clients_user_id ON public.clients(user_id);
CREATE INDEX IF NOT EXISTS idx_grootboek_client_id ON public.grootboek_accounts(client_id);
CREATE INDEX IF NOT EXISTS idx_grootboek_account_number ON public.grootboek_accounts(client_id, account_number);
CREATE INDEX IF NOT EXISTS idx_boekingsregels_client_id ON public.boekingsregels(client_id);
CREATE INDEX IF NOT EXISTS idx_boekingsregels_datum ON public.boekingsregels(client_id, boekdatum);
CREATE INDEX IF NOT EXISTS idx_boekingsregels_jaar_periode ON public.boekingsregels(client_id, jaar, periode);
CREATE INDEX IF NOT EXISTS idx_btw_aangiftes_client ON public.btw_aangiftes(client_id, jaar, periode);

-- ============================================
-- UPDATED_AT TRIGGER FUNCTION
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers
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
