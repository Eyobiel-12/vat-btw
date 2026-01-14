# Hoe Voeg Je Data Toe? - Simpele Uitleg

## 🎯 Kort Antwoord

**Boekhouder voegt data toe via Excel upload:**
1. Exporteer transacties uit boekhoudpakket
2. Upload Excel bestand
3. Systeem berekent automatisch BTW
4. Markeer aangifte als klaar

---

## 📤 STAP 1: Exporteer Data Uit Je Boekhoudpakket

**Wat heb je nodig?**
- Transacties (boekingsregels) van de klant
- In Excel of CSV formaat

**Hoe exporteer je?**
- **Exact Online**: Rapportage → Exporteer naar Excel
- **AFAS**: Financieel → Exporteer journaalposten
- **SnelStart**: Exporteer grootboekmutaties
- **Andere software**: Zoek naar "Export" of "Exporteer transacties"

**Wat moet er in zitten?**
```
Datum | Rekening | Omschrijving | Debet | Credit | BTW Code
```

---

## 📥 STAP 2: Upload in BTW Assist

**Waar?**
```
Dashboard → [Klik op klant] → "Upload Data" → "Boekingsregels"
```

**Wat te doen:**
1. Klik op "Boekingsregels" card
2. Sleep je Excel bestand in het upload gebied
3. OF klik "Bestand Selecteren"
4. Wacht tot upload klaar is

**Resultaat:**
- ✅ "X boekingsregels geïmporteerd"
- ✅ Automatische redirect naar boekingsregels pagina

---

## 🧮 STAP 3: BTW Wordt Automatisch Berekenend

**Wat gebeurt er?**
1. Systeem leest alle transacties
2. Groepeert per BTW code
3. Berekent automatisch:
   - Verschuldigd BTW (op omzet)
   - Voorbelasting (op kosten)
   - Totaal te betalen

**Waar zie je dit?**
```
Dashboard → [Klik op klant] → "BTW Aangifte"
```

**Je ziet:**
- Alle rubrieken (1a, 1b, 5b, etc.)
- Omzet en BTW bedragen
- Totaal te betalen

---

## ✅ STAP 4: Markeer Aangifte als Klaar

**Waar?**
```
BTW Aangifte pagina → "Aangifte Beheer" card
```

**Wat te doen:**
1. Controleer alle bedragen
2. Klik "Markeer als Klaar"
3. Status wordt "Klaar" (blauw)
4. Na indiening: Klik "Markeer als Ingediend"
5. Status wordt "Ingediend" (groen)

---

## 📋 Excel Format Voorbeeld

**Voor boekingsregels upload:**

| date       | grootboeknummer | omschrijving     | debet | credit | btw_code |
|------------|-----------------|------------------|-------|--------|----------|
| 01-01-2026 | 8000            | Factuur 001      |       | 1000   | 1a       |
| 01-01-2026 | 1900            | BTW factuur 001  |       | 210    | 1a       |
| 15-01-2026 | 4300            | Huur januari     | 1000  |        | 5b       |
| 15-01-2026 | 1900            | BTW huur         | 210   |        | 5b       |

**Belangrijk:**
- ✅ Datum formaat: DD-MM-YYYY
- ✅ BTW code is VERPLICHT (1a, 1b, 5b, etc.)
- ✅ Debet OF Credit (niet beide)
- ✅ Eerste rij = kolomkoppen

---

## 🎯 Complete Workflow in 4 Stappen

```
1. Exporteer transacties uit boekhoudpakket
   ↓
2. Upload Excel via "Upload Data" → "Boekingsregels"
   ↓
3. Bekijk BTW berekening op "BTW Aangifte" pagina
   ↓
4. Markeer als "Klaar" en daarna "Ingediend"
```

**Klaar!** ✅

---

## ❓ Problemen?

**Q: Geen BTW codes in mijn export?**
A: Voeg ze handmatig toe in Excel. Zonder BTW codes werkt het niet.

**Q: Verkeerde kolomnamen?**
A: Zorg dat eerste rij kolomkoppen bevat: date, grootboeknummer, omschrijving, debet, credit, btw_code

**Q: Upload mislukt?**
A: Check of:
- Excel bestand niet leeg is
- Kolommen kloppen
- Datum formaat correct is (DD-MM-YYYY)

**Q: Geen BTW berekening?**
A: Check of:
- Boekingsregels geüpload zijn
- BTW codes aanwezig zijn
- Transacties in de juiste periode zitten

---

**Meer hulp nodig?** Zie `COMPLETE_WORKFLOW.md` voor uitgebreide uitleg.

