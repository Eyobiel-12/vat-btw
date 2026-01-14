# Kwartaal Systeem & Login Verbeteringen

## ✅ Geïmplementeerde Features

### 1. **Slim Kwartaal Systeem (Q1-Q4)** ✅

**Nieuwe Componenten:**
- ✅ `PeriodSelector` - Slimme periode selector met Q1-Q4 ondersteuning
- ✅ `QuarterlyOverview` - Overzicht van alle kwartalen in één oogopslag
- ✅ URL-based navigation - Periode wordt opgeslagen in URL params

**Features:**
- ✅ **Kwartaal Selectie:**
  - Q1 (januari-maart)
  - Q2 (april-juni)
  - Q3 (juli-september)
  - Q4 (oktober-december)
- ✅ **Automatische BTW Berekenen per Kwartaal:**
  - Aggregeert alle maanden in kwartaal
  - Correcte filtering van boekingsregels
  - Automatische rubriek berekening
- ✅ **Kwartaal Overzicht:**
  - Ziet alle 4 kwartalen tegelijk
  - Status per kwartaal (concept/klaar/ingediend)
  - Omzet en BTW per kwartaal
  - Quick navigation naar elk kwartaal
  - Jaar totaal weergave

**Gebruik:**
1. Ga naar BTW Aangifte pagina
2. Selecteer een kwartaal (Q1, Q2, Q3, Q4) in de periode selector
3. Zie automatisch het kwartaal overzicht bovenaan
4. BTW wordt automatisch berekend voor het hele kwartaal
5. Klik op "Bekijk Details" om naar specifiek kwartaal te gaan

---

### 2. **Verbeterde Login Pagina** ✅

**Verbeteringen:**
- ✅ **Modern Design:**
  - Gradient achtergrond
  - Verbeterde logo weergave met icon
  - Betere spacing en typography
- ✅ **Betere UX:**
  - Password visibility toggle (eye icon)
  - Email en password state management
  - Disabled button als velden leeg zijn
  - Toast notifications voor feedback
  - Betere error display met Alert component
- ✅ **Accessibility:**
  - Proper form handling
  - Auto-complete attributes
  - ARIA labels
  - Keyboard navigation

**Features:**
- ✅ Show/hide password functionaliteit
- ✅ Real-time form validation
- ✅ Success/error toast notifications
- ✅ Betere error messages
- ✅ Loading states met spinner

---

## 📋 Kwartaal Systeem Details

### Period Selector:
- **Format:** `2026-Q1`, `2026-Q2`, etc.
- **Ondersteunt:**
  - Kwartalen (Q1-Q4)
  - Maanden (januari-december)
  - Jaren (jaar totaal)
- **URL Params:**
  - `?jaar=2026&periodeType=kwartaal&periode=1`
  - Automatische URL updates bij selectie
  - Bookmarkable URLs

### Kwartaal Berekenen:
```typescript
// Q1 = maanden 1, 2, 3
// Q2 = maanden 4, 5, 6
// Q3 = maanden 7, 8, 9
// Q4 = maanden 10, 11, 12

const startMonth = (quarter - 1) * 3 + 1
const endMonth = quarter * 3
query.gte("periode", startMonth).lte("periode", endMonth)
```

### Kwartaal Overzicht:
- **4 Cards:** Eén voor elk kwartaal
- **Per Card:**
  - Kwartaal nummer (Q1-Q4)
  - Maanden range (jan-mrt, apr-jun, etc.)
  - Status badge (concept/klaar/ingediend)
  - Omzet totaal
  - BTW totaal
  - "Bekijk Details" button
- **Jaar Samenvatting:**
  - Totaal omzet voor jaar
  - Totaal BTW voor jaar

---

## 🎯 Workflow

### Kwartaal BTW Aangifte:
1. **Selecteer Kwartaal:**
   - Ga naar BTW Aangifte pagina
   - Kies Q1, Q2, Q3, of Q4 in periode selector
   
2. **Bekijk Overzicht:**
   - Zie alle 4 kwartalen in één oogopslag
   - Status van elk kwartaal
   - Omzet en BTW per kwartaal
   
3. **Bekijk Details:**
   - Klik op "Bekijk Details" voor specifiek kwartaal
   - Zie volledige BTW berekening
   - Alle rubrieken per kwartaal
   
4. **Sla Op / Dien In:**
   - Sla aangifte op als concept
   - Markeer als klaar
   - Markeer als ingediend

---

## 🔧 Technische Details

### Period Selector Component:
- Client-side component
- URL state management
- Automatic period calculation
- Smart defaults (current quarter/month)

### Quarterly Overview Component:
- Fetches all aangiftes for year
- Groups by quarter
- Shows status and totals
- Quick navigation links

### BTW Calculation:
- Works with `periodeType: "kwartaal"`
- Filters boekingsregels by month range
- Aggregates all data for quarter
- Correct rubriek calculations

---

## ✅ Status

- ✅ Kwartaal systeem volledig werkend
- ✅ Period selector met Q1-Q4
- ✅ Kwartaal overzicht component
- ✅ URL-based navigation
- ✅ Login pagina verbeterd
- ✅ Password visibility toggle
- ✅ Toast notifications
- ✅ Betere error handling
- ✅ Modern design

---

## 📝 Tips

### Voor Gebruikers:
1. **Kwartaal Selectie:**
   - Standaard wordt huidige kwartaal getoond
   - Selecteer ander kwartaal via dropdown
   - URL wordt automatisch bijgewerkt

2. **Kwartaal Overzicht:**
   - Alleen zichtbaar bij kwartaal selectie
   - Toont status van alle kwartalen
   - Klik op card om naar details te gaan

3. **Login:**
   - Gebruik eye icon om wachtwoord te tonen/verbergen
   - Form wordt gevalideerd voordat submit
   - Toast notifications voor feedback

