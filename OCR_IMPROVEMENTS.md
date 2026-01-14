# OCR Verbeteringen - Nederlandse Facturen

## ✅ Verbeteringen Geïmplementeerd

### 1. **Verbeterde Factuurnummer Extractie** ✅
- **Nieuwe patronen:**
  - `FY2025-05-006` (jaar-maand-nummer format)
  - `FACT-2026-001` (FACT prefix)
  - `INV-2026-001` (INV prefix)
  - Ondersteunt underscores, slashes, en streepjes
- **Standalone detectie:** Zoekt ook naar factuurnummers zonder label

### 2. **Verbeterde Datum Extractie** ✅
- **Ondersteunt nu:**
  - `10-5-2025` (enkele cijfers voor maand/dag)
  - `10-05-2025` (DD-MM-YYYY)
  - `2025-05-10` (YYYY-MM-DD)
- **Slimme validatie:**
  - Controleert of datum logisch is (2000-2030)
  - Voorkomt verkeerde interpretatie
  - Prioriteit voor datums bij "factuurdatum" label

### 3. **Verbeterde Totaalbedrag Extractie** ✅
- **Nieuwe patronen:**
  - `€4104.93` (euro symbool voor bedrag)
  - `Totaal: €4104.93`
  - `Totaal incl. BTW: €4104.93`
- **Slimme filtering:**
  - Slaat "Subtotaal" over
  - Neemt grootste bedrag als fallback
  - Beter omgaan met duizendtallen (punt als scheiding)

### 4. **Verbeterde BTW Extractie** ✅
- **Nieuwe patronen:**
  - `BTW (21%): €712.43` (met percentage)
  - `BTW: €712.43`
  - `€712.43 BTW` (euro symbool voor bedrag)
- **Slimme filtering:**
  - Slaat BTW-nummers over (KVK, BTW-nr)
  - Berekent BTW uit percentage als nodig
  - Valideert dat BTW < Totaal

### 5. **Verbeterde Leverancier Extractie** ✅
- **Nieuwe patronen:**
  - `YOHANNES HOVENIERSBEDRIJF B.V.`
  - `COMPANY NAME N.V.`
  - `BEDRIJF V.O.F.`
- **Slimme detectie:**
  - Zoekt in eerste 10 regels
  - Herkent Nederlandse bedrijfsvormen (B.V., N.V., V.O.F.)
  - Filtert false positives (FACTUUR, INVOICE labels)

### 6. **Verbeterde OCR Instellingen** ✅
- **Tesseract configuratie:**
  - Nederlandse taal (`nld`)
  - Betere page segmentation
  - Character whitelist voor betere nauwkeurigheid
- **Progress logging** (development mode)
- **Betere error handling**

### 7. **Verbeterde User Feedback** ✅
- **Duidelijke waarschuwingen:**
  - Toont wat wel/niet gevonden is
  - ✅ voor succesvolle extractie
  - ⚠️ voor ontbrekende data
- **Betere error messages:**
  - Specifieke foutmeldingen
  - Tips voor gebruikers
  - Debug informatie in development

---

## 📋 Extractie Patronen

### Factuurnummer:
```
FY2025-05-006
FACT-2026-001
INV-2026-001
Factuurnummer: FY2025-05-006
```

### Datum:
```
10-5-2025 → 2025-05-10
10-05-2025 → 2025-05-10
2025-05-10 → 2025-05-10
Factuurdatum: 10-5-2025
```

### Totaalbedrag:
```
€4104.93
Totaal: €4.104,93
Totaal incl. BTW: €4104.93
```

### BTW:
```
BTW (21%): €712.43
BTW: €712.43
€712.43 BTW
```

### Leverancier:
```
YOHANNES HOVENIERSBEDRIJF B.V.
COMPANY NAME N.V.
BEDRIJF V.O.F.
```

---

## 🎯 Test Scenario

Voor de factuur in de afbeelding:
- **Factuurnummer:** `FY2025-05-006` ✅
- **Datum:** `10-5-2025` → `2025-05-10` ✅
- **Totaal:** `€4104.93` ✅
- **BTW:** `€712.43` (21%) ✅
- **Leverancier:** `YOHANNES HOVENIERSBEDRIJF B.V.` ✅

---

## 🔧 Technische Details

### OCR Instellingen:
```javascript
{
  language: 'nld', // Dutch
  pageSegMode: 1,  // Automatic with OSD
  charWhitelist: '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz€.,-/:() '
}
```

### Extractie Volgorde:
1. Factuurnummer (met labels, dan standalone)
2. Datum (bij labels, dan algemeen)
3. Totaalbedrag (met labels, dan grootste bedrag)
4. BTW (met percentage, dan zonder)
5. Leverancier (bovenaan, dan eerste regels)

---

## 📝 Tips voor Gebruikers

1. **Afbeelding Kwaliteit:**
   - Gebruik hoge resolutie (minimaal 300 DPI)
   - Zorg voor goede belichting
   - Zorg dat tekst scherp is

2. **Factuur Formaat:**
   - Nederlandse facturen werken het beste
   - Standaard factuur layout wordt goed herkend
   - Complexe layouts kunnen problemen geven

3. **Als Extractie Faalt:**
   - Controleer console logs (development)
   - Probeer een scherpere afbeelding
   - Gebruik Excel upload als alternatief

---

## ✅ Status

- ✅ Verbeterde patronen geïmplementeerd
- ✅ Betere error handling
- ✅ User feedback verbeterd
- ✅ Debug logging toegevoegd
- ✅ Nederlandse facturen optimaal ondersteund

