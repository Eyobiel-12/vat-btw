# Waar Klik Je? - Visuele Gids

## 🎯 Snel Antwoord: Waar Upload Je?

### **Voor Grootboek Upload:**
1. Dashboard → Klik op je **klant**
2. Klik op tab **"Grootboek"** OF klik op **"Upload Data"** card
3. Kies **"Grootboek Schema"**
4. Sleep je Excel bestand (bijv. `rekenschema grootboek.xlsx`) in het upload gebied
5. Klaar! ✅

### **Voor Boekingsregels Upload:**
1. Dashboard → Klik op je **klant**
2. Klik op **"Upload Data"** card OF tab **"Boekingsregels"**
3. Kies **"Boekingsregels"**
4. Sleep je Excel/CSV bestand met transacties
5. Klaar! ✅

### **Voor BTW Berekening:**
1. Dashboard → Klik op je **klant**
2. Klik op tab **"BTW Overzicht"** OF klik op **"BTW Aangifte"** card
3. Systeem toont automatisch de BTW berekening! ✅

---

## 📍 Exacte Locaties in de App

### **STAP 1: Naar Upload Pagina**

**Optie A: Via Client Detail Page**
```
Dashboard → [Klik op klant] → Tab "Grootboek" → "Upload Grootboek" button
OF
Dashboard → [Klik op klant] → "Upload Data" card → Kies type
```

**Optie B: Directe Link**
```
/dashboard/clients/[ID]/upload
```

### **STAP 2: Upload Je Excel Bestand**

Op de upload pagina zie je:
1. **Twee kaarten** - Kies "Grootboek Schema" of "Boekingsregels"
2. **Upload gebied** - Sleep je bestand hier of klik om te selecteren
3. **Status** - Zie of het gelukt is

### **STAP 3: BTW Bekijken**

**Na upload:**
```
Dashboard → [Klik op klant] → Tab "BTW Overzicht"
OF
Dashboard → [Klik op klant] → "BTW Aangifte" card
```

---

## 🔄 Complete Flow Met Screenshots (Text)

### **Scenario: Upload "rekenschema grootboek.xlsx"**

**Stap 1: Dashboard**
```
Je ziet: [Klant Naam] [Beheren] [BTW Aangifte]
Klik op: [Beheren] of op de klant naam
```

**Stap 2: Client Detail Page**
```
Je ziet tabs: [Overzicht] [Grootboek] [Boekingsregels] [BTW Overzicht]

Optie A: Klik op tab "Grootboek"
  → Zie: "Bekijk Grootboek" en "Upload Grootboek" buttons
  → Klik: "Upload Grootboek"

Optie B: Klik op "Upload Data" card (in Overzicht tab)
  → Ga naar upload pagina
  → Kies "Grootboek Schema"
```

**Stap 3: Upload Pagina**
```
Je ziet:
- [Grootboek Schema] card ← KLIK HIER
- [Boekingsregels] card

Na klik op "Grootboek Schema":
- Upload gebied verschijnt
- Sleep "rekenschema grootboek.xlsx" hier
- OF klik "Bestand Selecteren"
```

**Stap 4: Na Upload**
```
Systeem toont:
✅ "X grootboekrekeningen zijn succesvol geïmporteerd"
→ Automatische redirect naar grootboek pagina
```

---

## 🧮 Hoe Werkt BTW Berekening?

### **Wat Gebeurt Er Automatisch:**

1. **Je upload boekingsregels** met BTW codes
   ```
   Voorbeeld:
   - Factuur €1000 + BTW (code: 1a) → Credit €1000, BTW €210
   - Inkopen €500 + BTW (code: 5b) → Debet €500, BTW €105
   ```

2. **Je klikt op "BTW Aangifte"**

3. **Systeem doet automatisch:**
   ```
   ✅ Leest alle boekingsregels met BTW codes
   ✅ Groepeert per BTW code (1a, 1b, 5b, etc.)
   ✅ Berekent per rubriek:
      - Rubriek 1a: Omzet €1000, BTW €210 (verschuldigd)
      - Rubriek 5b: Voorbelasting €105 (terug te vorderen)
   ✅ Totaal: €210 - €105 = €105 te betalen
   ```

