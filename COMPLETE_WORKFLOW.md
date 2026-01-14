# Complete Workflow: Hoe Werkt Het Voor Boekhouders?

## 🎯 Overzicht: Van Data Tot BTW Aangifte

```
1. Klant Toevoegen
   ↓
2. Grootboek Uploaden (optioneel, maar aanbevolen)
   ↓
3. Boekingsregels Uploaden (TRANSACTIES - BELANGRIJK!)
   ↓
4. BTW Berekening Bekijken
   ↓
5. BTW Aangifte Opslaan & Markeren als Klaar
```

---

## 📋 STAP 1: Klant Toevoegen

**Waar:** Dashboard → "Nieuwe Klant" button

**Wat te doen:**
1. Klik "Nieuwe Klant"
2. Vul minimaal de naam in (verplicht)
3. Optioneel: BTW nummer, KVK nummer, adres, etc.
4. Klik "Klant Toevoegen"

**Resultaat:** ✅ Klant staat nu in het systeem

---

## 📊 STAP 2: Grootboek Uploaden (Optioneel)

**Waar:** Dashboard → [Klik op klant] → "Upload Data" → Kies "Grootboek Schema"

**Wat is grootboek?**
- Een lijst van alle rekeningen (bijv. Rekening 8000 = Omzet, Rekening 4300 = Huur)
- Elke rekening heeft een nummer, naam, en type

**Waarom uploaden?**
- Helpt bij het koppelen van boekingsregels aan rekeningen
- Zorgt voor betere BTW-code toewijzing

**Excel Format:**
```
grootboeknummer | omschrijving          | categorie   | btw_code
8000            | Omzet hoog tarief     | Opbrengsten | 1a
4300            | Huur                  | Kosten      | 5b
1900            | Te vorderen BTW       | Kosten      | 5b
```

**Wat te doen:**
1. Maak Excel bestand met bovenstaande kolommen
2. Upload via "Upload Data" → "Grootboek Schema"
3. Wacht op bevestiging

**Resultaat:** ✅ Alle rekeningen staan in het systeem

---

## 💰 STAP 3: Boekingsregels Uploaden (BELANGRIJK!)

**Dit is de belangrijkste stap!** Zonder boekingsregels kan er geen BTW berekening worden gemaakt.

**Waar:** Dashboard → [Klik op klant] → "Upload Data" → Kies "Boekingsregels"

**Wat zijn boekingsregels?**
- Alle transacties van de klant (facturen, betalingen, inkopen, etc.)
- Elke transactie heeft: datum, rekening, bedrag, BTW code

**Excel Format (VERPLICHT):**
```
date        | grootboeknummer | omschrijving        | debet  | credit | btw_code
01-01-2026  | 8000            | Factuur 001        |        | 1000   | 1a
01-01-2026  | 1900            | BTW factuur 001    |        | 210    | 1a
15-01-2026  | 4300            | Huur januari       | 1000   |        | 5b
15-01-2026  | 1900            | BTW huur           | 210    |        | 5b
```

**Belangrijke Kolommen:**
- **date**: Datum in formaat DD-MM-YYYY (bijv. 01-01-2026)
- **grootboeknummer**: Rekeningnummer (bijv. 8000, 4300)
- **omschrijving**: Beschrijving van de transactie
- **debet**: Bedrag (laat leeg als het credit is)
- **credit**: Bedrag (laat leeg als het debet is)
- **btw_code**: BTW code (1a, 1b, 5b, etc.) - **VERPLICHT voor BTW berekening!**

**BTW Codes:**
- **1a**: Omzet hoog tarief (21% BTW verschuldigd)
- **1b**: Omzet laag tarief (9% BTW verschuldigd)
- **1e**: Vrijgestelde omzet (0% BTW)
- **5b**: Voorbelasting (BTW terug te vorderen op kosten/inkopen)
- **0**: Geen BTW

**Wat te doen:**
1. Exporteer transacties uit je boekhoudpakket (Exact, AFAS, etc.)
2. Zorg dat de kolommen kloppen (zie boven)
3. Zorg dat BTW codes aanwezig zijn!
4. Upload via "Upload Data" → "Boekingsregels"
5. Wacht op bevestiging

**Resultaat:** ✅ Alle transacties staan in het systeem

---

## 🧮 STAP 4: BTW Berekening Bekijken

**Waar:** Dashboard → [Klik op klant] → Tab "BTW Overzicht" OF "BTW Aangifte" button

**Wat gebeurt er automatisch?**
1. Systeem leest alle boekingsregels met BTW codes
2. Groepeert per BTW code (1a, 1b, 5b, etc.)
3. Berekent automatisch per rubriek:
   - Rubriek 1a: Omzet €1000, BTW €210 (verschuldigd)
   - Rubriek 5b: Voorbelasting €210 (terug te vorderen)
