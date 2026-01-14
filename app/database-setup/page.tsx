"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, Copy, CheckCircle2, ExternalLink } from "lucide-react"

// Setup SQL - copy from scripts/setup.sql
const SETUP_SQL = `-- BTW Assist Complete Database Setup
-- Run this entire script in Supabase SQL Editor
-- https://supabase.com/dashboard/project/ftleeapkwqztmvlawudk/sql/new

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

-- ============================================
-- PART 2: ROW LEVEL SECURITY
-- ============================================

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

-- Refresh schema cache
NOTIFY pgrst, 'reload schema';`

const REFRESH_SQL = `NOTIFY pgrst, 'reload schema';`

export default function DatabaseSetupPage() {
  const [setupCopied, setSetupCopied] = useState(false)
  const [refreshCopied, setRefreshCopied] = useState(false)

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Database Setup</h1>
          <p className="text-muted-foreground">
            Voer deze SQL scripts uit in Supabase om de database te configureren
          </p>
        </div>

        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Belangrijk</AlertTitle>
          <AlertDescription>
            Voer deze scripts uit in de volgorde zoals hieronder getoond. Na elke stap wacht u 10-15 seconden.
          </AlertDescription>
        </Alert>

        {/* Step 1: Main Setup */}
        <Card>
          <CardHeader>
            <CardTitle>Stap 1: Database Schema Aanmaken</CardTitle>
            <CardDescription>
              Kopieer en plak dit script in de Supabase SQL Editor
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">
                Open:{" "}
                <a
                  href="https://supabase.com/dashboard/project/ftleeapkwqztmvlawudk/sql/new"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline inline-flex items-center gap-1"
                >
                  Supabase SQL Editor <ExternalLink className="w-3 h-3" />
                </a>
              </p>
              <CopySQLButton sql={SETUP_SQL} label="Kopieer Setup SQL" onCopy={() => setSetupCopied(true)} />
            </div>
            <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-xs max-h-96 overflow-y-auto">
              <code>{SETUP_SQL}</code>
            </pre>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              <span>Na het uitvoeren, wacht 30 seconden voor schema cache refresh</span>
            </div>
          </CardContent>
        </Card>

        {/* Step 2: Refresh Schema */}
        <Card>
          <CardHeader>
            <CardTitle>Stap 2: Schema Cache Refreshen (Optioneel)</CardTitle>
            <CardDescription>
              Als u nog steeds schema cache errors ziet, voer dit uit
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">Run in Supabase SQL Editor</p>
              <CopySQLButton sql={REFRESH_SQL} label="Kopieer Refresh SQL" onCopy={() => setRefreshCopied(true)} />
            </div>
            <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-xs">
              <code>{REFRESH_SQL}</code>
            </pre>
          </CardContent>
        </Card>

        {/* Step 3: Verify */}
        <Card>
          <CardHeader>
            <CardTitle>Stap 3: Verificatie</CardTitle>
            <CardDescription>Controleer of alles correct is ingesteld</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Run in terminal om te verifiëren:
            </p>
            <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-xs mb-4">
              <code>pnpm db:verify</code>
            </pre>
            <p className="text-sm text-muted-foreground">
              Alle tabellen moeten ✅ tonen. Als dat zo is, refresh uw browser en de applicatie zou moeten werken.
            </p>
          </CardContent>
        </Card>

        {/* Alternative: Manual Refresh */}
        <Card>
          <CardHeader>
            <CardTitle>Alternatief: Handmatige Schema Refresh</CardTitle>
            <CardDescription>Via Supabase Dashboard</CardDescription>
          </CardHeader>
          <CardContent>
            <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
              <li>
                Ga naar:{" "}
                <a
                  href="https://supabase.com/dashboard/project/ftleeapkwqztmvlawudk/settings/api"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Settings → API
                </a>
              </li>
              <li>Scroll naar beneden naar "Schema Cache"</li>
              <li>Klik op "Reload schema" of "Refresh schema cache"</li>
              <li>Wacht 15 seconden</li>
              <li>Refresh uw browser</li>
            </ol>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function CopySQLButton({ sql, label, onCopy }: { sql: string; label: string; onCopy?: () => void }) {
  const [copied, setCopied] = useState(false)
  
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => {
        navigator.clipboard.writeText(sql)
        setCopied(true)
        if (onCopy) onCopy()
        setTimeout(() => setCopied(false), 2000)
      }}
    >
      {copied ? (
        <>
          <CheckCircle2 className="w-4 h-4 mr-2" />
          Gekopieerd!
        </>
      ) : (
        <>
          <Copy className="w-4 h-4 mr-2" />
          {label}
        </>
      )}
    </Button>
  )
}

