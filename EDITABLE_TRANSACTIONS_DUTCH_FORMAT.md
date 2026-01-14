# Interactieve & Bewerkbare Transacties met Nederlandse Formattering

## ✅ Geïmplementeerde Features

### 1. **Interactieve & Bewerkbare Transacties** ✅

**Nieuwe Component:**
- ✅ `EditableBoekingsregelsTable` - Volledig bewerkbare transactietabel
- ✅ Inline editing - Bewerk direct in de tabel
- ✅ Edit/Delete knoppen per rij
- ✅ Bevestigingsdialoog voor verwijderen

**Features:**
- ✅ **Bewerken:**
  - Klik op potlood icoon om te bewerken
  - Bewerk alle velden inline (datum, grootboek, omschrijving, debet, credit, BTW-code, BTW bedrag)
  - Check mark om op te slaan, X om te annuleren
  - Automatische validatie
- ✅ **Verwijderen:**
  - Klik op prullenbak icoon
  - Bevestigingsdialoog voor veiligheid
  - Automatische refresh na verwijderen
- ✅ **Toast Notifications:**
  - Success meldingen bij opslaan/verwijderen
  - Error meldingen bij fouten

---

### 2. **Volledige Nederlandse Formattering** ✅

**Datum Formattering:**
- ✅ **Weergave:** DD-MM-YYYY (bijv. 21-05-2025)
- ✅ **Input:** DD-MM-YYYY formaat
- ✅ Automatische conversie naar ISO voor database

**Bedrag Formattering:**
- ✅ **Weergave:** € 4.104,93 (punt voor duizendtallen, komma voor decimalen)
- ✅ **Input:** Ondersteunt Nederlandse notatie (4.104,93)
- ✅ Automatische parsing van Nederlandse getallen
- ✅ **Debet & Credit:** Beide in Nederlandse format
- ✅ **BTW Bedrag:** Nederlandse format

**Functies:**
- ✅ `formatDutchNumber()` - Formatteert getallen naar Nederlandse notatie
- ✅ `parseDutchNumber()` - Parseert Nederlandse getallen naar JavaScript number
- ✅ `formatDutchDate()` - Formatteert datums naar DD-MM-YYYY
- ✅ `parseDutchDate()` - Parseert DD-MM-YYYY naar ISO datum

---

## 📋 Gebruik

### Transactie Bewerken:
1. **Klik op potlood icoon** bij de transactie
2. **Bewerk velden:**
   - Datum: DD-MM-YYYY (bijv. 21-05-2025)
   - Grootboek: Account nummer
   - Omschrijving: Tekst
   - Debet: € 4.104,93 (Nederlandse format)
   - Credit: € 4.104,93 (Nederlandse format)
   - BTW-code: Selecteer uit dropdown
   - BTW Bedrag: € 712,43 (Nederlandse format)
3. **Klik op check mark** om op te slaan
4. **Of klik op X** om te annuleren

### Transactie Verwijderen:
1. **Klik op prullenbak icoon** bij de transactie
2. **Bevestig verwijdering** in dialoog
3. Transactie wordt verwijderd

---

## 🎯 Nederlandse Formattering Details

### Datum:
- **Input:** `21-05-2025`
- **Weergave:** `21-05-2025`
- **Database:** `2025-05-21` (ISO format)

### Bedragen:
- **Input:** `4.104,93` of `4104,93` of `4104.93`
- **Weergave:** `€ 4.104,93`
- **Database:** `4104.93` (decimal format)

### Voorbeelden:
- **Debet:** `€ 712,43`
- **Credit:** `€ 4.104,93`
- **BTW Bedrag:** `€ 712,43`
- **Totaal:** `€ 4.817,36`

---

## 🔧 Technische Details

### EditableBoekingsregelsTable Component:
- **Client-side component** met React state
- **Inline editing** met Input componenten
- **Automatische validatie** bij opslaan
- **Toast notifications** voor feedback
- **Router refresh** na wijzigingen

### Nederlandse Number Parsing:
```typescript
// Ondersteunt:
"4.104,93" → 4104.93
"4104,93" → 4104.93
"4104.93" → 4104.93 (als decimal)
"4.104" → 4104 (als duizendtallen)
```

### Nederlandse Date Parsing:
```typescript
// Input: "21-05-2025"
// Output: "2025-05-21" (ISO)
```

---

## ✅ Status

- ✅ Interactieve transactietabel
- ✅ Inline editing functionaliteit
- ✅ Delete functionaliteit met bevestiging
- ✅ Volledige Nederlandse formattering
- ✅ Datum: DD-MM-YYYY
- ✅ Bedragen: € 4.104,93 format
- ✅ Debet & Credit in Nederlandse format
- ✅ BTW bedragen in Nederlandse format
- ✅ Toast notifications
- ✅ Automatische validatie
- ✅ User-friendly interface

---

## 📝 Tips

### Voor Gebruikers:
1. **Bewerken:**
   - Gebruik Nederlandse datum format (DD-MM-YYYY)
   - Gebruik Nederlandse bedrag format (4.104,93)
   - Debet en Credit kunnen niet beide > 0 zijn
   - BTW bedrag wordt automatisch berekend als BTW-code is geselecteerd

2. **Verwijderen:**
   - Wees voorzichtig - verwijderen kan niet ongedaan worden gemaakt
   - Bevestig altijd in de dialoog

3. **Formattering:**
   - Alle bedragen worden automatisch geformatteerd naar Nederlandse notatie
   - Datums worden automatisch geformatteerd naar DD-MM-YYYY
   - De € symbool wordt automatisch toegevoegd

