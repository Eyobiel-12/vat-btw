# Kwartaal Toewijzing & Verwerk Functionaliteit op Transactie Overzicht

## ✅ Geïmplementeerde Features

### 1. **BTW Verwerk Quick Action Card** ✅

**Nieuwe Component:**
- ✅ `BTWVerwerkQuickAction` - Quick action card op transactie overzicht pagina
- ✅ **Kwartaal Selector** - Selecteer jaar en kwartaal (Q1-Q4)
- ✅ **Verwerk Knop** - Direct verwerken van BTW aangifte
- ✅ **Bekijk Aangifte Knop** - Navigeer naar BTW pagina

**Features:**
- ✅ **Jaar Selector:**
  - Huidige jaar en vorige 2 jaren
  - Dropdown selectie
- ✅ **Kwartaal Selector:**
  - Q1, Q2, Q3, Q4
  - Toont maanden range (bijv. "januari - maart")
- ✅ **Verwerk Functionaliteit:**
  - Bereken BTW voor geselecteerd kwartaal
  - Toon berekening in dialoog
  - Sla aangifte op als concept
  - Markeer als definitief (verwerkt)
  - Navigeer naar BTW pagina

---

### 2. **Kwartaal Toewijzing** ✅

**Automatische Toewijzing:**
- ✅ **Transacties hebben periode:** Jaar en maand worden automatisch toegewezen
- ✅ **Kwartaal Berekening:** BTW wordt berekend voor alle maanden in kwartaal
- ✅ **Aangifte Opslaan:** Aangifte wordt opgeslagen met kwartaal info

**Kwartaal Informatie:**
- ✅ **In Quick Action Card:**
  - Selecteer jaar
  - Selecteer kwartaal (Q1-Q4)
  - Zie maanden range
- ✅ **In Verwerk Dialoog:**
  - Volledige kwartaal informatie
  - Verschuldigde BTW
  - Voorbelasting
  - Saldo (te betalen/ontvangen)

---

## 📋 Gebruik

### Vanuit Transactie Overzicht:

1. **Upload Transacties:**
   - Upload Excel of factuur
   - Transacties worden geïmporteerd
   - Periode wordt automatisch toegewezen

2. **Selecteer Kwartaal:**
   - Ga naar "BTW Aangifte Verwerken" card
   - Selecteer jaar (bijv. 2026)
   - Selecteer kwartaal (Q1, Q2, Q3, of Q4)

3. **Verwerk Aangifte:**
   - Klik **"Verwerk Q1 2026"** knop
   - BTW wordt automatisch berekend
   - Bekijk berekening in dialoog:
     - Verschuldigde BTW
     - Voorbelasting
     - Saldo
   - Klik **"Verwerk Aangifte"** om te bevestigen

4. **Aangifte is Verwerkt:**
   - Status wordt "Definitief"
   - Automatische navigatie naar BTW pagina
   - Aangifte is klaar voor indiening

---

## 🎯 Workflow

### Stap 1: Upload Transacties
- Upload Excel of factuur
- Transacties worden geïmporteerd
- Periode (jaar + maand) wordt automatisch toegewezen

### Stap 2: Selecteer Kwartaal
- Open "BTW Aangifte Verwerken" card
- Selecteer jaar en kwartaal
- Klik "Verwerk QX YYYY" knop

### Stap 3: Controleer & Verwerk
- Bekijk BTW berekening in dialoog
- Controleer bedragen
- Klik "Verwerk Aangifte" om te bevestigen

### Stap 4: Navigeer naar BTW Pagina
- Automatische navigatie naar BTW pagina
- Aangifte is verwerkt en definitief
- Klaar voor indiening

---

## 🔧 Technische Details

### Quick Action Component:
- **Client Component** met React state
- **Server Actions** voor BTW berekening en opslaan
- **Router Navigation** naar BTW pagina
- **Toast Notifications** voor feedback

### Kwartaal Berekening:
```typescript
// Q1 = maanden 1, 2, 3
// Q2 = maanden 4, 5, 6
// Q3 = maanden 7, 8, 9
// Q4 = maanden 10, 11, 12

calculateBTW(clientId, jaar, "kwartaal", quarter)
```

### Verwerk Flow:
```typescript
// 1. Bereken BTW voor kwartaal
// 2. Toon berekening in dialoog
// 3. Sla aangifte op als concept
// 4. Markeer als definitief
// 5. Navigeer naar BTW pagina
```

---

## ✅ Status

- ✅ BTW Verwerk Quick Action card toegevoegd
- ✅ Kwartaal selector (jaar + Q1-Q4)
- ✅ Verwerk functionaliteit
- ✅ Berekening dialoog met details
- ✅ Automatische navigatie naar BTW pagina
- ✅ Toast notifications
- ✅ Volledig Nederlandse interface
- ✅ Kwartaal toewijzing aan aangiftes
- ✅ Status updates (concept → definitief)

---

## 📝 Tips

### Voor Gebruikers:
1. **Upload Eerst:**
   - Upload alle transacties voor het kwartaal
   - Zorg dat BTW codes zijn toegewezen

2. **Selecteer Kwartaal:**
   - Gebruik jaar en kwartaal selectors
   - Klik "Verwerk" knop

3. **Controleer:**
   - Bekijk berekening in dialoog
   - Controleer bedragen voordat u verwerkt

4. **Verwerk:**
   - Klik "Verwerk Aangifte" in dialoog
   - Aangifte wordt definitief
   - Automatische navigatie naar BTW pagina

5. **Indien:**
   - Ga naar BTW pagina
   - Klik "Markeer als Ingediend"
   - Aangifte is ingediend

