# 🔧 Quick Fix: Schema Cache Error

## Probleem
```
Could not find the table 'public.clients' in the schema cache
```

## ✅ Snelle Oplossing (3 stappen)

### Stap 1: Refresh Schema Cache in Supabase

1. **Ga naar Supabase Dashboard:**
   - https://supabase.com/dashboard/project/ftleeapkwqztmvlawudk/settings/api

2. **Scroll naar beneden** naar "Schema Cache" sectie

3. **Klik op "Reload schema"** of "Refresh schema cache"

4. **Wacht 10-15 seconden**

### Stap 2: Verifieer

Run in terminal:
```bash
pnpm db:verify
```

Alle tabellen moeten nu ✅ tonen.

### Stap 3: Test de Applicatie

Refresh de pagina in je browser. De fout zou nu weg moeten zijn.

---

## Alternatieve Oplossing

Als "Reload schema" niet werkt:

1. **Open SQL Editor:**
   - https://supabase.com/dashboard/project/ftleeapkwqztmvlawudk/sql/new

2. **Run dit commando:**
   ```sql
   NOTIFY pgrst, 'reload schema';
   ```

3. **Wacht 30 seconden** en test opnieuw

---

## Waarom gebeurt dit?

Supabase gebruikt PostgREST die een schema cache heeft. Na het aanmaken van tabellen duurt het soms even voordat de cache wordt geüpdatet. Dit is normaal en niet gevaarlijk.

---

## Preventie

Na het runnen van `setup.sql`, wacht altijd 30 seconden voordat je de applicatie test. De cache refresh gebeurt automatisch, maar kan even duren.

---

**Status Check:**
```bash
pnpm db:verify
```

Als alle tabellen ✅ zijn, werkt alles!

