# Verwerk Aangifte & Kwartaal Toewijzing

## ✅ Geïmplementeerde Features

### 1. **"Verwerk Aangifte" Knop** ✅

**Nieuwe Functionaliteit:**
- ✅ **"Verwerk Aangifte" knop** - Prominente knop om aangifte te verwerken
- ✅ **Bevestigingsdialoog** - Veilige bevestiging voordat verwerking
- ✅ **Aangifte Details** - Toont periode, type en saldo in dialoog
- ✅ **Automatische Status Update** - Markeert aangifte als "definitief" na verwerking

**Workflow:**
1. **Selecteer Kwartaal/Periode** via Period Selector
2. **Bekijk BTW Berekening** automatisch gegenereerd
3. **Klik "Verwerk Aangifte"** knop
4. **Bevestig in dialoog** met aangifte details
5. **Aangifte wordt verwerkt** en gemarkeerd als definitief
6. **Klaar voor indiening** bij Belastingdienst

**Features:**
- ✅ **Kwartaal Info in Dialoog:**
  - Toont Q1, Q2, Q3, of Q4
  - Toont maanden range (bijv. "januari - maart")
  - Toont jaar
  - Toont saldo bedrag
- ✅ **Status Updates:**
  - Concept → Definitief (na verwerking)
  - Definitief → Ingediend (na indiening)
- ✅ **Toast Notifications:**
  - Success melding na verwerking
  - Error meldingen bij fouten

---

### 2. **Kwartaal Toewijzing aan Aangiftes** ✅

**Automatische Kwartaal Toewijzing:**
- ✅ **Period Selector** - Selecteer Q1, Q2, Q3, of Q4
- ✅ **Automatische Berekenen** - BTW wordt automatisch berekend voor geselecteerd kwartaal
- ✅ **Aangifte Opslaan** - Aangifte wordt opgeslagen met kwartaal info
- ✅ **Kwartaal Overzicht** - Zie alle kwartalen in één oogopslag

**Kwartaal Informatie:**
- ✅ **In Aangifte Beheer Card:**
  - Toont kwartaal nummer (Q1, Q2, Q3, Q4)
  - Toont jaar
  - Toont maanden range
- ✅ **In Verwerk Dialoog:**
  - Volledige kwartaal informatie
  - Periode type (Kwartaal)
  - Saldo bedrag

**Database:**
- ✅ **periode_type:** "kwartaal"
- ✅ **periode:** 1, 2, 3, of 4
- ✅ **jaar:** Bijv. 2026
- ✅ **Unique Constraint:** Eén aangifte per kwartaal per jaar

---

## 📋 Gebruik

### Kwartaal Aangifte Verwerken:

1. **Selecteer Kwartaal:**
   - Ga naar BTW Aangifte pagina
   - Selecteer Q1, Q2, Q3, of Q4 in Period Selector
   - BTW wordt automatisch berekend voor het kwartaal

2. **Bekijk Berekening:**
   - Controleer alle rubrieken
   - Controleer omzet en BTW bedragen
   - Controleer saldo

3. **Verwerk Aangifte:**
   - Klik op **"Verwerk Aangifte"** knop (blauwe knop met play icon)
   - Bekijk aangifte details in dialoog:
     - Periode: Q1 2026
     - Type: Kwartaal aangifte
     - Saldo: € X.XXX,XX
   - Klik **"Verwerk Aangifte"** in dialoog om te bevestigen

4. **Aangifte is Verwerkt:**
   - Status wordt "Definitief"
   - Aangifte is klaar voor indiening
   - Klik **"Markeer als Ingediend"** om in te dienen

---

## 🎯 Workflow

### Stap 1: Selecteer Kwartaal
- Gebruik Period Selector
- Selecteer Q1, Q2, Q3, of Q4
- BTW wordt automatisch berekend

### Stap 2: Controleer Berekening
- Bekijk alle rubrieken
- Controleer bedragen
- Controleer saldo

### Stap 3: Verwerk Aangifte
- Klik "Verwerk Aangifte" knop
- Bevestig in dialoog
- Aangifte wordt gemarkeerd als definitief

### Stap 4: Dien In (optioneel)
- Klik "Markeer als Ingediend"
- Bevestig indiening
- Aangifte is ingediend

---

## 🔧 Technische Details

### Verwerk Functionaliteit:
```typescript
// 1. Sla aangifte op (als nog niet opgeslagen)
// 2. Update status naar "definitief"
// 3. Toon success melding
// 4. Refresh pagina
```

### Kwartaal Toewijzing:
```typescript
// periode_type: "kwartaal"
// periode: 1, 2, 3, of 4
// jaar: 2026
// Unique: (client_id, periode_type, periode, jaar)
```

### Status Flow:
```
Concept → Definitief (na verwerking) → Ingediend (na indiening)
```

---

## ✅ Status

- ✅ "Verwerk Aangifte" knop toegevoegd
- ✅ Bevestigingsdialoog met kwartaal info
- ✅ Automatische kwartaal toewijzing
- ✅ Kwartaal info in Aangifte Beheer card
- ✅ Status updates (concept → definitief → ingediend)
- ✅ Toast notifications
- ✅ Volledig Nederlandse interface
- ✅ Kwartaal overzicht component
- ✅ Period selector met Q1-Q4

---

## 📝 Tips

### Voor Gebruikers:
1. **Kwartaal Selectie:**
   - Gebruik Period Selector om kwartaal te selecteren
   - BTW wordt automatisch berekend voor het hele kwartaal

2. **Verwerken:**
   - Controleer altijd de berekening voordat u verwerkt
   - Gebruik "Verwerk Aangifte" om aangifte definitief te maken
   - Na verwerking kan aangifte worden ingediend

3. **Indiening:**
   - "Markeer als Ingediend" markeert alleen in systeem
   - U moet aangifte nog steeds daadwerkelijk indienen bij Belastingdienst

4. **Kwartaal Overzicht:**
   - Bekijk alle kwartalen in één oogopslag
   - Zie status van elk kwartaal
   - Klik op kwartaal om details te bekijken

