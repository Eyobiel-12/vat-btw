import * as XLSX from "xlsx"

/**
 * Apply modern cell styling to Excel worksheet
 */
function applyCellStyle(
  cell: XLSX.CellObject,
  style: {
    bold?: boolean
    fontSize?: number
    fillColor?: string
    textColor?: string
    alignment?: "left" | "center" | "right"
    border?: boolean
    numFmt?: string
  }
) {
  if (!cell.s) cell.s = {}
  
  cell.s.font = {
    ...(cell.s.font || {}),
    ...(style.bold !== undefined ? { bold: style.bold } : {}),
    ...(style.fontSize ? { sz: style.fontSize } : {}),
    ...(style.textColor ? { color: { rgb: style.textColor } } : {}),
  }
  
  if (style.fillColor) {
    cell.s.fill = { fgColor: { rgb: style.fillColor } }
  }
  
  if (style.alignment) {
    cell.s.alignment = {
      horizontal: style.alignment,
      vertical: "center",
      wrapText: false,
    }
  }
  
  if (style.border) {
    cell.s.border = {
      top: { style: "thin", color: { rgb: "000000" } },
      bottom: { style: "thin", color: { rgb: "000000" } },
      left: { style: "thin", color: { rgb: "000000" } },
      right: { style: "thin", color: { rgb: "000000" } },
    }
  }
  
  if (style.numFmt) {
    cell.z = style.numFmt
    cell.s.numFmt = style.numFmt
  }
}

/**
 * Export boekingsregels to Excel with modern professional formatting
 */
