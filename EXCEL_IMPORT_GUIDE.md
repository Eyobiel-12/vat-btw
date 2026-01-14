# Excel Import Guide - Grootboek Schema

## 📋 Ondersteunde Bestandsformaten

- ✅ Excel (.xlsx, .xls)
- ✅ CSV (.csv)

## 📊 Grootboek Schema Format

### Vereiste Kolommen

Uw Excel bestand moet minimaal deze kolommen bevatten:

| Kolomnaam | Alternatieven | Beschrijving | Verplicht |
|-----------|---------------|--------------|-----------|
| `grootboeknummer` | rekeningnummer, nummer, account_number | Rekeningnummer (bijv. 1000, 8000) | ✅ Ja |
| `omschrijving` | naam, account_name | Naam van de rekening | ✅ Ja |
| `categorie` | type, account_type | Activa, Passiva, Kosten, Opbrengsten | ✅ Ja |
| `btw_code` | btwcode, btw | BTW-code (1a, 1b, 5b, etc.) | ❌ Nee |
| `rubriek` | - | Belastingdienst rubriek | ❌ Nee |
| `beschrijving` | description, opmerking, notities | Extra beschrijving | ❌ Nee |

### Ondersteunde Waarden

#### Categorie/Type
- `Activa` of `activa`
- `Passiva` of `passiva`
- `Kosten` of `kosten`
- `Opbrengsten` of `omzet` of `inkomsten`

#### BTW Codes (Oude en Nieuwe)

Het systeem accepteert zowel oude als nieuwe BTW-codes:

| Oude Code | Nieuwe Code | Beschrijving |
|-----------|-------------|--------------|
| OH | 1a | Omzet hoog tarief (21%) |
| OL | 1b | Omzet laag tarief (9%) |
| OV | 1e | Omzet vrijgesteld |
| VH | 5b | Voorbelasting hoog (21%) |
| VL | 5b-laag | Voorbelasting laag (9%) |
| 0 | geen | Geen BTW |

### Voorbeeld Excel Bestand

```
grootboeknummer | omschrijving          | categorie   | btw_code
----------------|----------------------|-------------|----------
1000            | Gebouwen             | Activa      |
1300            | Debiteuren           | Activa      |
1900            | Te vorderen BTW      | Kosten      | VH
2600            | Te betalen BTW        | Kosten      | OH
4000            | Krediteuren           | Passiva     |
8000            | Omzet hoog tarief     | Opbrengsten | OH
8010            | Omzet laag tarief     | Opbrengsten | OL
```

## 🔄 Automatische Conversies

Het systeem doet automatisch:

1. **Kolomnaam normalisatie** - Herkent Nederlandse en Engelse kolomnamen
2. **BTW-code conversie** - Converteert oude codes (OH, OL, VH, VL) naar nieuwe (1a, 1b, 5b)
3. **Type normalisatie** - Converteert verschillende schrijfwijzen naar standaard types
4. **Validatie** - Controleert of alle verplichte velden aanwezig zijn

## ⚠️ Veelvoorkomende Fouten

### Fout: "Grootboeknummer ontbreekt"
- **Oorzaak:** Kolom met rekeningnummer heeft andere naam
- **Oplossing:** Gebruik één van: `grootboeknummer`, `rekeningnummer`, `nummer`, `account_number`

### Fout: "Categorie ontbreekt"
- **Oorzaak:** Kolom met type heeft andere naam of waarde
- **Oplossing:** Gebruik: `Activa`, `Passiva`, `Kosten`, of `Opbrengsten`

### Waarschuwing: "Onbekend account type"
- **Oorzaak:** Type komt niet overeen met verwachte waarden
- **Oplossing:** Systeem gebruikt automatisch "kosten" als default

## 📝 Tips

1. **Eerste rij = headers** - Zorg dat de eerste rij kolomnamen bevat
2. **Geen lege rijen** - Verwijder lege rijen tussen data
3. **Consistente formaten** - Gebruik consistente schrijfwijze voor categorieën
4. **BTW codes optioneel** - Laat leeg als geen BTW van toepassing is

## 🚀 Upload Proces

1. Ga naar: `/dashboard/clients/[id]/upload`
2. Selecteer "Grootboek Schema"
3. Sleep uw Excel bestand of klik om te selecteren
4. Systeem valideert automatisch
5. Bekijk fouten/waarschuwingen
6. Bij succes: automatische redirect naar grootboek overzicht

## ✅ Na Upload

Na succesvolle upload:
- Alle rekeningen zijn beschikbaar in het grootboek
- BTW-codes zijn automatisch geconverteerd
- Rekeningen kunnen gebruikt worden voor boekingsregels
- Validatie werkt automatisch bij nieuwe boekingen

---

**Hulp nodig?** Controleer de foutmeldingen in de upload interface voor specifieke problemen.

