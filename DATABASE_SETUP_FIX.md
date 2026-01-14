# Database Schema Cache Error - Oplossing

## Probleem

Foutmelding: `Could not find the table 'public.clients' in the schema cache`

Dit betekent dat Supabase de database tabellen niet kan vinden in de schema cache.

## Oplossing

### Stap 1: Voer Database Setup Uit

1. **Open Supabase SQL Editor:**
   - Ga naar: https://supabase.com/dashboard/project/ftleeapkwqztmvlawudk/sql/new

2. **Kopieer en plak het setup script:**
   - Open het bestand: `scripts/setup.sql`
   - Kopieer de volledige inhoud
   - Plak in de Supabase SQL Editor
   - Klik op "Run" of druk op Cmd/Ctrl + Enter

3. **Wacht even** (5-10 seconden) voor de schema cache te refreshen

### Stap 2: Refresh Schema Cache (Optioneel)

Als de fout blijft bestaan:

1. Ga naar: https://supabase.com/dashboard/project/ftleeapkwqztmvlawudk/settings/api
2. Scroll naar beneden naar "Schema Cache"
3. Klik op "Reload schema" of "Refresh"

### Stap 3: Verifieer Setup

Run in terminal:
```bash
pnpm db:check
```

Alle tabellen moeten ✅ tonen.

## Snelle Fix Script

Als u de SQL Editor niet wilt gebruiken, kunt u ook dit script uitvoeren:

```bash
# In Supabase SQL Editor, run:
```

Kopieer de inhoud van `scripts/setup.sql` en voer uit.

## Veelvoorkomende Oorzaken

1. **Tabellen bestaan niet** - Setup script niet uitgevoerd
2. **Schema cache niet gerefresht** - Supabase heeft oude cache
3. **Permissions probleem** - RLS policies blokkeren toegang
4. **Verkeerde schema** - Tabellen staan in verkeerde schema

## Verificatie

Na setup, controleer:

```bash
pnpm db:check
```

Als alle tabellen ✅ zijn, maar de fout blijft:
- Wacht 30 seconden
- Refresh de pagina
- Check Supabase dashboard voor errors

## Hulp

Als het probleem blijft:
1. Check Supabase dashboard logs
2. Verifieer dat `.env.local` correct is
3. Controleer dat je ingelogd bent
4. Probeer de applicatie opnieuw te starten

