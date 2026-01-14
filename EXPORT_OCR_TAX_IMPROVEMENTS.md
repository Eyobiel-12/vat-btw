# Export, OCR & Dutch Tax System Improvements

## ✅ Geïmplementeerde Features

### 1. Excel Export Functionaliteit ✅

**Probleem:** Export naar Excel werkte niet.

**Oplossing:**
- ✅ Nieuwe `excel-exporter.ts` utility met export functies
- ✅ `exportBoekingsregelsToExcel()` - Export boekingsregels met totalen
- ✅ `exportGrootboekToExcel()` - Export grootboek schema met samenvatting
- ✅ Client-side export buttons (`ExportBoekingsregelsButton`, `ExportGrootboekButton`)
- ✅ Automatische bestandsnamen met datum
- ✅ Professionele Excel formatting (kolombreedtes, frozen headers)

**Gebruik:**
- Klik op "Exporteren" knop op boekingsregels of grootboek pagina
- Excel bestand wordt automatisch gedownload
- Bevat alle data met totalen en samenvattingen

---

### 2. OCR Factuur Verwerking ✅

**Probleem:** Facturen konden niet geüpload worden, OCR was niet geïmplementeerd.

**Oplossing:**
- ✅ `tesseract.js` geïnstalleerd voor OCR
- ✅ `invoice-ocr.ts` utility met complete OCR functionaliteit
- ✅ Nederlandse taal ondersteuning (`nld`)
- ✅ Slimme data extractie:
  - Factuurnummer (meerdere patronen)
  - Datum (Nederlandse formaten: DD-MM-YYYY, YYYY-MM-DD)
  - Totaalbedrag (incl. BTW)
  - BTW bedrag
  - BTW percentage (automatisch berekend)
  - Leverancier naam
  - Regelitems (optioneel)

**OCR Features:**
- Extractie van tekst uit afbeeldingen (.png, .jpg, .jpeg)
- Patroonherkenning voor Nederlandse facturen
- Automatische conversie naar boekingsregels
- Foutafhandeling en validatie

**Gebruik:**
1. Selecteer "Facturen/Receipts" upload type
2. Upload een factuur afbeelding
3. Systeem extraheert automatisch alle gegevens
4. Boekingsregels worden automatisch aangemaakt

---

### 3. Nederlandse Belastingstelsel Verstand ✅

**Probleem:** Systeem begreep Nederlandse BTW regels niet goed.

**Oplossing:**
- ✅ Slimme BTW-code toewijzing op basis van percentage:
  - 21% → `5b` (Voorbelasting hoog)
  - 9% → `5b-laag` (Voorbelasting laag)
  - Automatische afronding naar standaard tarieven
- ✅ Correcte boekingsregels volgens Nederlandse regels:
  - Facturen zijn kosten (debet)
  - Voorbelasting op debet kant
  - Standaard rekeningen: 4300 (kosten), 1900 (BTW), 2000 (bank)
- ✅ Automatische BTW bedrag berekening
- ✅ Validatie volgens Nederlandse boekhoudregels

**Smart Features:**
- Herkent Nederlandse BTW tarieven (21% en 9%)
- Begrijpt debet/credit structuur
- Automatische toewijzing van juiste BTW codes
- Correcte rubriek mapping voor Belastingdienst

---

## 📁 Nieuwe Bestanden

1. **`lib/utils/excel-exporter.ts`**
   - Export functies voor boekingsregels en grootboek
   - Excel formatting en totalen berekening

2. **`lib/utils/invoice-ocr.ts`**
   - OCR tekst extractie
   - Slimme factuur data extractie
   - Conversie naar boekingsregels
   - Nederlandse BTW logica

3. **`components/export-boekingsregels-button.tsx`**
   - Client component voor boekingsregels export

4. **`components/export-grootboek-button.tsx`**
   - Client component voor grootboek export

---

## 🔧 Aangepaste Bestanden

1. **`app/dashboard/clients/[id]/boekingsregels/page.tsx`**
   - Export button toegevoegd

2. **`app/dashboard/clients/[id]/grootboek/page.tsx`**
   - Export button toegevoegd

3. **`app/dashboard/clients/[id]/upload/page.tsx`**
   - Facturen upload geactiveerd
   - OCR integratie toegevoegd
   - UI updates voor facturen upload

---

## 🎯 Workflow

### Excel Export:
1. Ga naar boekingsregels of grootboek pagina
2. Klik op "Exporteren" knop
3. Excel bestand wordt gedownload met alle data

### Factuur OCR:
1. Ga naar upload pagina
2. Selecteer "Facturen/Receipts"
3. Upload factuur afbeelding (.png, .jpg, .jpeg)
4. Systeem extraheert automatisch:
   - Factuurnummer
   - Datum
   - Totaalbedrag
   - BTW bedrag en percentage
   - Leverancier
5. Boekingsregels worden automatisch aangemaakt
6. BTW codes worden automatisch toegewezen (5b of 5b-laag)
7. Redirect naar boekingsregels pagina

---

## 🧠 Slimme Nederlandse BTW Logica

Het systeem begrijpt nu:

1. **Facturen zijn kosten:**
   - Altijd op debet kant
   - Standaard rekening: 4300 (of aangepast)

2. **Voorbelasting:**
   - Altijd op debet kant
   - Rekening: 1900 (Te vorderen BTW)
   - Code: 5b (21%) of 5b-laag (9%)

3. **Credit kant:**
   - Meestal bank (2000) of crediteuren
   - Totaalbedrag incl. BTW

4. **BTW Percentage Detectie:**
   - 20-22% → 21% (hoog tarief)
   - 8-10% → 9% (laag tarief)
   - Automatische afronding naar standaard tarieven

---

## 📝 Notities

- PDF ondersteuning komt later (nu alleen afbeeldingen)
- OCR werkt het beste met duidelijke, goed belichte facturen
- Nederlandse taal OCR is geoptimaliseerd voor Nederlandse facturen
- BTW berekeningen volgen Nederlandse afrondingsregels

---

## ✅ Status

- ✅ Excel export werkt
- ✅ OCR factuur verwerking werkt
- ✅ Nederlandse BTW logica geïmplementeerd
- ✅ Automatische boekingsregels aanmaak
- ✅ Slimme BTW code toewijzing
- ✅ Correcte debet/credit structuur

