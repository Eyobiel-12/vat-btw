-- =============================================
-- MARCOFIC BTW Assist - Updated Database Schema
-- Aligned with existing TypeScript types
-- =============================================

-- Drop existing tables if they exist (for clean migration)
DROP TABLE IF EXISTS upload_logs CASCADE;
DROP TABLE IF EXISTS btw_aangiftes CASCADE;
DROP TABLE IF EXISTS boekingsregels CASCADE;
DROP TABLE IF EXISTS grootboek_accounts CASCADE;
DROP TABLE IF EXISTS btw_codes CASCADE;
DROP TABLE IF EXISTS clients CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- 1. PROFILES TABLE
-- =============================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  company_name TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- =============================================
-- 2. CLIENTS TABLE
-- =============================================
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
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

ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own clients" ON clients FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own clients" ON clients FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own clients" ON clients FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own clients" ON clients FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX idx_clients_user_id ON clients(user_id);

-- =============================================
-- 3. BTW CODES TABLE
-- =============================================
CREATE TYPE btw_type AS ENUM ('verschuldigd', 'voorbelasting', 'verlegd', 'geen');

CREATE TABLE btw_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  percentage DECIMAL(5,2),
  rubriek TEXT NOT NULL,
  type btw_type NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert standard Dutch BTW codes
INSERT INTO btw_codes (code, description, percentage, rubriek, type) VALUES
  ('1a', 'Omzet hoog tarief 21%', 21.00, '1a', 'verschuldigd'),
  ('1b', 'Omzet laag tarief 9%', 9.00, '1b', 'verschuldigd'),
  ('1c', 'Omzet overige tarieven', 0.00, '1c', 'verschuldigd'),
  ('1d', 'Privégebruik', 21.00, '1d', 'verschuldigd'),
  ('1e', 'Vrijgestelde omzet', 0.00, '1e', 'geen'),
  ('2a', 'Verleggingsregeling', 0.00, '2a', 'verlegd'),
  ('3a', 'Export buiten EU', 0.00, '3a', 'geen'),
  ('3b', 'Intracommunautaire leveringen', 0.00, '3b', 'geen'),
  ('4a', 'Verwervingen binnen EU', 21.00, '4a', 'verschuldigd'),
  ('4b', 'Import buiten EU', 21.00, '4b', 'verschuldigd'),
  ('5b', 'Voorbelasting 21%', 21.00, '5b', 'voorbelasting'),
  ('5b-laag', 'Voorbelasting 9%', 9.00, '5b', 'voorbelasting'),
  ('0', 'Geen BTW', 0.00, '0', 'geen');

-- =============================================
-- 4. GROOTBOEK ACCOUNTS TABLE
-- =============================================
CREATE TYPE account_type AS ENUM ('activa', 'passiva', 'kosten', 'omzet');

CREATE TABLE grootboek_accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  account_number TEXT NOT NULL,
  account_name TEXT NOT NULL,
  account_type account_type NOT NULL,
  btw_code TEXT,
  btw_percentage DECIMAL(5,2),
  rubriek TEXT,
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(client_id, account_number)
);

ALTER TABLE grootboek_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own grootboek" ON grootboek_accounts FOR SELECT USING (
  EXISTS (SELECT 1 FROM clients WHERE clients.id = grootboek_accounts.client_id AND clients.user_id = auth.uid())
);
CREATE POLICY "Users can insert own grootboek" ON grootboek_accounts FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM clients WHERE clients.id = grootboek_accounts.client_id AND clients.user_id = auth.uid())
);
CREATE POLICY "Users can update own grootboek" ON grootboek_accounts FOR UPDATE USING (
  EXISTS (SELECT 1 FROM clients WHERE clients.id = grootboek_accounts.client_id AND clients.user_id = auth.uid())
);
CREATE POLICY "Users can delete own grootboek" ON grootboek_accounts FOR DELETE USING (
  EXISTS (SELECT 1 FROM clients WHERE clients.id = grootboek_accounts.client_id AND clients.user_id = auth.uid())
);

CREATE INDEX idx_grootboek_client_id ON grootboek_accounts(client_id);

-- =============================================
-- 5. BOEKINGSREGELS TABLE
-- =============================================
CREATE TABLE boekingsregels (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  boekstuk_nummer TEXT,
  boekdatum DATE NOT NULL,
  omschrijving TEXT NOT NULL,
  grootboek_account_id UUID REFERENCES grootboek_accounts(id),
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

ALTER TABLE boekingsregels ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own boekingsregels" ON boekingsregels FOR SELECT USING (
  EXISTS (SELECT 1 FROM clients WHERE clients.id = boekingsregels.client_id AND clients.user_id = auth.uid())
);
CREATE POLICY "Users can insert own boekingsregels" ON boekingsregels FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM clients WHERE clients.id = boekingsregels.client_id AND clients.user_id = auth.uid())
);
CREATE POLICY "Users can update own boekingsregels" ON boekingsregels FOR UPDATE USING (
  EXISTS (SELECT 1 FROM clients WHERE clients.id = boekingsregels.client_id AND clients.user_id = auth.uid())
);
CREATE POLICY "Users can delete own boekingsregels" ON boekingsregels FOR DELETE USING (
  EXISTS (SELECT 1 FROM clients WHERE clients.id = boekingsregels.client_id AND clients.user_id = auth.uid())
);

