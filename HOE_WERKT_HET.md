# Hoe Werkt BTW Assist? - Complete Uitleg

## 🎯 Wat is BTW Assist?

**BTW Assist** is een boekhoudsysteem speciaal voor Nederlandse boekhouders. Het helpt je om:
- ✅ Klanten te beheren
- ✅ Grootboekrekeningen te organiseren
- ✅ Transacties (boekingsregels) te importeren
- ✅ **Automatisch BTW te berekenen** volgens Belastingdienst regels
- ✅ BTW aangiftes te genereren

---

## 📋 Complete Workflow - Stap voor Stap

### **STAP 1: Account Aanmaken** 👤

1. Ga naar `/register`
2. Vul in:
   - Je naam
   - E-mailadres
   - Wachtwoord
3. Klik "Account aanmaken"
4. Check je e-mail om te bevestigen
5. Log in op `/login`

**Resultaat:** Je hebt nu een account en kunt inloggen.

---

### **STAP 2: Eerste Klant Toevoegen** 🏢

1. Na inloggen zie je het **Dashboard** (`/dashboard`)
2. Klik op **"Nieuwe Klant"** (rechtsboven)
3. Vul het formulier in:
   - **Naam** (verplicht): Bijv. "Jan de Vries"
   - **Bedrijfsnaam** (optioneel): Bijv. "BV De Vries"
   - **BTW Nummer**: Bijv. "NL123456789B01"
   - **KVK Nummer**: Bijv. "12345678"
   - Adres, telefoon, e-mail (optioneel)
4. Klik **"Klant Toevoegen"**

**Resultaat:** Je eerste klant staat nu in het systeem!

---

### **STAP 3: Grootboek Schema Uploaden** 📊

**Wat is een grootboek?**
- Het grootboek is een overzicht van alle rekeningen (bijv. Rekening 8000 = Omzet, Rekening 4300 = Huur)
- Elke rekening heeft een nummer, naam, en type (Activa/Passiva/Kosten/Omzet)

**Hoe upload je het grootboek?**

1. Klik op je klant in het dashboard
2. Ga naar tab **"Grootboek"** of klik op **"Upload Data"**
3. Kies **"Grootboek Schema"**
4. Upload een Excel/CSV bestand met deze kolommen:
   ```
   grootboeknummer | omschrijving          | categorie   | btw_code
   8000            | Omzet hoog tarief     | Opbrengsten | OH
   4300            | Huur                  | Kosten      | VH
   1900            | Te vorderen BTW       | Kosten      | VH
   ```
5. Het systeem leest het bestand en importeert alle rekeningen

**Resultaat:** Alle grootboekrekeningen staan nu in het systeem!

---

### **STAP 4: Boekingsregels Uploaden** 💰

**Wat zijn boekingsregels?**
- Dit zijn alle transacties/boekingen van je klant
- Bijvoorbeeld: "Factuur ontvangen €1000 + BTW", "Betaling gedaan €500"

**Hoe upload je boekingsregels?**

1. Ga naar **"Upload Data"** bij je klant
2. Kies **"Boekingsregels"**
3. Upload een Excel/CSV bestand met deze kolommen:
   ```
   date       | grootboeknummer | omschrijving      | debet | credit | btw_code
   2026-01-15 | 1300            | Factuur 001      |       | 1000   | OH
   2026-01-15 | 1900            | BTW op factuur   | 210   |        | VH
   ```
4. Het systeem:
   - Leest alle transacties
   - Valideert of debet = credit (boekhoudkundige balans)
   - Controleert BTW codes
   - Importeert alles in de database

**Resultaat:** Alle transacties staan nu in het systeem!

---

### **STAP 5: BTW Berekenen** 🧮

**Wat gebeurt er hier?**
- Het systeem kijkt naar alle boekingsregels
- Het groepeert ze per BTW code (1a, 1b, 5b, etc.)
- Het berekent automatisch:
  - **Verschuldigd BTW** (op omzet/credit)
  - **Voorbelasting** (op kosten/debet)
  - **Te betalen BTW** = Verschuldigd - Voorbelasting

**Hoe gebruik je het?**

1. Ga naar tab **"BTW Overzicht"** bij je klant
2. Selecteer periode (maand/kwartaal/jaar)
3. Het systeem toont automatisch:
   - Alle rubrieken (1a, 1b, 5b, etc.)
   - Omzet per rubriek
   - BTW bedragen per rubriek
   - **Totaal te betalen aan Belastingdienst**

**Resultaat:** Je hebt een complete BTW aangifte klaar!

---

## 🔄 Praktisch Voorbeeld

