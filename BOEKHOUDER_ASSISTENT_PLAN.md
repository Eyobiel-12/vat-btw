# BTW Assist - Boekhouder Assistent Plan

## 🎯 Doelstelling

**Helpen de boekhouder slimmer en efficiënter te werken** door:
- Automatische BTW-berekeningen volgens Belastingdienst-regels
- Slimme validatie en waarschuwingen
- Intelligente suggesties op basis van grootboek rekeningen
- Duidelijke uitleg en hulpmiddelen

---

## ✅ Geïmplementeerde Slimme Features

### 1. **BTW Berekeningslogica** ✅
- **Locatie:** `lib/actions/btw.ts`
- **Verbeteringen:**
  - Correcte behandeling van debet/credit voor verschillende BTW-codes
  - Verschuldigd BTW op credit (omzet)
  - Voorbelasting op debet (kosten/inkopen)
  - Automatische filtering van regels zonder BTW-code
  - Correcte rubriek-toewijzing volgens Nederlandse regels

### 2. **BTW Helper Utilities** ✅
- **Locatie:** `lib/utils/btw-helpers.ts`
- **Features:**
  - `calculateBTWAmount()` - Automatische BTW-berekening met Nederlandse afronding
  - `calculateBaseFromTotal()` - Bereken basisbedrag uit totaalbedrag incl. BTW
  - `validateBoekingsregel()` - Volledige validatie volgens Nederlandse boekhoudregels
  - `suggestBTWCode()` - Intelligente BTW-code suggesties op basis van rekeningtype
  - `getBTWCodeInfo()` - Informatie over BTW-codes
  - `formatBTWCode()` - Geformatteerde weergave voor gebruikers

### 3. **Boekingsregel Validatie** ✅
- **Locatie:** `lib/actions/boekingsregels.ts`
- **Validatieregels:**
  - ✅ Exact één van debet/credit moet ingevuld zijn
  - ✅ BTW-code moet geldig zijn
  - ✅ BTW-bedrag moet overeenkomen met berekening
  - ✅ BTW-code moet passen bij rekeningtype
  - ✅ Voorbelasting op debet kant (kosten)
  - ✅ Verschuldigd BTW op credit kant (omzet)
  - ⚠️ Waarschuwingen voor ongebruikelijke combinaties

### 4. **Slimme UI Componenten** ✅

#### BTW Code Selector (`components/btw-code-select.tsx`)
- Dropdown met alle BTW-codes
- Tooltip met uitleg per code
- Automatische suggesties op basis van rekeningtype
- Duidelijke weergave met percentage en rubriek

#### Boekingsregel Validator (`components/boekingsregel-validator.tsx`)
- Real-time validatie feedback
- Foutmeldingen (rood)
- Waarschuwingen (geel)
- Succesmelding (groen)
- Automatische BTW-berekening weergave

### 5. **Boekhouder Helpers** ✅
- **Locatie:** `lib/utils/bookkeeper-helpers.ts`
- **Features:**
  - `getRubriekExplanation()` - Uitleg per BTW-rubriek
  - `getAccountTypeGuidance()` - Richtlijnen per rekeningtype
  - `formatPeriod()` - Nederlandse periodeweergave
  - `getBTWDeadline()` - Deadline berekening voor aangiftes
  - `ACCOUNTING_TERMS` - Woordenlijst met uitleg

---

## 📋 Nog Te Implementeren (Prioriteit)

### Hoge Prioriteit

1. **BTW Aangifte Pagina Verbeteren**
   - [ ] Vervang mock data met echte berekeningen
   - [ ] Real-time BTW berekening bij wijzigingen
   - [ ] Export naar Excel/PDF functionaliteit
   - [ ] Deadline waarschuwingen

2. **Boekingsregels Pagina Verbeteren**
   - [ ] Integreer `BoekingsregelValidator` component
   - [ ] Integreer `BTWCodeSelect` component
   - [ ] Auto-berekening BTW bij invoer
   - [ ] Bulk validatie voor geüploade regels

3. **CSV Upload Validatie**
   - [ ] Validatie tijdens upload
   - [ ] Foutrapportage per regel
   - [ ] Preview voor upload
   - [ ] Automatische BTW-code suggesties

### Gemiddelde Prioriteit

4. **Dashboard Verbeteringen**
   - [ ] Overzicht van openstaande BTW-aangiftes
   - [ ] Deadline waarschuwingen
   - [ ] Quick stats per klant
   - [ ] Recente activiteit

