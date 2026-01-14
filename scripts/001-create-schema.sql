-- =============================================
-- MARCOFIC BTW Assist Database Schema
-- Dutch Accounting System for BTW Management
-- =============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- 1. PROFILES TABLE (extends auth.users)
-- =============================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  company_name TEXT,
  kvk_number TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON profiles 
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles 
  FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles 
  FOR INSERT WITH CHECK (auth.uid() = id);

-- =============================================
-- 2. CLIENTS TABLE (bedrijven/klanten)
-- =============================================
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  kvk_number TEXT,
  btw_number TEXT,
  address TEXT,
  postal_code TEXT,
  city TEXT,
  contact_person TEXT,
  email TEXT,
  phone TEXT,
  fiscal_year_start INTEGER DEFAULT 1, -- Month (1-12)
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own clients" ON clients 
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own clients" ON clients 
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own clients" ON clients 
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own clients" ON clients 
  FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX idx_clients_user_id ON clients(user_id);

-- =============================================
-- 3. BTW CODES TABLE (BTW tarieven)
-- =============================================
CREATE TABLE btw_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  percentage DECIMAL(5,2) NOT NULL,
  rubriek TEXT, -- Belastingdienst rubriek (1a, 1b, 5b, etc.)
  is_voorbelasting BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert standard Dutch BTW codes
INSERT INTO btw_codes (code, description, percentage, rubriek, is_voorbelasting) VALUES
  ('H21', 'Hoog tarief 21%', 21.00, '1a', FALSE),
  ('L9', 'Laag tarief 9%', 9.00, '1b', FALSE),
  ('V21', 'Voorbelasting 21%', 21.00, '5b', TRUE),
  ('V9', 'Voorbelasting 9%', 9.00, '5b', TRUE),
  ('0', 'Vrijgesteld/Geen BTW', 0.00, NULL, FALSE),
  ('VL', 'Verlegd', 0.00, '2a', FALSE),
  ('EU', 'EU Intracommunautair', 0.00, '3b', FALSE),
  ('EX', 'Export buiten EU', 0.00, '3a', FALSE);

-- =============================================
-- 4. GROOTBOEK SCHEMA TABLE (Chart of Accounts)
-- =============================================
CREATE TABLE grootboek_accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  account_number TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT, -- Balans/Winst-Verlies
  subcategory TEXT, -- Activa/Passiva/Kosten/Opbrengsten
  btw_code_id UUID REFERENCES btw_codes(id),
  rubriek TEXT, -- Belastingdienst rubriek
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(client_id, account_number)
);

ALTER TABLE grootboek_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own grootboek accounts" ON grootboek_accounts 
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM clients WHERE clients.id = grootboek_accounts.client_id AND clients.user_id = auth.uid())
  );
CREATE POLICY "Users can insert own grootboek accounts" ON grootboek_accounts 
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM clients WHERE clients.id = grootboek_accounts.client_id AND clients.user_id = auth.uid())
  );
CREATE POLICY "Users can update own grootboek accounts" ON grootboek_accounts 
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM clients WHERE clients.id = grootboek_accounts.client_id AND clients.user_id = auth.uid())
  );
CREATE POLICY "Users can delete own grootboek accounts" ON grootboek_accounts 
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM clients WHERE clients.id = grootboek_accounts.client_id AND clients.user_id = auth.uid())
  );

CREATE INDEX idx_grootboek_client_id ON grootboek_accounts(client_id);
CREATE INDEX idx_grootboek_account_number ON grootboek_accounts(account_number);

-- =============================================
-- 5. BOEKINGSREGELS TABLE (Journal Entries)
-- =============================================
CREATE TABLE boekingsregels (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  boekstuk_nummer TEXT NOT NULL,
  datum DATE NOT NULL,
  grootboek_account_id UUID NOT NULL REFERENCES grootboek_accounts(id),
  omschrijving TEXT NOT NULL,
  debet DECIMAL(15,2) DEFAULT 0,
  credit DECIMAL(15,2) DEFAULT 0,
  btw_code_id UUID REFERENCES btw_codes(id),
  btw_bedrag DECIMAL(15,2) DEFAULT 0,
  factuur_nummer TEXT,
  relatie TEXT, -- Debtor/Creditor name
  periode INTEGER, -- Period number (1-12 or 1-4 for quarters)
  boekjaar INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE boekingsregels ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own boekingsregels" ON boekingsregels 
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM clients WHERE clients.id = boekingsregels.client_id AND clients.user_id = auth.uid())
  );
CREATE POLICY "Users can insert own boekingsregels" ON boekingsregels 
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM clients WHERE clients.id = boekingsregels.client_id AND clients.user_id = auth.uid())
  );
CREATE POLICY "Users can update own boekingsregels" ON boekingsregels 
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM clients WHERE clients.id = boekingsregels.client_id AND clients.user_id = auth.uid())
  );
CREATE POLICY "Users can delete own boekingsregels" ON boekingsregels 
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM clients WHERE clients.id = boekingsregels.client_id AND clients.user_id = auth.uid())
  );

CREATE INDEX idx_boekingsregels_client_id ON boekingsregels(client_id);
CREATE INDEX idx_boekingsregels_datum ON boekingsregels(datum);
CREATE INDEX idx_boekingsregels_periode ON boekingsregels(periode, boekjaar);