export function exportBoekingsregelsToExcel(
  data: Array<{
    boekdatum: string
    account_number: string
    omschrijving: string
    debet: number | null
    credit: number | null
    btw_code: string | null
    btw_bedrag: number | null
    factuurnummer: string | null
  }>,
  clientInfo?: {
    name: string
    company_name?: string | null
    kvk_number?: string | null
    btw_number?: string | null
    email?: string | null
    phone?: string | null
    address?: string | null
    city?: string | null
    postal_code?: string | null
  }
) {
  const exportDate = new Date()
  
  // Calculate totals and statistics
  const totalDebet = data.reduce((sum, r) => sum + (Number(r.debet) || 0), 0)
  const totalCredit = data.reduce((sum, r) => sum + (Number(r.credit) || 0), 0)
  const totalBTW = data.reduce((sum, r) => sum + (Number(r.btw_bedrag) || 0), 0)
  const withBTWCode = data.filter((r) => r.btw_code).length
  const withoutBTWCode = data.length - withBTWCode
  
  // Group by month for statistics
  const byMonth = data.reduce((acc, r) => {
    const date = new Date(r.boekdatum)
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
    if (!acc[monthKey]) acc[monthKey] = { count: 0, debet: 0, credit: 0, btw: 0 }
    acc[monthKey].count++
    acc[monthKey].debet += Number(r.debet) || 0
    acc[monthKey].credit += Number(r.credit) || 0
    acc[monthKey].btw += Number(r.btw_bedrag) || 0
    return acc
  }, {} as Record<string, { count: number; debet: number; credit: number; btw: number }>)

  // Professional header section
  const headers: any[] = [
    ["BOEKINGSREGELS OVERZICHT - BTW ASSIST"],
    [],
  ]

  // Add client information if available
  if (clientInfo) {
    headers.push(["KLANTGEGEVENS"])
    headers.push(["Naam:", clientInfo.name])
    if (clientInfo.company_name) headers.push(["Bedrijfsnaam:", clientInfo.company_name])
    if (clientInfo.kvk_number) headers.push(["KVK-nummer:", clientInfo.kvk_number])
    if (clientInfo.btw_number) headers.push(["BTW-nummer:", clientInfo.btw_number])
    if (clientInfo.address) headers.push(["Adres:", clientInfo.address])
    if (clientInfo.postal_code && clientInfo.city) {
      headers.push(["Postcode & Plaats:", `${clientInfo.postal_code} ${clientInfo.city}`])
    }
    if (clientInfo.email) headers.push(["E-mail:", clientInfo.email])
    if (clientInfo.phone) headers.push(["Telefoon:", clientInfo.phone])
    headers.push([])
  }

  // Export information
  headers.push(["EXPORT INFORMATIE"])
  headers.push(["Exportdatum:", exportDate.toLocaleDateString("nl-NL", { 
    weekday: "long", 
    year: "numeric", 
    month: "long", 
    day: "numeric" 
  })])
  headers.push(["Exporttijd:", exportDate.toLocaleTimeString("nl-NL", { 
    hour: "2-digit", 
    minute: "2-digit" 
  })])
  headers.push(["Totaal aantal transacties:", data.length])
  headers.push([])

  // Summary statistics
  headers.push(["SAMENVATTING"])
  headers.push(["Totaal Debet:", "", "", formatDutchNumber(totalDebet)])
  headers.push(["Totaal Credit:", "", "", formatDutchNumber(totalCredit)])
  headers.push(["Saldo:", "", "", formatDutchNumber(totalDebet - totalCredit)])
  headers.push(["Totaal BTW:", "", "", formatDutchNumber(totalBTW)])
  headers.push(["Transacties met BTW-code:", withBTWCode])
  headers.push(["Transacties zonder BTW-code:", withoutBTWCode])
  headers.push([])

  // Data table header
  headers.push([
    "Datum",
    "Grootboeknummer",
    "Omschrijving",
    "Debet (€)",
    "Credit (€)",
    "BTW Code",
    "BTW Bedrag (€)",
    "Factuurnummer",
  ])

  // Format data rows with Dutch formatting
  const exportData = data.map((regel) => {
    const date = new Date(regel.boekdatum)
    return [
      date.toLocaleDateString("nl-NL"),
      regel.account_number,
      regel.omschrijving,
      regel.debet && regel.debet > 0 ? regel.debet : null,
      regel.credit && regel.credit > 0 ? regel.credit : null,
      regel.btw_code || "",
      regel.btw_bedrag && regel.btw_bedrag > 0 ? regel.btw_bedrag : null,
      regel.factuurnummer || "",
    ]
  })

  // Add totals row
  exportData.push([])
  exportData.push([
    "TOTAAL",
    "",
    "",
    totalDebet,
    totalCredit,
    "",
    totalBTW,
    "",
  ])

  // Monthly breakdown if multiple months
  if (Object.keys(byMonth).length > 1) {
    exportData.push([])
    exportData.push(["MAANDELIJKSE SAMENVATTING", "", "", "", "", "", "", ""])
    Object.entries(byMonth)
      .sort(([a], [b]) => a.localeCompare(b))
      .forEach(([monthKey, stats]) => {
        const [year, month] = monthKey.split("-")
        const monthName = new Date(parseInt(year), parseInt(month) - 1).toLocaleDateString("nl-NL", { month: "long", year: "numeric" })
        exportData.push([
          monthName,
          `${stats.count} transacties`,
          "",
          stats.debet,
          stats.credit,
          "",
          stats.btw,
          "",
        ])
      })
  }

  const allData = [...headers, ...exportData]

  // Create worksheet
  const worksheet = XLSX.utils.aoa_to_sheet(allData)

  // Set column widths
  worksheet["!cols"] = [
    { wch: 14 }, // Datum
    { wch: 18 }, // Grootboeknummer
    { wch: 40 }, // Omschrijving
    { wch: 16 }, // Debet
    { wch: 16 }, // Credit
    { wch: 12 }, // BTW Code
    { wch: 16 }, // BTW Bedrag
    { wch: 20 }, // Factuurnummer
  ]

  // Apply modern styling
  const range = XLSX.utils.decode_range(worksheet["!ref"] || "A1")
  const dataStartRow = headers.length
  
  for (let row = 0; row <= range.e.r; row++) {
    for (let col = 0; col <= range.e.c; col++) {
      const cellAddress = XLSX.utils.encode_cell({ r: row, c: col })
      const cell = worksheet[cellAddress]
      if (!cell) continue

      // Main title
      if (row === 0 && col === 0) {
        applyCellStyle(cell, { bold: true, fontSize: 16, fillColor: "1E40AF", textColor: "FFFFFF" })
      }
      // Section headers (KLANTGEGEVENS, EXPORT INFORMATIE, etc.)
      else if (cell.v && typeof cell.v === "string" && 
               (cell.v.includes("KLANTGEGEVENS") || cell.v.includes("EXPORT INFORMATIE") || 
                cell.v.includes("SAMENVATTING") || cell.v.includes("MAANDELIJKSE"))) {
        applyCellStyle(cell, { bold: true, fontSize: 12, fillColor: "E5E7EB", border: true })
      }
      // Data table header row
      else if (row === dataStartRow - 1) {
        applyCellStyle(cell, { 
          bold: true, 
          fillColor: "1E40AF", 
          textColor: "FFFFFF", 
          alignment: "center",
          border: true 
        })
      }
      // Currency columns (Debet, Credit, BTW Bedrag) - columns 3, 4, 6
      else if ((col === 3 || col === 4 || col === 6) && typeof cell.v === "number") {
        applyCellStyle(cell, { 
          alignment: "right", 
          numFmt: "#.##0,00",
          border: row >= dataStartRow 
        })
      }
      // Total row
      else if (cell.v && typeof cell.v === "string" && cell.v === "TOTAAL") {
        applyCellStyle(cell, { bold: true, fillColor: "FEF3C7", border: true })
      }
      // Regular data rows
      else if (row >= dataStartRow && row < dataStartRow + data.length) {
        applyCellStyle(cell, { border: true })
        if (col === 2) { // Omschrijving column
          cell.s = { ...(cell.s || {}), alignment: { horizontal: "left", vertical: "center" } }
        }
      }
      // Label cells (Naam:, Exportdatum:, etc.)
      else if (col === 0 && cell.v && typeof cell.v === "string" && cell.v.endsWith(":")) {
        applyCellStyle(cell, { bold: true })
      }
    }
  }

  // Freeze header rows
  worksheet["!freeze"] = { 
    xSplit: 0, 
    ySplit: dataStartRow, 
    topLeftCell: XLSX.utils.encode_cell({ r: dataStartRow, c: 0 }), 
    activePane: "bottomLeft" 
  }

  // Create workbook
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, "Boekingsregels")

  // Generate professional filename
  const clientNameSlug = clientInfo?.name
    ?.toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .substring(0, 30) || "export"
  
  const dateStr = exportDate.toISOString().split("T")[0]
  const filename = clientInfo 
    ? `Boekingsregels-${clientNameSlug}-${dateStr}.xlsx`
    : `boekingsregels-export-${dateStr}.xlsx`

  // Download
  XLSX.writeFile(workbook, filename)
}

