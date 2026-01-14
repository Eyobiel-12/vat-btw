# Environment Variables Guide

## 📋 Verplichte Variabelen

### Voor Lokale Development

Maak een `.env.local` bestand in de root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=https://ftleeapkwqztmvlawudk.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ0bGVlYXBrd3F6dG12bGF3dWRrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgyOTkwNDUsImV4cCI6MjA4Mzg3NTA0NX0.54bEht8R03nPv25QGCsrVcIpePXcO4HRLrVruUCPqOis
```

### Voor Vercel Deployment

Voeg deze toe in Vercel Dashboard → Project Settings → Environment Variables:

#### Production Environment:
```
NEXT_PUBLIC_SUPABASE_URL=https://ftleeapkwqztmvlawudk.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ0bGVlYXBrd3F6dG12bGF3dWRrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgyOTkwNDUsImV4cCI6MjA4Mzg3NTA0NX0.54bEht8R03nPv25QGCsrVcIpePXcO4HRLrVruUCPqOis
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ0bGVlYXBrd3F6dG12bGF3dWRrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODI5OTA0NSwiZXhwIjoyMDgzODc1MDQ1fQ.oQdvVvrotMt80H_fZxsdcvgdLlNx5yEzbAT2Al1_YQc
```

#### Preview Environment:
(Gebruik dezelfde waarden als Production)

#### Development Environment:
(Gebruik dezelfde waarden als Production)

## 🔑 Waar Haal Je Deze Vandaag?

### Supabase Dashboard
1. Ga naar: https://supabase.com/dashboard/project/ftleeapkwqztmvlawudk/settings/api
2. Kopieer:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role key** → `SUPABASE_SERVICE_ROLE_KEY` (scroll naar beneden)

### Database Connection (Optioneel)
1. Ga naar: https://supabase.com/dashboard/project/ftleeapkwqztmvlawudk/settings/database
2. Kopieer connection string of individuele waarden

## 📝 Complete .env.local Voorbeeld

```env
# ============================================
# VERPLICHT - Supabase Configuration
# ============================================
NEXT_PUBLIC_SUPABASE_URL=https://ftleeapkwqztmvlawudk.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ0bGVlYXBrd3F6dG12bGF3dWRrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgyOTkwNDUsImV4cCI6MjA4Mzg3NTA0NX0.54bEht8R03nPv25QGCsrVcIpePXcO4HRLrVruUCPqOis

# ============================================
# AANBEVOLEN - Service Role Key
# ============================================
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ0bGVlYXBrd3F6dG12bGF3dWRrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODI5OTA0NSwiZXhwIjoyMDgzODc1MDQ1fQ.oQdvVvrotMt80H_fZxsdcvgdLlNx5yEzbAT2Al1_YQc

# ============================================
# OPTIONEEL - Direct Database Access
# ============================================
POSTGRES_HOST=db.ftleeapkwqztmvlawudk.supabase.co
POSTGRES_PORT=5432
POSTGRES_DATABASE=postgres
POSTGRES_USER=postgres
POSTGRES_PASSWORD=Mydude12=34
```

## ⚠️ Belangrijke Notities

1. **Nooit commit `.env.local` naar Git!**
   - Het bestand staat al in `.gitignore`
   - Controleer altijd voordat je commit

2. **Voor Vercel:**
   - Zet alle variabelen voor **alle environments** (Production, Preview, Development)
   - Gebruik exact dezelfde waarden

3. **Security:**
   - `SUPABASE_SERVICE_ROLE_KEY` is gevoelig - bewaar veilig
   - Deel deze keys nooit publiekelijk
   - Rotate keys regelmatig als ze gelekt zijn

4. **Restart na wijzigingen:**
   - Na het toevoegen/wijzigen van `.env.local`, restart de dev server:
   ```bash
   # Stop server (Ctrl+C)
   pnpm dev
   ```

## ✅ Verificatie

Test of je environment variables correct zijn ingesteld:

```bash
# Start dev server
pnpm dev

# Als er geen errors zijn over missing env vars, dan is alles goed!
```

Als je een error krijgt zoals:
```
Missing required Supabase environment variables: NEXT_PUBLIC_SUPABASE_URL
```

Dan moet je:
1. Check of `.env.local` bestaat
2. Check of de variabele namen exact kloppen (geen typos)
3. Restart de dev server