4. **Je ziet het resultaat:**
   ```
   Rubriek 1a: €1000 omzet, €210 BTW
   Rubriek 5b: €105 voorbelasting
   ──────────────────────────────
   Te betalen: €105
   ```

### **Waar Zie Je Dit?**

```
Dashboard → [Klant] → Tab "BTW Overzicht"
```

Je ziet:
- Alle rubrieken (1a, 1b, 1c, 1d, 1e, 2a, 3a, 3b, 4a, 4b, 5a-5e)
- Omzet per rubriek
- BTW bedragen
- **Totaal te betalen** (groot getal onderaan)

---

## 📊 Wat Doet Elke Pagina?

### **Dashboard (`/dashboard`)**
- Overzicht van alle klanten
- Klik "Nieuwe Klant" om toe te voegen
- Klik op klant om details te zien

### **Client Detail (`/dashboard/clients/[id]`)**
- Overzicht van één klant
- Tabs: Overzicht, Grootboek, Boekingsregels, BTW
- Quick action cards met links

### **Upload (`/dashboard/clients/[id]/upload`)**
- **WAAR JE BESTANDEN UPLOAD**
- Kies type: Grootboek of Boekingsregels
- Sleep bestand of klik om te selecteren
- Zie status (succes/fout)

### **Grootboek (`/dashboard/clients/[id]/grootboek`)**
- Overzicht van alle rekeningen
- Zie welke rekeningen er zijn
- Zie BTW codes per rekening

### **Boekingsregels (`/dashboard/clients/[id]/boekingsregels`)**
- Overzicht van alle transacties
- Zie debet/credit bedragen
- Zie BTW codes per transactie

### **BTW (`/dashboard/clients/[id]/btw`)**
- **WAAR JE BTW ZIET**
- Automatische berekening
- Alle rubrieken volgens Belastingdienst
- Totaal te betalen

---

## 🎯 Praktisch Voorbeeld Met Je Excel Bestand

Je hebt: `rekenschema grootboek.xlsx`

**Wat te doen:**

1. **Login** → Dashboard

2. **Klik op je klant** (of maak er een aan)

3. **Klik op "Upload Data"** card OF tab **"Grootboek"**

4. **Kies "Grootboek Schema"**

5. **Sleep `rekenschema grootboek.xlsx`** in het upload gebied

6. **Wacht** → Systeem leest het bestand

7. **Zie resultaat:**
   - ✅ "50 grootboekrekeningen geïmporteerd"
   - OF ❌ Foutmelding (controleer kolommen)

8. **Na succes:**
   - Automatisch naar grootboek pagina
   - Zie alle rekeningen in een tabel

9. **Voor BTW:**
   - Upload eerst boekingsregels (transacties)
   - Ga naar "BTW Overzicht"
   - Zie automatische berekening!

---

## ❓ Veelgestelde Vragen

**Q: Waar upload ik mijn Excel bestand?**
A: `/dashboard/clients/[ID]/upload` - Klik op je klant → "Upload Data" → Kies type → Upload

**Q: Hoe zie ik de BTW berekening?**
A: `/dashboard/clients/[ID]/btw` - Klik op je klant → Tab "BTW Overzicht"

**Q: Moet ik eerst grootboek uploaden?**
A: Nee, maar het helpt. Je kunt ook direct boekingsregels uploaden.

**Q: Wat als ik geen boekingsregels heb?**
A: Dan zie je €0 in BTW overzicht. Upload eerst boekingsregels met BTW codes.

**Q: Hoe werkt de BTW berekening?**
A: Systeem leest alle boekingsregels, groepeert per BTW code, en berekent automatisch per rubriek.

---

## 🚀 Quick Start Checklist

- [ ] Account aangemaakt en ingelogd
- [ ] Eerste klant toegevoegd
- [ ] Grootboek geüpload (optioneel)
- [ ] Boekingsregels geüpload (met BTW codes!)
- [ ] BTW overzicht bekeken
- [ ] Klaar voor BTW aangifte! ✅

---

**Probleem?** Check of:
1. Je Excel bestand de juiste kolommen heeft
2. BTW codes aanwezig zijn in boekingsregels
3. Je op de juiste pagina bent (upload of BTW)