/**
 * Export grootboek accounts to Excel
 */
export function exportGrootboekToExcel(data: Array<{
  account_number: string
  account_name: string
  account_type: string
  btw_code: string | null
  rubriek: string | null
  description: string | null
}>) {
  // Headers
  const headers = [
    ["GROOTBOEK SCHEMA EXPORT"],
    [`Geëxporteerd op: ${new Date().toLocaleDateString("nl-NL")}`],
    [],
    [
      "Grootboeknummer",
      "Omschrijving",
      "Categorie",
      "BTW Code",
      "Rubriek",
      "Beschrijving",
    ],
  ]

  // Format data
  const exportData = data.map((account) => [
    account.account_number,
    account.account_name,
    account.account_type,
    account.btw_code || "",
    account.rubriek || "",
    account.description || "",
  ])

  // Add summary
  exportData.push([])
  exportData.push([
    "TOTAAL",
    `${data.length} rekeningen`,
    "",
    "",
    "",
    "",
  ])

  // Group by type
  const byType = data.reduce((acc, a) => {
    acc[a.account_type] = (acc[a.account_type] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  exportData.push([])
  exportData.push(["SAMENVATTING PER CATEGORIE:"])
  Object.entries(byType).forEach(([type, count]) => {
    exportData.push([type, `${count} rekeningen`, "", "", "", ""])
  })

  const allData = [...headers, ...exportData]

  // Create worksheet
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

  // Freeze header rows
  worksheet["!freeze"] = { xSplit: 0, ySplit: 4, topLeftCell: "A5", activePane: "bottomLeft" }

  // Create workbook
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, "Grootboek")

  // Generate filename with date
  const dateStr = new Date().toISOString().split("T")[0]
  const filename = `grootboek-export-${dateStr}.xlsx`

  // Download
  XLSX.writeFile(workbook, filename)
}

/**
 * Format number in Dutch format (1.234,56)
 */
function formatDutchNumber(value: number): string {
  return new Intl.NumberFormat("nl-NL", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

/**
 * Format currency in Dutch format (€ 1.234,56)
 */
function formatDutchCurrency(value: number): string {
  return new Intl.NumberFormat("nl-NL", {
    style: "currency",
    currency: "EUR",
  }).format(value)
}

/**
 * Export BTW aangifte to Excel with professional Dutch formatting
 */
/**
 * Helper to format number for Excel (ensures proper decimal places)
 */
function formatNumberForExcel(value: number | null | undefined): number {
  if (value === null || value === undefined || isNaN(value)) return 0
  // Round to 2 decimal places to avoid floating point issues
  return Math.round(value * 100) / 100
}

/**
 * Helper to get voorbelasting grondslag from BTW amount
 * For 21%: grondslag = BTW / 0.21
 * For 9%: grondslag = BTW / 0.09
 * This is a reverse calculation - ideally we'd have the actual grondslag from boekingsregels
 */
function calculateGrondslagFromBTW(btwAmount: number, rate: number): number {
  if (btwAmount === 0 || rate === 0) return 0
  // Calculate grondslag and round to 2 decimals
  const grondslag = btwAmount / (rate / 100)
  return formatNumberForExcel(grondslag)
}

export function exportBTWAangifteToExcel(
  calculation: {
    rubriek_1a_omzet: number
    rubriek_1a_btw: number
    rubriek_1b_omzet: number
    rubriek_1b_btw: number
    rubriek_1c_omzet: number
    rubriek_1c_btw: number
    rubriek_1d_omzet: number
    rubriek_1d_btw: number
    rubriek_1e_omzet: number
    rubriek_2a_omzet: number
    rubriek_3a_omzet: number
    rubriek_3b_omzet: number
    rubriek_4a_omzet: number
    rubriek_4a_btw: number
    rubriek_4b_omzet: number
    rubriek_4b_btw: number
    rubriek_5a_btw: number
    rubriek_5b_btw: number
    rubriek_5b_grondslag?: number
    rubriek_5c_btw: number
    rubriek_5d_btw: number
    rubriek_5e_btw: number
  },
  periodeInfo: {
    jaar: number
    periodeType: "maand" | "kwartaal" | "jaar"
    periode: number
    periodeLabel?: string
  },
  clientInfo: {
    name: string
    company_name?: string | null
    kvk_number?: string | null
    btw_number?: string | null
    email?: string | null
    phone?: string | null
    address?: string | null
    city?: string | null
    postal_code?: string | null
  },
  status?: "concept" | "klaar" | "ingediend" | "definitief"
) {
  const exportDate = new Date()
  const periodeLabel = periodeInfo.periodeLabel || 
    (periodeInfo.periodeType === "kwartaal" 
      ? `Kwartaal ${periodeInfo.periode} ${periodeInfo.jaar}`
      : periodeInfo.periodeType === "maand"
      ? `${new Date(periodeInfo.jaar, periodeInfo.periode - 1).toLocaleDateString("nl-NL", { month: "long", year: "numeric" })}`
      : `Jaar ${periodeInfo.jaar}`)

  // Clean, professional header section matching the reference design
  // Structure: Column A empty, Column B-D for data
  const headers: any[] = [
    [], // Row 1 - Empty
    [], // Row 2 - Empty
    [], // Row 3 - Empty
    ["", "BTW Aangifte Overzicht"], // Row 4 - Title in B4 (will be merged to D4)
    [], // Row 5 - Empty
    ["", "Klant:", clientInfo.company_name || clientInfo.name], // Row 6
    ["", "Periode:", periodeLabel], // Row 7
    ["", "Status:", status === "definitief" ? "Definitief" : status === "ingediend" ? "Ingediend" : status === "klaar" ? "Klaar" : "Voorbereid"], // Row 8
    [], // Row 9 - Empty
    ["", "Rubriek", "Omschrijving", "Grondslag", "BTW Bedrag"], // Row 10 - Table headers (B10-E10)
  ]

  // Format data rows matching the reference design structure
  // Get voorbelasting grondslag - use tracked value if available, otherwise calculate backwards
  // If rubriek_5b_grondslag is available (from calculation), use it directly
  // Otherwise, calculate backwards from BTW amount (less accurate)
  const voorbelastingGrondslag21 = calculation.rubriek_5b_grondslag && calculation.rubriek_5b_grondslag > 0
    ? formatNumberForExcel(calculation.rubriek_5b_grondslag) // Use actual tracked grondslag
    : calculation.rubriek_5b_btw > 0 
      ? calculateGrondslagFromBTW(calculation.rubriek_5b_btw, 21) // Fallback: calculate backwards
      : 0
  const voorbelastingGrondslag9 = 0 // TODO: Track 9% voorbelasting separately if needed
  
  // Format all numbers properly
  const exportData: any[] = [
    // Row 11 - Omzet hoog tarief
    ["", "1a", "Leveringen/diensten belast met hoog tarief (21%)", 
     formatNumberForExcel(calculation.rubriek_1a_omzet), 
     formatNumberForExcel(calculation.rubriek_1a_btw)],
    // Row 12 - Omzet laag tarief
    ["", "1b", "Leveringen/diensten belast met laag tarief (9%)", 
     formatNumberForExcel(calculation.rubriek_1b_omzet), 
     formatNumberForExcel(calculation.rubriek_1b_btw)],
    // Row 13 - Omzet overige tarieven
    ["", "1c", "Leveringen/diensten belast met overige tarieven", 
     formatNumberForExcel(calculation.rubriek_1c_omzet), 
     formatNumberForExcel(calculation.rubriek_1c_btw)],
    // Row 14 - Voorbelasting 21%
    ["", "2a", "Voorbelasting (inkopen 21%)", 
     voorbelastingGrondslag21, 
     formatNumberForExcel(calculation.rubriek_5b_btw)],
    // Row 15 - Voorbelasting 9%
    ["", "2b", "Voorbelasting (inkopen 9%)", 
     voorbelastingGrondslag9, 
     0],
    // Row 16 - Voorbelasting EU
    ["", "4a", "Voorbelasting EU", 
     0, 
     0],
    // Row 17 - Voorbelasting buiten EU
    ["", "4b", "Voorbelasting buiten EU", 
     0, 
     0],
    // Row 18 - Total verschuldigd/te ontvangen
    ["", "5b", "Totaal verschuldigd/te ontvangen", 
     0, 
     formatNumberForExcel(calculation.rubriek_5e_btw)],
  ]
  
  // Calculate totals (sum of all grondslag and BTW from output transactions only)
  const totalGrondslag = formatNumberForExcel(
    calculation.rubriek_1a_omzet + 
    calculation.rubriek_1b_omzet + 
    calculation.rubriek_1c_omzet
  )
  const totalBTW = formatNumberForExcel(
    calculation.rubriek_1a_btw + 
    calculation.rubriek_1b_btw + 
    calculation.rubriek_1c_btw
  )
  
  // Row 20 - Total row (empty row first, then total)
  exportData.push([])
  exportData.push(["", "TOTAAL:", "", totalGrondslag, totalBTW])

  const allData = [...headers, ...exportData]

  // Create worksheet
  const worksheet = XLSX.utils.aoa_to_sheet(allData)

  // Set column widths matching the reference design
  worksheet["!cols"] = [
    { wch: 3 },  // Column A (empty/labels) - narrower
    { wch: 10 }, // Column B (Rubriek)
    { wch: 55 }, // Column C (Omschrijving) - wider for descriptions
    { wch: 18 }, // Column D (Grondslag) - wider for numbers
    { wch: 18 }, // Column E (BTW Bedrag) - wider for numbers
  ]

  // Apply formatting matching the reference design
  const range = XLSX.utils.decode_range(worksheet["!ref"] || "A1")
  const headerRow = 9 // Row 10 (0-indexed = 9) - Table headers
  const dataStartRow = 10 // Row 11 (0-indexed = 10) - First data row
  const totalRow = dataStartRow + exportData.length - 1 // Last row with TOTAAL
  
  // Dark green color for headers (matching reference: #2D5016 or similar)
  const darkGreen = "2D5016"
  
  for (let row = 0; row <= range.e.r; row++) {
    for (let col = 0; col <= range.e.c; col++) {
      const cellAddress = XLSX.utils.encode_cell({ r: row, c: col })
      const cell = worksheet[cellAddress]
      if (!cell) continue

      // Title row (B4) - "BTW Aangifte Overzicht"
      if (row === 3 && col === 1) {
        applyCellStyle(cell, { bold: true, fontSize: 14 })
      }
      // Client info labels (B6, B7, B8)
      else if ((row === 5 || row === 6 || row === 7) && col === 1) {
        applyCellStyle(cell, { bold: true })
      }
      // Table header row (Row 10) - Dark green background, white text (B10-E10)
      else if (row === headerRow && col >= 1 && col <= 4) {
        applyCellStyle(cell, { 
          bold: true, 
          fillColor: darkGreen, 
          textColor: "FFFFFF", 
          alignment: "center",
          border: true 
        })
      }
      // Data rows (Rows 11-18)
      else if (row >= dataStartRow && row < totalRow) {
        // Currency columns (Grondslag and BTW Bedrag) - columns 3 and 4 (D and E)
        if ((col === 3 || col === 4) && typeof cell.v === "number") {
          // For zero values, ensure they display as 0,00 not empty
          if (cell.v === 0) {
            cell.v = 0 // Keep as numeric 0
          }
          // Use Excel number format: #,##0.00 for US locale, but Excel will apply locale
          // For Dutch locale in Excel, the format should be set in Excel itself
          // We use standard format and Excel will apply locale settings
          applyCellStyle(cell, { 
            alignment: "right", 
            numFmt: "#,##0.00" // Standard Excel format (Excel will apply locale)
          })
        }
        // Other columns (B, C)
        else if (col >= 1 && col <= 2) {
          cell.s = { ...(cell.s || {}), alignment: { horizontal: col === 2 ? "left" : "center", vertical: "center" } }
        }
      }
      // Total row (Row 20) - Dark green background for amount columns
      else if (row === totalRow) {
        if (col === 1) { // "TOTAAL:" label in column B
          applyCellStyle(cell, { bold: true })
        } else if (col === 3 || col === 4) { // Amount columns (D and E)
          // Ensure value is properly formatted
          if (typeof cell.v === "number" && cell.v === 0) {
            cell.v = 0 // Keep as 0
          }
          applyCellStyle(cell, { 
            bold: true, 
            fillColor: darkGreen, 
            textColor: "FFFFFF",
            alignment: "right",
            numFmt: "#,##0.00" // Standard Excel format (Excel will apply locale)
          })
        }
      }
    }
  }
  
  // Merge title cell (B4:E4)
  if (!worksheet["!merges"]) worksheet["!merges"] = []
  worksheet["!merges"].push({ s: { r: 3, c: 1 }, e: { r: 3, c: 4 } })

  // Freeze header rows (freeze up to the data table header)
  const freezeRow = headers.length - 1
  worksheet["!freeze"] = { 
    xSplit: 0, 
    ySplit: freezeRow, 
    topLeftCell: XLSX.utils.encode_cell({ r: freezeRow + 1, c: 0 }), 
    activePane: "bottomLeft" 
  }

  // Create workbook
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, "BTW Aangifte")

  // Generate professional filename with client name
  const clientNameSlug = clientInfo.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .substring(0, 30)
  
  const periodeStr = periodeInfo.periodeType === "kwartaal" 
    ? `Q${periodeInfo.periode}-${periodeInfo.jaar}`
    : periodeInfo.periodeType === "maand"
    ? `M${periodeInfo.periode}-${periodeInfo.jaar}`
    : `Jaar-${periodeInfo.jaar}`
  
  const filename = `BTW-Aangifte-${clientNameSlug}-${periodeStr}.xlsx`

  // Download
  XLSX.writeFile(workbook, filename)
}