-- =============================================
-- 6. BTW AANGIFTES TABLE (VAT Returns)
-- =============================================
CREATE TABLE btw_aangiftes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  periode_type TEXT NOT NULL CHECK (periode_type IN ('maand', 'kwartaal', 'jaar')),
  periode INTEGER NOT NULL, -- 1-12 for months, 1-4 for quarters, year for annual
  boekjaar INTEGER NOT NULL,
  
  -- Rubriek 1: Leveringen/diensten binnenland
  rubriek_1a_bedrag DECIMAL(15,2) DEFAULT 0, -- Omzet hoog tarief
  rubriek_1a_btw DECIMAL(15,2) DEFAULT 0,
  rubriek_1b_bedrag DECIMAL(15,2) DEFAULT 0, -- Omzet laag tarief
  rubriek_1b_btw DECIMAL(15,2) DEFAULT 0,
  rubriek_1c_bedrag DECIMAL(15,2) DEFAULT 0, -- Omzet overige tarieven
  rubriek_1c_btw DECIMAL(15,2) DEFAULT 0,
  rubriek_1d_bedrag DECIMAL(15,2) DEFAULT 0, -- Prive gebruik
  rubriek_1d_btw DECIMAL(15,2) DEFAULT 0,
  rubriek_1e_bedrag DECIMAL(15,2) DEFAULT 0, -- Verlaagd tarief
  rubriek_1e_btw DECIMAL(15,2) DEFAULT 0,
  
  -- Rubriek 2: Verleggingsregelingen
  rubriek_2a_bedrag DECIMAL(15,2) DEFAULT 0, -- Leveringen naar buitenland
  rubriek_2a_btw DECIMAL(15,2) DEFAULT 0,
  
  -- Rubriek 3: Leveringen naar buitenland
  rubriek_3a_bedrag DECIMAL(15,2) DEFAULT 0, -- Export buiten EU
  rubriek_3b_bedrag DECIMAL(15,2) DEFAULT 0, -- Intracommunautair
  
  -- Rubriek 4: Leveringen vanuit buitenland
  rubriek_4a_bedrag DECIMAL(15,2) DEFAULT 0, -- Import binnen EU
  rubriek_4a_btw DECIMAL(15,2) DEFAULT 0,
  rubriek_4b_bedrag DECIMAL(15,2) DEFAULT 0, -- Import buiten EU
  rubriek_4b_btw DECIMAL(15,2) DEFAULT 0,
  
  -- Rubriek 5: Voorbelasting
  rubriek_5a_btw DECIMAL(15,2) DEFAULT 0, -- Verschuldigde BTW
  rubriek_5b_btw DECIMAL(15,2) DEFAULT 0, -- Voorbelasting
  rubriek_5c_btw DECIMAL(15,2) DEFAULT 0, -- Subtotaal
  rubriek_5d_btw DECIMAL(15,2) DEFAULT 0, -- Vermindering KOR
  rubriek_5e_btw DECIMAL(15,2) DEFAULT 0, -- Totaal te betalen
  rubriek_5f_btw DECIMAL(15,2) DEFAULT 0, -- Totaal te ontvangen
  rubriek_5g_btw DECIMAL(15,2) DEFAULT 0, -- Te betalen/ontvangen
  
  status TEXT DEFAULT 'concept' CHECK (status IN ('concept', 'definitief', 'ingediend')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(client_id, periode_type, periode, boekjaar)
);

ALTER TABLE btw_aangiftes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own btw aangiftes" ON btw_aangiftes 
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM clients WHERE clients.id = btw_aangiftes.client_id AND clients.user_id = auth.uid())
  );
CREATE POLICY "Users can insert own btw aangiftes" ON btw_aangiftes 
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM clients WHERE clients.id = btw_aangiftes.client_id AND clients.user_id = auth.uid())
  );
CREATE POLICY "Users can update own btw aangiftes" ON btw_aangiftes 
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM clients WHERE clients.id = btw_aangiftes.client_id AND clients.user_id = auth.uid())
  );
CREATE POLICY "Users can delete own btw aangiftes" ON btw_aangiftes 
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM clients WHERE clients.id = btw_aangiftes.client_id AND clients.user_id = auth.uid())
  );

CREATE INDEX idx_btw_aangiftes_client_id ON btw_aangiftes(client_id);
CREATE INDEX idx_btw_aangiftes_periode ON btw_aangiftes(boekjaar, periode);

-- =============================================
-- 7. UPLOAD LOGS TABLE (Import History)
-- =============================================
CREATE TABLE upload_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL CHECK (file_type IN ('grootboek', 'boekingsregels')),
  rows_imported INTEGER DEFAULT 0,
  rows_failed INTEGER DEFAULT 0,
  error_details JSONB,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

ALTER TABLE upload_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own upload logs" ON upload_logs 
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM clients WHERE clients.id = upload_logs.client_id AND clients.user_id = auth.uid())
  );
CREATE POLICY "Users can insert own upload logs" ON upload_logs 
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM clients WHERE clients.id = upload_logs.client_id AND clients.user_id = auth.uid())
  );

CREATE INDEX idx_upload_logs_client_id ON upload_logs(client_id);

-- =============================================
-- 8. FUNCTIONS & TRIGGERS
-- =============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to all tables with updated_at
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

-- Function to create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
