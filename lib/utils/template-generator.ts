import * as XLSX from "xlsx"
import { BTW_CODES } from "./btw-helpers"

/**
 * Generate professional Excel template for grootboek upload
 * Includes formatting, data validation hints, and instructions
 */
export function generateGrootboekTemplate(): Blob {
  // Headers
  const headers = [
    ["GROOTBOEK SCHEMA TEMPLATE"],
    [],
    ["LET OP: Vul alleen de gele kolommen in. De blauwe kolommen zijn optioneel."],
    [],
    ["Grootboeknummer", "Omschrijving", "Categorie", "BTW Code", "Rubriek", "Beschrijving"],
  ]

  // Example data
  const exampleData = [
    ["8000", "Omzet hoog tarief", "Opbrengsten", "1a", "1a", "Omzet met 21% BTW"],
    ["8010", "Omzet laag tarief", "Opbrengsten", "1b", "1b", "Omzet met 9% BTW"],
    ["4300", "Huur", "Kosten", "5b", "5b", "Huur kosten met voorbelasting"],
    ["1900", "Te vorderen BTW", "Kosten", "5b", "5b", "BTW voorbelasting"],
    ["1000", "Kas", "Activa", "", "", "Contant geld"],
    ["2000", "Bank", "Activa", "", "", "Bankrekening"],
  ]

  // Combine headers and data
  const allData = [...headers, ...exampleData]

  // Create worksheet using array of arrays for better control
  const worksheet = XLSX.utils.aoa_to_sheet(allData)

  // Set column widths
  worksheet["!cols"] = [
    { wch: 18 }, // Grootboeknummer
    { wch: 30 }, // Omschrijving
    { wch: 15 }, // Categorie
    { wch: 12 }, // BTW Code
    { wch: 10 }, // Rubriek
    { wch: 40 }, // Beschrijving
  ]

  // Freeze first 5 rows (header rows)
  worksheet["!freeze"] = { xSplit: 0, ySplit: 5, topLeftCell: "A6", activePane: "bottomLeft" }

  // Add cell styles (using cell comments as workaround for xlsx limitations)
  // Note: Full styling requires ExcelJS, but we can structure it well

  // Create instructions sheet
  const instructionsData = [
    ["INSTRUCTIES - GROOTBOEK SCHEMA"],
    [],
    ["VERPLICHTE KOLOMMEN:"],
    ["• Grootboeknummer", "Uniek nummer voor elke rekening (bijv. 8000, 4300)"],
    ["• Omschrijving", "Naam van de rekening (bijv. 'Omzet hoog tarief')"],
    ["• Categorie", "Type rekening: Activa, Passiva, Kosten, of Opbrengsten"],
    [],
    ["OPTIONELE KOLOMMEN:"],
    ["• BTW Code", "BTW code (1a, 1b, 5b, etc.) - zie lijst hieronder"],
    ["• Rubriek", "Belastingdienst rubriek"],
    ["• Beschrijving", "Extra omschrijving"],
    [],
    ["TOEGESTANE WAARDEN:"],
    [],
    ["Categorie:", "Activa", "Passiva", "Kosten", "Opbrengsten"],
    [],
    ["BTW Codes:"],
    ["Code", "Omschrijving", "Percentage", "Rubriek"],
  ]

  // Add BTW codes to instructions
  Object.values(BTW_CODES).forEach((code) => {
    instructionsData.push([code.code, code.description, `${code.percentage}%`, code.rubriek])
  })

  instructionsData.push(
    [],
    ["TIPS:"],
    ["• Gebruik unieke grootboeknummers per rekening"],
    ["• Categorie bepaalt of het een balansrekening (Activa/Passiva) of resultatenrekening (Kosten/Opbrengsten) is"],
    ["• BTW Code is alleen nodig voor rekeningen met BTW"],
    ["• Laat optionele kolommen leeg als ze niet van toepassing zijn"],
    [],
    ["VOORBEELDEN:"],
    ["Omzet rekening:", "8000", "Omzet hoog tarief", "Opbrengsten", "1a"],
    ["Kosten rekening:", "4300", "Huur", "Kosten", "5b"],
    ["Balans rekening:", "1000", "Kas", "Activa", ""],
  )

  const instructionsSheet = XLSX.utils.aoa_to_sheet(instructionsData)
  instructionsSheet["!cols"] = [
    { wch: 20 }, // Column 1
    { wch: 40 }, // Column 2
    { wch: 12 }, // Column 3
    { wch: 10 }, // Column 4
  ]

  // Create workbook
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, "Grootboek")
  XLSX.utils.book_append_sheet(workbook, instructionsSheet, "Instructies")

  // Write to buffer
  const excelBuffer = XLSX.write(workbook, { type: "array", bookType: "xlsx" })
  return new Blob([excelBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" })
}

/**
 * Generate professional Excel template for boekingsregels upload
 * Includes formatting, data validation hints, and instructions
 */
export function generateBoekingsregelsTemplate(): Blob {
  // Headers
  const headers = [
    ["BOEKINGSREGELS TEMPLATE"],
    [],
    ["LET OP: Vul alleen de gele kolommen in. De blauwe kolommen zijn optioneel."],
    ["BELANGRIJK: Vul alleen DEBET OF CREDIT in, niet beide!"],
    [],
    [
      "Datum",
      "Grootboeknummer",
      "Omschrijving",
      "Debet",
      "Credit",
      "BTW Code",
      "BTW Bedrag",
      "Factuurnummer",
    ],
  ]

  // Example data
  const exampleData = [
    ["01-01-2026", "8000", "Factuur 001 - Verkoop", "", "1000.00", "1a", "210.00", "FACT-2026-001"],
    ["01-01-2026", "1900", "BTW op factuur 001", "", "210.00", "1a", "", "FACT-2026-001"],
    ["15-01-2026", "4300", "Huur januari", "1000.00", "", "5b", "210.00", ""],
    ["15-01-2026", "1900", "BTW op huur (voorbelasting)", "210.00", "", "5b", "", ""],
    ["20-01-2026", "1000", "Kasstorting", "", "500.00", "", "", ""],
    ["25-01-2026", "2000", "Bankafschrijving", "250.00", "", "", "", ""],
  ]

  // Combine headers and data
  const allData = [...headers, ...exampleData]

  // Create worksheet
  const worksheet = XLSX.utils.aoa_to_sheet(allData)

  // Set column widths
  worksheet["!cols"] = [
    { wch: 12 }, // Datum
    { wch: 18 }, // Grootboeknummer
    { wch: 35 }, // Omschrijving
    { wch: 12 }, // Debet
    { wch: 12 }, // Credit
    { wch: 12 }, // BTW Code
    { wch: 12 }, // BTW Bedrag
    { wch: 18 }, // Factuurnummer
  ]

  // Freeze first 6 rows (header rows)
  worksheet["!freeze"] = { xSplit: 0, ySplit: 6, topLeftCell: "A7", activePane: "bottomLeft" }

  // Create instructions sheet
  const instructionsData = [
    ["INSTRUCTIES - BOEKINGSREGELS"],
    [],
    ["VERPLICHTE KOLOMMEN:"],
    ["• Datum", "Datum van de transactie (DD-MM-YYYY of DD/MM/YYYY)"],
    ["• Grootboeknummer", "Nummer van de grootboekrekening (moet bestaan in grootboek schema)"],
    ["• Omschrijving", "Beschrijving van de transactie"],
    ["• Debet OF Credit", "Vul EEN van beide in (niet beide, niet geen)"],
    [],
    ["OPTIONELE KOLOMMEN:"],
    ["• BTW Code", "BTW code als er BTW van toepassing is (1a, 1b, 5b, etc.)"],
    ["• BTW Bedrag", "BTW bedrag (wordt automatisch berekend als BTW code is ingevuld)"],
    ["• Factuurnummer", "Factuurnummer voor referentie"],
    [],
    ["BELANGRIJKE REGELS:"],
    ["1. Elke transactie moet DEBET OF CREDIT hebben (niet beide, niet geen)"],
    ["2. Debet = kosten, inkopen, bezittingen (links)"],
    ["3. Credit = omzet, inkomsten, schulden (rechts)"],
    ["4. BTW Bedrag wordt automatisch berekend op basis van BTW Code"],
    ["5. Datum kan worden weggelaten - wordt dan automatisch ingevuld"],
    [],
    ["BTW CODES:"],
    ["Code", "Omschrijving", "Percentage", "Gebruik voor"],
  ]

  // Add BTW codes to instructions
  Object.values(BTW_CODES).forEach((code) => {
    const usage =
      code.type === "verschuldigd"
        ? "Omzet (credit)"
        : code.type === "voorbelasting"
        ? "Kosten (debet)"
        : "Speciale situaties"
    instructionsData.push([code.code, code.description, `${code.percentage}%`, usage])
  })

  instructionsData.push(
    [],
    ["VOORBEELDEN:"],
    [],
    ["Verkoop Factuur:"],
    ["Datum", "Grootboek", "Omschrijving", "Debet", "Credit", "BTW Code"],
    ["01-01-2026", "8000", "Factuur 001", "", "1000.00", "1a"],
    ["01-01-2026", "1900", "BTW op factuur", "", "210.00", "1a"],
    [],
    ["Inkoop Kosten:"],
    ["Datum", "Grootboek", "Omschrijving", "Debet", "Credit", "BTW Code"],
    ["15-01-2026", "4300", "Huur", "1000.00", "", "5b"],
    ["15-01-2026", "1900", "BTW voorbelasting", "210.00", "", "5b"],
    [],
    ["Kas Transactie (geen BTW):"],
    ["Datum", "Grootboek", "Omschrijving", "Debet", "Credit", "BTW Code"],
    ["20-01-2026", "1000", "Kasstorting", "", "500.00", ""],
    [],
    ["TIPS:"],
    ["• Gebruik consistente datumnotatie (DD-MM-YYYY)"],
    ["• Grootboeknummer moet bestaan in je grootboek schema"],
    ["• BTW wordt automatisch berekend - je hoeft BTW Bedrag niet handmatig in te vullen"],
    ["• Lege rijen worden automatisch overgeslagen"],
    ["• Ontbrekende datums worden automatisch ingevuld (vorige regel of vandaag)"],
  )

  const instructionsSheet = XLSX.utils.aoa_to_sheet(instructionsData)
  instructionsSheet["!cols"] = [
    { wch: 15 }, // Column 1
    { wch: 40 }, // Column 2
    { wch: 12 }, // Column 3
    { wch: 25 }, // Column 4
  ]

  // Create workbook
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, "Boekingsregels")
  XLSX.utils.book_append_sheet(workbook, instructionsSheet, "Instructies")

  // Write to buffer
  const excelBuffer = XLSX.write(workbook, { type: "array", bookType: "xlsx" })
  return new Blob([excelBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" })
}

/**
 * Download template file
 */
export function downloadTemplate(type: "grootboek" | "boekingsregels") {
  const blob = type === "grootboek" ? generateGrootboekTemplate() : generateBoekingsregelsTemplate()
  const filename = type === "grootboek" ? "grootboek-template.xlsx" : "boekingsregels-template.xlsx"
  
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  window.URL.revokeObjectURL(url)
}