CREATE INDEX idx_boekingsregels_client_id ON boekingsregels(client_id);
CREATE INDEX idx_boekingsregels_datum ON boekingsregels(boekdatum);
CREATE INDEX idx_boekingsregels_jaar_periode ON boekingsregels(jaar, periode);

-- =============================================
-- 6. BTW AANGIFTES TABLE
-- =============================================
CREATE TYPE periode_type AS ENUM ('maand', 'kwartaal', 'jaar');
CREATE TYPE aangifte_status AS ENUM ('concept', 'definitief', 'ingediend');

CREATE TABLE btw_aangiftes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  periode_type periode_type NOT NULL,
  periode INTEGER NOT NULL,
  jaar INTEGER NOT NULL,
  
  -- Rubriek 1: Binnenlandse omzet
  rubriek_1a_omzet DECIMAL(15,2) DEFAULT 0,
  rubriek_1a_btw DECIMAL(15,2) DEFAULT 0,
  rubriek_1b_omzet DECIMAL(15,2) DEFAULT 0,
  rubriek_1b_btw DECIMAL(15,2) DEFAULT 0,
  rubriek_1c_omzet DECIMAL(15,2) DEFAULT 0,
  rubriek_1c_btw DECIMAL(15,2) DEFAULT 0,
  rubriek_1d_omzet DECIMAL(15,2) DEFAULT 0,
  rubriek_1d_btw DECIMAL(15,2) DEFAULT 0,
  rubriek_1e_omzet DECIMAL(15,2) DEFAULT 0,
  
  -- Rubriek 2: Verleggingsregelingen
  rubriek_2a_omzet DECIMAL(15,2) DEFAULT 0,
  
  -- Rubriek 3: Buitenlandse omzet
  rubriek_3a_omzet DECIMAL(15,2) DEFAULT 0,
  rubriek_3b_omzet DECIMAL(15,2) DEFAULT 0,
  
  -- Rubriek 4: Invoer
  rubriek_4a_omzet DECIMAL(15,2) DEFAULT 0,
  rubriek_4a_btw DECIMAL(15,2) DEFAULT 0,
  rubriek_4b_omzet DECIMAL(15,2) DEFAULT 0,
  rubriek_4b_btw DECIMAL(15,2) DEFAULT 0,
  
  -- Rubriek 5: BTW berekening
  rubriek_5a_btw DECIMAL(15,2) DEFAULT 0,
  rubriek_5b_btw DECIMAL(15,2) DEFAULT 0,
  rubriek_5c_btw DECIMAL(15,2) DEFAULT 0,
  rubriek_5d_btw DECIMAL(15,2) DEFAULT 0,
  rubriek_5e_btw DECIMAL(15,2) DEFAULT 0,
  
  status aangifte_status DEFAULT 'concept',
  ingediend_op TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(client_id, periode_type, periode, jaar)
);

ALTER TABLE btw_aangiftes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own btw aangiftes" ON btw_aangiftes FOR SELECT USING (
  EXISTS (SELECT 1 FROM clients WHERE clients.id = btw_aangiftes.client_id AND clients.user_id = auth.uid())
);
CREATE POLICY "Users can insert own btw aangiftes" ON btw_aangiftes FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM clients WHERE clients.id = btw_aangiftes.client_id AND clients.user_id = auth.uid())
);
CREATE POLICY "Users can update own btw aangiftes" ON btw_aangiftes FOR UPDATE USING (
  EXISTS (SELECT 1 FROM clients WHERE clients.id = btw_aangiftes.client_id AND clients.user_id = auth.uid())
);
CREATE POLICY "Users can delete own btw aangiftes" ON btw_aangiftes FOR DELETE USING (
  EXISTS (SELECT 1 FROM clients WHERE clients.id = btw_aangiftes.client_id AND clients.user_id = auth.uid())
);

CREATE INDEX idx_btw_aangiftes_client_id ON btw_aangiftes(client_id);

-- =============================================
-- 7. UPLOAD LOGS TABLE
-- =============================================
CREATE TYPE upload_file_type AS ENUM ('grootboek', 'boekingsregels');
CREATE TYPE upload_status AS ENUM ('processing', 'completed', 'failed');

CREATE TABLE upload_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_type upload_file_type NOT NULL,
  records_processed INTEGER DEFAULT 0,
  records_failed INTEGER DEFAULT 0,
  status upload_status DEFAULT 'processing',
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE upload_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own upload logs" ON upload_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own upload logs" ON upload_logs FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_upload_logs_client_id ON upload_logs(client_id);

-- =============================================
-- 8. TRIGGERS
-- =============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_grootboek_accounts_updated_at BEFORE UPDATE ON grootboek_accounts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_boekingsregels_updated_at BEFORE UPDATE ON boekingsregels
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_btw_aangiftes_updated_at BEFORE UPDATE ON btw_aangiftes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
