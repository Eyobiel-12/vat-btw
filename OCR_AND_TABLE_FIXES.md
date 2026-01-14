# OCR en Transactie Review Fixes

## ✅ Opgeloste Problemen

### 1. **OCR Bedrag Parsing Probleem** ✅

**Probleem:**
- OCR extraheerde `€4.104,93` maar parseerde het als `410493` (verkeerde decimalen)
- Nederlandse format (punt voor duizendtallen, komma voor decimalen) werd niet herkend
- Resultaat: Verkeerde bedragen in boekingsregels

**Oplossing:**
- ✅ Nieuwe `parseAmount()` functie die beide formaten herkent:
  - **Nederlands:** `4.104,93` → `4104.93`
  - **Engels:** `4104.93` → `4104.93`
- ✅ Slimme detectie:
  - Als komma + punt: laatste komma is decimaal
  - Als alleen komma: 2 cijfers na komma = decimaal
  - Als alleen punt: 2 cijfers na punt = decimaal
- ✅ Werkt nu correct voor:
  - `€4.104,93` → `4104.93` ✅
  - `€712,43` → `712.43` ✅
  - `€3.392,50` → `3392.50` ✅

### 2. **BTW Boekingsregel Probleem** ✅

**Probleem:**
- BTW entry had geen `btw_bedrag` ingevuld
- BTW code werd niet altijd correct toegewezen
- BTW entry werd soms op verkeerde account gezet

**Oplossing:**
- ✅ BTW entry krijgt nu altijd `btw_bedrag` ingevuld
- ✅ BTW code wordt automatisch bepaald als ontbreekt:
  - 21% → `5b` (voorbelasting hoog)
  - 9% → `5b-laag` (voorbelasting laag)
- ✅ BTW entry gaat altijd naar account `1900` (Te vorderen BTW)
- ✅ Correcte debet/credit structuur

### 3. **Transactie Review Probleem** ✅

**Probleem:**
- Tabel was niet scrollbaar
- Veel transacties konden niet bekeken worden
- Geen max-height op tabel container

**Oplossing:**
- ✅ Tabel container heeft nu `max-h-[600px]` en `overflow-y-auto`
- ✅ Scrollbare tabel voor lange lijsten
- ✅ Alle transacties zijn nu te bekijken

---

## 📋 Correcte Boekingsregels Structuur

Voor een factuur van €4.104,93 (incl. 21% BTW):

### Regel 1: Kosten (Debet)
- **Account:** 4300 (of aangepast)
- **Debet:** €3.392,50
- **Credit:** €0,00
- **BTW Code:** -
- **Omschrijving:** Factuur FY2025-05-006 - YOHANNES HOVENIERSBEDRIJF B.V.

### Regel 2: BTW Voorbelasting (Debet)
- **Account:** 1900 (Te vorderen BTW)
- **Debet:** €712,43
- **Credit:** €0,00
- **BTW Code:** 5b
- **BTW Bedrag:** €712,43
- **Omschrijving:** BTW voorbelasting op factuur FY2025-05-006

### Regel 3: Te Betalen (Credit)
- **Account:** 2000 (Bank)
- **Debet:** €0,00
- **Credit:** €4.104,93
- **BTW Code:** -
- **Omschrijving:** Te betalen factuur FY2025-05-006

---

## 🎯 Test Scenario

**Factuur:**
- Factuurnummer: `FY2025-05-006`
- Datum: `10-5-2025`
- Totaal: `€4.104,93`
- BTW: `€712,43` (21%)
- Leverancier: `YOHANNES HOVENIERSBEDRIJF B.V.`

**Verwachte Resultaten:**
- ✅ Totaal: €4.104,93 (correct geparsed)
- ✅ BTW: €712,43 (correct geparsed)
- ✅ Basis: €3.392,50 (correct berekend)
- ✅ BTW Code: 5b (correct toegewezen)
- ✅ BTW Bedrag: €712,43 (ingevuld)
- ✅ Account 1900: gebruikt voor BTW
- ✅ Tabel: scrollbaar en alle regels zichtbaar

---

## 🔧 Technische Details

### Amount Parsing Logic:
```typescript
// Dutch: 4.104,93 → 4104.93
if (hasComma && hasPeriod) {
  // Last comma is decimal separator
  return parseFloat(`${beforeComma}.${afterComma}`)
}

// Dutch: 4104,93 → 4104.93
if (hasComma && afterComma.length === 2) {
  return parseFloat(cleaned.replace(',', '.'))
}

// English: 4104.93 → 4104.93
if (hasPeriod && afterPeriod.length === 2) {
  return parseFloat(cleaned)
}
```

### BTW Entry Creation:
```typescript
{
  account_number: "1900", // Te vorderen BTW
  debet: vatAmount,
  credit: 0,
  btw_code: btwCode, // 5b or 5b-laag
  btw_bedrag: vatAmount, // Always set
  factuurnummer: invoiceNumber,
}
```

---

## ✅ Status

- ✅ Bedrag parsing werkt correct
- ✅ BTW boekingsregels correct
- ✅ BTW bedrag altijd ingevuld
- ✅ Tabel scrollbaar
- ✅ Alle transacties te bekijken