### Scenario: Boekhouder voor "BV De Vries"

**Dag 1: Setup**
1. ✅ Account aangemaakt
2. ✅ Klant "BV De Vries" toegevoegd
3. ✅ Grootboek schema geüpload (50 rekeningen)

**Dag 2: Data Import**
1. ✅ Excel bestand met alle transacties van januari 2026 geüpload
2. ✅ 250 boekingsregels geïmporteerd
3. ✅ Systeem valideert automatisch: debet = credit ✓

**Dag 3: BTW Aangifte**
1. ✅ Ga naar BTW Overzicht
2. ✅ Selecteer "Januari 2026"
3. ✅ Systeem toont:
   - Rubriek 1a (21% omzet): €10.000 omzet, €2.100 BTW
   - Rubriek 5b (voorbelasting): €500 BTW
   - **Te betalen: €1.600**
4. ✅ Klaar voor indiening bij Belastingdienst!

---

## 🎯 Wat Maakt Dit Slim?

### 1. **Automatische BTW Berekening**
- Je hoeft niet handmatig te rekenen
- Het systeem volgt Nederlandse BTW regels
- Correcte rubriek-toewijzing (1a, 1b, 5b, etc.)

### 2. **Slimme Validatie**
- Controleert of debet = credit
- Waarschuwt bij ongebruikelijke BTW codes
- Suggesties voor BTW codes op basis van rekeningtype

### 3. **Excel/CSV Import**
- Upload direct vanuit je boekhoudsoftware
- Geen handmatige invoer nodig
- Ondersteunt verschillende kolomnamen (Nederlands/Engels)

### 4. **Duidelijke Overzichten**
- Alle rubrieken volgens Belastingdienst formaat
- Direct klaar voor BTW aangifte
- Export mogelijk (toekomstig)

---

## 📊 Belangrijke Concepten

### **Grootboek (Chart of Accounts)**
- Overzicht van alle rekeningen
- Elke rekening heeft een nummer (bijv. 8000, 4300)
- Types: Activa, Passiva, Kosten, Omzet

### **Boekingsregels (Journal Entries)**
- Individuele transacties
- Elke transactie heeft minstens 2 regels:
  - 1x Debet (linkerkant)
  - 1x Credit (rechterkant)
- Debet TOTAAL moet gelijk zijn aan Credit TOTAAL

### **BTW Codes**
- Code die aangeeft welk BTW tarief van toepassing is
- Bijv. "1a" = 21% omzet, "5b" = 21% voorbelasting
- Niet het percentage zelf, maar de Belastingdienst-rubriek

### **BTW Rubrieken**
- Belastingdienst gebruikt rubrieken (1a, 1b, 1c, 1d, 1e, 2a, 3a, 3b, 4a, 4b, 5a-5e)
- Elke rubriek heeft een specifieke betekenis
- Het systeem berekent automatisch per rubriek

---

## 🚀 Snel Starten (Quick Start)

**Voor een nieuwe klant:**

1. **Account** → Login
2. **Klant toevoegen** → Vul naam in (minimaal)
3. **Grootboek uploaden** → Excel met rekeningen
4. **Boekingsregels uploaden** → Excel met transacties
5. **BTW bekijken** → Automatische berekening!

**Tijd:** ~10 minuten per klant (eerste keer)

---

## ❓ Veelgestelde Vragen

**Q: Moet ik alles handmatig invoeren?**
A: Nee! Upload Excel/CSV bestanden vanuit je boekhoudsoftware.

**Q: Wat als ik geen grootboek heb?**
A: Je kunt ook direct boekingsregels uploaden. Het systeem werkt dan ook.

**Q: Kan ik meerdere klanten beheren?**
A: Ja! Elke klant heeft zijn eigen grootboek en boekingsregels.

**Q: Is dit officieel goedgekeurd door Belastingdienst?**
A: Het systeem volgt de officiële BTW regels, maar je moet altijd zelf controleren voordat je indient.

**Q: Kan ik data exporteren?**
A: Export functionaliteit komt in de toekomst. Nu kun je alles zien en gebruiken.

---

## 🎓 Tips voor Boekhouders

1. **Begin klein**: Voeg eerst 1 klant toe en test het
2. **Gebruik templates**: Download voorbeeld Excel bestanden
3. **Controleer altijd**: BTW berekeningen zijn automatisch, maar controleer altijd voordat je indient
4. **Organiseer per periode**: Upload per maand/kwartaal voor overzicht
5. **Gebruik notities**: Voeg notities toe bij klanten voor belangrijke info

---

**Klaar om te beginnen?** Log in en voeg je eerste klant toe! 🚀