5. **Grootboek Schema Validatie**
   - [ ] Duplicate rekeningnummers check
   - [ ] BTW-code validatie per rekening
   - [ ] Suggesties voor ontbrekende rekeningen

6. **Rapportage Features**
   - [ ] BTW-overzicht per periode
   - [ ] Vergelijking tussen periodes
   - [ ] Export functionaliteit
   - [ ] Print-vriendelijke weergave

### Lage Prioriteit

7. **Extra Slimme Features**
   - [ ] Machine learning voor BTW-code suggesties
   - [ ] Automatische detectie van fouten
   - [ ] Patroonherkenning in boekingsregels
   - [ ] Integratie met boekhoudsoftware

---

## 🔍 Validatieregels (Geïmplementeerd)

### Boekingsregel Validatie

1. **Debet/Credit Regel**
   - ❌ Fout: Beide ingevuld
   - ❌ Fout: Geen van beide ingevuld
   - ✅ Correct: Exact één ingevuld

2. **BTW Code Validatie**
   - ❌ Fout: Ongeldige BTW-code
   - ⚠️ Waarschuwing: BTW-bedrag komt niet overeen met berekening

3. **Rekeningtype Matching**
   - ⚠️ Waarschuwing: Omzet rekening met voorbelasting code
   - ⚠️ Waarschuwing: Kosten rekening met verschuldigd BTW code

4. **Debet/Credit Richting**
   - ⚠️ Waarschuwing: Voorbelasting op credit kant
   - ⚠️ Waarschuwing: Verschuldigd BTW op debet kant

---

## 💡 Gebruik van Slimme Features

### Voor Boekhouders

1. **Bij Invoer Boekingsregel:**
   - Selecteer grootboek rekening → Systeem suggereert BTW-code
   - Vul bedrag in → BTW wordt automatisch berekend
   - Validator toont direct fouten/waarschuwingen

2. **Bij BTW Aangifte:**
   - Selecteer periode → Automatische berekening
   - Controleer rubrieken → Duidelijke uitleg per rubriek
   - Export → Klaar voor indiening

3. **Bij CSV Upload:**
   - Upload bestand → Validatie tijdens import
   - Foutrapport → Duidelijke meldingen per regel
   - Auto-correctie → Suggesties voor fouten

---

## 🎓 Nederlandse Boekhoudregels (Geïmplementeerd)

### BTW Codes
- **1a, 1b, 1c, 1d** → Verschuldigd BTW (op credit/omzet)
- **5b, 5b-laag** → Voorbelasting (op debet/kosten)
- **4a, 4b** → Verlegde BTW (inkopen uit EU/buitenland)
- **1e, 2a, 3a, 3b** → Geen BTW verschuldigd

### Rekeningtypes
- **Omzet** → Meestal credit, verschuldigd BTW
- **Kosten** → Meestal debet, voorbelasting
- **Activa** → Meestal debet, geen BTW
- **Passiva** → Meestal credit, geen BTW

---

## 📊 Status Overzicht

| Feature | Status | Prioriteit |
|---------|--------|-----------|
| BTW Berekeningslogica | ✅ | Hoog |
| BTW Helper Utilities | ✅ | Hoog |
| Boekingsregel Validatie | ✅ | Hoog |
| UI Componenten | ✅ | Hoog |
| BTW Aangifte (Real Data) | ⏳ | Hoog |
| CSV Upload Validatie | ⏳ | Hoog |
| Dashboard Verbeteringen | ⏳ | Gemiddeld |
| Rapportage | ⏳ | Gemiddeld |

---

## 🚀 Volgende Stappen

1. **Test alle validatie** - Zorg dat alle regels correct werken
2. **Integreer componenten** - Gebruik nieuwe componenten in bestaande pagina's
3. **Verbeter BTW pagina** - Vervang mock data met echte berekeningen
4. **Voeg export toe** - Excel/PDF export functionaliteit
5. **Test met echte data** - Gebruik echte boekhouddata voor testing

---

## 📝 Notities voor Ontwikkelaars

- Alle BTW-berekeningen gebruiken Nederlandse afronding (2 decimalen)
- Validatie gebeurt zowel client-side als server-side
- Fouten blokkeren opslaan, waarschuwingen niet
- Alle teksten zijn in het Nederlands (boekhoudterminologie)
- Componenten zijn herbruikbaar en type-safe

---

**Laatste Update:** $(date)
**Status:** ✅ Core features geïmplementeerd, klaar voor integratie

