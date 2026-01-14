# Waarom Toont BTW Berekening €0,00?

## 🔍 Probleem

De BTW berekening toont €0,00 omdat **transacties geen BTW codes hebben toegewezen**.

## ✅ Oplossing Geïmplementeerd

### 1. **Slimme Detectie** ✅
- ✅ **Telt alle transacties** in het kwartaal
- ✅ **Telt transacties met BTW codes**
- ✅ **Toont waarschuwing** als er transacties zijn maar geen BTW codes

### 2. **Duidelijke Waarschuwingen** ✅
- ✅ **In Dialoog:**
  - Toont totaal aantal transacties
  - Toont aantal transacties met BTW codes
  - Waarschuwing als geen BTW codes zijn toegewezen
- ✅ **Toast Notificatie:**
  - Waarschuwing bij berekenen
  - Duidelijke uitleg wat te doen

### 3. **Hulp & Acties** ✅
- ✅ **Link naar Transacties:**
  - Directe link om BTW codes toe te wijzen
  - Duidelijke instructies
- ✅ **Disabled Verwerk Knop:**
  - Kan niet verwerken zonder BTW codes
  - Voorkomt fouten

---

## 📋 Hoe Op Te Lossen

### Stap 1: Ga naar Transactie Overzicht
- Klik op "Ga naar Transacties om BTW Codes Toe te Wijzen" knop
- Of ga naar Boekingsregels pagina

### Stap 2: Wijs BTW Codes Toe
- Klik op **potlood icoon** bij elke transactie
- Selecteer BTW-code:
  - **"5b"** - Voorbelasting (21%) voor kosten/inkopen
  - **"5b-laag"** - Voorbelasting (9%) voor laag tarief
  - **"1a"** - Omzet hoog tarief (21%)
  - **"1b"** - Omzet laag tarief (9%)
  - **"geen"** - Geen BTW
- Klik op **check mark** om op te slaan

### Stap 3: Verwerk Opnieuw
- Ga terug naar "BTW Aangifte Verwerken" card
- Klik "Verwerk QX YYYY" knop
- BTW wordt nu correct berekend

---

## 🎯 BTW Codes Uitleg

### Voor Kosten/Inkopen (Debet):
- **5b** - Voorbelasting 21% (meeste inkopen)
- **5b-laag** - Voorbelasting 9% (bijv. voedsel, medicijnen)

### Voor Omzet (Credit):
- **1a** - Omzet hoog tarief 21% (meeste diensten/producten)
- **1b** - Omzet laag tarief 9% (bijv. voedsel, boeken)
- **1e** - Vrijgestelde omzet 0%

### Geen BTW:
- **geen** - Geen BTW van toepassing

---

## ✅ Status

- ✅ Detectie van transacties zonder BTW codes
- ✅ Duidelijke waarschuwingen in dialoog
- ✅ Toast notificaties
- ✅ Link naar transacties om BTW codes toe te wijzen
- ✅ Disabled verwerk knop zonder BTW codes
- ✅ Informatie over totaal transacties vs. met BTW codes

---

## 📝 Tips

### Voor Gebruikers:
1. **Altijd BTW Codes Toewijzen:**
   - Elke transactie moet een BTW code hebben
   - Zonder BTW codes kan BTW niet worden berekend

2. **Snelle Toewijzing:**
   - Gebruik inline editing in transactie tabel
   - Selecteer BTW code uit dropdown
   - Sla op met check mark

3. **Controleer Voor Verwerking:**
   - Bekijk altijd aantal transacties met BTW codes
   - Zorg dat alle relevante transacties een BTW code hebben
   - Verwerk pas als alles correct is

