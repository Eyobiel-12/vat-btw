# Simpele Uitleg: Hoe Werkt Het?

## 🎯 In 3 Stappen

### **STAP 1: Upload Je Excel Bestand** 📤

**Waar?**
```
Dashboard → [Klik op klant] → "Upload Data" → Kies "Grootboek Schema"
```

**Wat?**
- Sleep je `rekenschema grootboek.xlsx` bestand
- OF klik "Bestand Selecteren"
- Systeem leest het bestand automatisch

**Resultaat:**
- ✅ Alle rekeningen staan nu in het systeem

---

### **STAP 2: Upload Transacties** 💰

**Waar?**
```
Dashboard → [Klik op klant] → "Upload Data" → Kies "Boekingsregels"
```

**Wat?**
- Upload Excel met alle transacties (facturen, betalingen, etc.)
- Zorg dat er BTW codes in staan (1a, 1b, 5b, etc.)

**Resultaat:**
- ✅ Alle transacties staan nu in het systeem

---

### **STAP 3: Zie BTW Berekening** 🧮

**Waar?**
```
Dashboard → [Klik op klant] → Tab "BTW Overzicht"
```

**Wat gebeurt er?**
1. Systeem leest alle transacties
2. Groepeert per BTW code (1a, 1b, 5b, etc.)
3. Berekent automatisch:
   - Verschuldigd BTW (op omzet)
   - Voorbelasting (op kosten)
   - **Te betalen = Verschuldigd - Voorbelasting**

**Resultaat:**
- ✅ Je ziet alle rubrieken (1a, 1b, 5b, etc.)
- ✅ Je ziet omzet en BTW bedragen
- ✅ Je ziet totaal te betalen

---

## 🔄 Hoe BTW Berekening Werkt

### **Voorbeeld:**

Je hebt deze transacties:
```
1. Factuur €1000 + 21% BTW (code: 1a)
   → Credit €1000, BTW €210

2. Inkopen €500 + 21% BTW (code: 5b)
   → Debet €500, BTW €105
```

**Systeem berekent automatisch:**

```
Rubriek 1a (Verschuldigd BTW):
  Omzet: €1000
  BTW: €210

Rubriek 5b (Voorbelasting):
  BTW: €105

──────────────────────────────
Totaal verschuldigd: €210
Voorbelasting: €105
──────────────────────────────
Te betalen: €105
```

**Je ziet dit op de BTW pagina!**

---

## 📍 Exact Waar Klikken

### **Voor Upload:**
1. **Dashboard** (`/dashboard`)
   - Zie alle klanten
   - Klik op een klant naam

2. **Client Detail** (`/dashboard/clients/[id]`)
   - Zie tabs: Overzicht, Grootboek, Boekingsregels, BTW
   - Klik op **"Upload Data"** card (in Overzicht tab)
   - OF klik op tab **"Grootboek"** → "Upload Grootboek"

3. **Upload Pagina** (`/dashboard/clients/[id]/upload`)
   - Kies: "Grootboek Schema" of "Boekingsregels"
   - Sleep bestand of klik "Bestand Selecteren"
   - Wacht op bevestiging

### **Voor BTW:**
1. **Dashboard** → Klik op klant
2. Tab **"BTW Overzicht"** OF **"BTW Aangifte"** card
3. Zie automatische berekening!

---

## ❓ Veelgestelde Vragen

**Q: Waar upload ik?**
A: Klik op klant → "Upload Data" → Kies type → Upload bestand

**Q: Hoe werkt BTW berekening?**
A: Systeem leest transacties → Groepeert per BTW code → Berekent automatisch

**Q: Moet ik handmatig rekenen?**
A: Nee! Systeem doet alles automatisch. Je upload alleen de data.

**Q: Wat als ik geen BTW codes heb?**
A: Upload boekingsregels MET BTW codes, anders kan systeem niet berekenen.

---

## 🎯 Quick Start

1. **Login** → Dashboard
2. **Klik "Nieuwe Klant"** → Vul naam in
3. **Klik op klant** → "Upload Data"
4. **Upload grootboek** (je Excel bestand)
5. **Upload boekingsregels** (transacties met BTW codes)
6. **Klik "BTW Overzicht"** → Zie berekening!

**Klaar!** ✅

