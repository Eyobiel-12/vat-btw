# 🚀 Database Setup - Stap voor Stap Instructies

## ⚠️ BELANGRIJK: Je moet eerst de database setup uitvoeren!

De applicatie kan nu niet werken omdat de database tabellen nog niet bestaan. Volg deze stappen:

---

## 📋 Stap 1: Open Supabase SQL Editor

1. **Klik op deze link:**
   https://supabase.com/dashboard/project/ftleeapkwqztmvlawudk/sql/new

2. Je ziet nu de Supabase SQL Editor

---

## 📋 Stap 2: Kopieer het Setup Script

### Optie A: Via de applicatie (aanbevolen)
1. Ga naar: http://localhost:3000/database-setup
2. Klik op de knop **"Kopieer Setup SQL"**
3. Het hele script is nu gekopieerd

### Optie B: Handmatig
1. Open het bestand: `scripts/setup.sql` in je editor
2. Selecteer alles (Cmd/Ctrl + A)
3. Kopieer (Cmd/Ctrl + C)

---

## 📋 Stap 3: Plak en Voer Uit

1. **Plak** het script in de Supabase SQL Editor (Cmd/Ctrl + V)
2. **Klik op "Run"** of druk op **Cmd/Ctrl + Enter**
3. **Wacht** tot je ziet: "Success. No rows returned" of vergelijkbaar

---

## 📋 Stap 4: Wacht op Schema Cache Refresh

**Wacht 30-60 seconden** na het uitvoeren van het script. Supabase moet de schema cache refreshen.

---

## 📋 Stap 5: Refresh Schema Cache (Optioneel maar Aanbevolen)

### Methode 1: Via Dashboard (Makkelijkst)
1. Ga naar: https://supabase.com/dashboard/project/ftleeapkwqztmvlawudk/settings/api
2. Scroll naar beneden naar **"Schema Cache"**
3. Klik op **"Reload schema"** of **"Refresh schema cache"**
4. Wacht 15 seconden

### Methode 2: Via SQL Editor
1. In de SQL Editor, type:
   ```sql
   NOTIFY pgrst, 'reload schema';
   ```
2. Klik "Run"
3. Wacht 30 seconden

---

## 📋 Stap 6: Verifieer

Run in terminal:
```bash
pnpm db:verify
```

Je zou moeten zien:
```
✅ profiles - Exists and accessible
✅ clients - Exists and accessible
✅ grootboek_accounts - Exists and accessible
✅ btw_codes - Exists and accessible
✅ boekingsregels - Exists and accessible
✅ btw_aangiftes - Exists and accessible
✅ upload_logs - Exists and accessible

✅ All tables exist and are accessible!
```

Als je nog steeds ⚠️ of ❌ ziet, wacht nog 30 seconden en probeer opnieuw.

---

## 📋 Stap 7: Test de Applicatie

1. **Refresh je browser** (Cmd/Ctrl + R)
2. De fout zou nu weg moeten zijn
3. Je kunt nu klanten toevoegen en data uploaden

---

## ❓ Problemen?

### "Table does not exist" blijft bestaan
- ✅ Controleer of je Stap 1-3 correct hebt uitgevoerd
- ✅ Wacht langer (soms duurt het 60 seconden)
- ✅ Run `pnpm db:verify` om te zien welke tabellen ontbreken
- ✅ Probeer de schema cache opnieuw te refreshen

### "Permission denied" of "RLS policy" errors
- ✅ Dit betekent dat de setup niet volledig is uitgevoerd
- ✅ Run het hele `setup.sql` script opnieuw
- ✅ Zorg dat alle policies zijn aangemaakt

### Andere errors?
- ✅ Check de Supabase dashboard voor error logs
- ✅ Zorg dat je ingelogd bent in Supabase
- ✅ Verifieer dat je `.env.local` correct is ingesteld

---

## 🎯 Quick Checklist

- [ ] SQL Editor geopend
- [ ] Setup script gekopieerd
- [ ] Script uitgevoerd in SQL Editor
- [ ] 30 seconden gewacht
- [ ] Schema cache gerefresht
- [ ] `pnpm db:verify` uitgevoerd - alle ✅
- [ ] Browser gerefresht
- [ ] Applicatie werkt!

---

**Na het voltooien van deze stappen zou alles moeten werken!** 🎉