4. Toont totaal te betalen: €210 - €210 = €0

**Wat zie je?**
- Alle rubrieken (1a, 1b, 1c, 1d, 1e, 2a, 3a, 3b, 4a, 4b, 5a-5e)
- Omzet per rubriek
- BTW bedragen
- **Totaal te betalen** (groot getal onderaan)

**Controleer:**
- ✅ Zijn alle bedragen correct?
- ✅ Klopt de berekening?
- ✅ Zijn er geen fouten?

**Resultaat:** ✅ Je ziet de complete BTW berekening

---

## ✅ STAP 5: BTW Aangifte Opslaan & Markeren als Klaar

**Waar:** BTW Overzicht pagina → "Aangifte Beheer" card (bovenaan)

**Wat te doen:**

### 5a. Opslaan als Concept (Optioneel)
1. Klik "Opslaan als Concept"
2. Aangifte wordt opgeslagen als draft
3. Je kunt later terugkomen en aanpassen

### 5b. Markeer als Klaar
1. Controleer alle bedragen nogmaals
2. Klik "Markeer als Klaar"
3. Aangifte wordt definitief
4. Status verandert naar "Klaar" (blauwe badge)

### 5c. Markeer als Ingediend
1. Na indiening bij Belastingdienst
2. Klik "Markeer als Ingediend"
3. Bevestig in de dialog
4. Status verandert naar "Ingediend" (groene badge)

**Resultaat:** ✅ BTW aangifte is klaar en geregistreerd!

---

## 📝 Praktisch Voorbeeld

### Scenario: Klant "Jan de Vries" - Januari 2026

**STAP 1: Klant Toevoegen**
```
Naam: Jan de Vries
BTW Nummer: NL123456789B01
✅ Opgeslagen
```

**STAP 2: Grootboek Uploaden** (optioneel)
```
Excel met:
- Rekening 8000: Omzet hoog tarief (btw_code: 1a)
- Rekening 4300: Huur (btw_code: 5b)
- Rekening 1900: Te vorderen BTW (btw_code: 5b)
✅ Geüpload
```

**STAP 3: Boekingsregels Uploaden** (BELANGRIJK!)
```
Excel met transacties:
- 01-01-2026: Factuur €1000 + BTW €210 (credit 8000, credit 1900, btw_code: 1a)
- 15-01-2026: Huur €1000 + BTW €210 (debet 4300, debet 1900, btw_code: 5b)
✅ Geüpload
```

**STAP 4: BTW Berekening Bekijken**
```
Systeem toont:
- Rubriek 1a: Omzet €1000, BTW €210 (verschuldigd)
- Rubriek 5b: Voorbelasting €210 (terug te vorderen)
- Totaal te betalen: €0
✅ Berekening correct
```

**STAP 5: Aangifte Opslaan**
```
1. Klik "Markeer als Klaar"
   → Status: Klaar (blauw)
2. Na indiening: Klik "Markeer als Ingediend"
   → Status: Ingediend (groen)
✅ Aangifte geregistreerd!
```

---

## ❓ Veelgestelde Vragen

**Q: Waar haal ik de boekingsregels vandaan?**
A: Exporteer uit je boekhoudpakket (Exact, AFAS, SnelStart, etc.) als Excel/CSV.

**Q: Moet ik grootboek uploaden?**
A: Nee, maar het helpt. Je kunt ook direct boekingsregels uploaden.

**Q: Wat als ik geen BTW codes heb in mijn export?**
A: Voeg ze handmatig toe in Excel voordat je upload. Zonder BTW codes kan het systeem geen BTW berekenen.

**Q: Kan ik boekingsregels handmatig toevoegen?**
A: Momenteel alleen via Excel upload. Handmatig toevoegen komt later.

**Q: Hoe vaak moet ik uploaden?**
A: Elke maand/kwartaal, afhankelijk van je aangifte periode.

**Q: Kan ik eerdere aangiftes bekijken?**
A: Ja, selecteer een andere periode in de periode selector (binnenkort functioneel).

---

## 🎯 Quick Start Checklist

- [ ] Klant toegevoegd
- [ ] Grootboek geüpload (optioneel)
- [ ] Boekingsregels geüpload (met BTW codes!)
- [ ] BTW berekening gecontroleerd
- [ ] Aangifte gemarkeerd als klaar
- [ ] Aangifte gemarkeerd als ingediend (na indiening)

---

## 🚨 Belangrijk!

1. **BTW Codes zijn VERPLICHT** - Zonder BTW codes kan het systeem geen BTW berekenen
2. **Upload boekingsregels regelmatig** - Minimaal elke maand/kwartaal
3. **Controleer altijd** - Controleer de berekening voordat je markeert als klaar
4. **Exporteer uit boekhoudpakket** - Gebruik de export functie van je boekhoudsoftware

---

**Klaar! Nu weet je precies hoe het werkt!** ✅

