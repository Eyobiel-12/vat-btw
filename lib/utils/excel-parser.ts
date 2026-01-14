/**
 * Excel Parser for Grootboek and Boekingsregels
 * Handles parsing Excel files according to Dutch accounting standards
 */

import * as XLSX from 'xlsx'
import type { InsertTables } from '@/lib/supabase/types'

export interface ExcelParseResult<T> {
  success: boolean
  data: T[]
  errors: string[]
  warnings: string[]
  sheetNames?: string[]
}

export interface ColumnMapping {
  [excelColumn: string]: string // Maps Excel column name to system field name
}

/**
 * Parse grootboek schema from Excel file
 * Expected columns:
 * - grootboeknummer / account_number
 * - omschrijving / account_name / naam
 * - categorie / account_type / type
 * - btw_code (optional)
 * - rubriek (optional)
 */
export function parseGrootboekExcel(
  file: File,
  sheetName?: string,
  columnMapping?: ColumnMapping
): Promise<ExcelParseResult<InsertTables<'grootboek_accounts'>>> {
  return new Promise((resolve) => {
    const reader = new FileReader()
    const errors: string[] = []
    const warnings: string[] = []
    const accounts: InsertTables<'grootboek_accounts'>[] = []

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer)
        const workbook = XLSX.read(data, { type: 'array' })

        // Get sheet names for result
        const allSheetNames = workbook.SheetNames
        
        // Use specified sheet or first sheet
        const targetSheet = sheetName || allSheetNames[0]
        if (!allSheetNames.includes(targetSheet)) {
          errors.push(`Sheet "${targetSheet}" niet gevonden. Beschikbare sheets: ${allSheetNames.join(', ')}`)
          return resolve({ success: false, data: [], errors, warnings, sheetNames: allSheetNames })
        }

        const worksheet = workbook.Sheets[targetSheet]

        // Convert to JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { raw: false })

        if (jsonData.length === 0) {
          errors.push('Excel bestand is leeg of heeft geen data')
          return resolve({ success: false, data: [], errors, warnings })
        }

        // Normalize column names (use mapping if provided, otherwise use default normalization)
        const normalizeKey = (key: string): string => {
          // If column mapping is provided, use it
          if (columnMapping && columnMapping[key]) {
            return columnMapping[key]
          }

          // Otherwise use default normalization
          const lower = key.toLowerCase().trim()
          const mappings: Record<string, string> = {
            'grootboeknummer': 'account_number',
            'rekeningnummer': 'account_number',
            'nummer': 'account_number',
            'account_number': 'account_number',
            'omschrijving': 'account_name',
            'naam': 'account_name',
            'account_name': 'account_name',
            'categorie': 'account_type',
            'type': 'account_type',
            'account_type': 'account_type',
            'btw_code': 'btw_code',
            'btwcode': 'btw_code',
            'btw': 'btw_code',
            'rubriek': 'rubriek',
            'beschrijving': 'description',
            'description': 'description',
            'opmerking': 'description',
            'notities': 'description',
          }
          return mappings[lower] || lower
        }

        // Process each row
        let lastAccountNumber = 0
        jsonData.forEach((row: any, index: number) => {
          const normalizedRow: any = {}
          Object.keys(row).forEach((key) => {
            normalizedRow[normalizeKey(key)] = row[key]
          })

          // Skip completely empty rows
          const isEmptyRow = !normalizedRow.account_number &&
                            !normalizedRow.account_name &&
                            !normalizedRow.account_type &&
                            !normalizedRow.btw_code &&
                            !normalizedRow.rubriek &&
                            !normalizedRow.description

          if (isEmptyRow) {
            warnings.push(`Rij ${index + 2}: Lege rij overgeslagen`)
            return
          }

          // Skip rows that look like headers (contain common header words)
          const rowValues = Object.values(normalizedRow).map(v => String(v).toLowerCase())
          const headerKeywords = ['grootboeknummer', 'rekeningnummer', 'nummer', 'omschrijving', 'naam', 'categorie', 'type', 'btw', 'rubriek', 'beschrijving', 'account_number', 'account_name', 'account_type']
          const looksLikeHeader = headerKeywords.some(keyword => 
            rowValues.some(val => val.includes(keyword))
          )

          if (looksLikeHeader && index > 0) {
            warnings.push(`Rij ${index + 2}: Header rij overgeslagen`)
            return
          }

          // Auto-generate account number if missing but other data exists
          let accountNumber = normalizedRow.account_number
          if (!accountNumber) {
            if (normalizedRow.account_name || normalizedRow.account_type) {
              // Try to extract number from account_name (e.g., "1000 - Kas")
              const nameMatch = String(normalizedRow.account_name || '').match(/^(\d+)/)
              if (nameMatch) {
                accountNumber = nameMatch[1]
                warnings.push(`Rij ${index + 2}: Grootboeknummer ontbreekt, gebruikt nummer uit omschrijving: ${accountNumber}`)
              } else {
                // Generate sequential number based on last account number
                lastAccountNumber += 100
                accountNumber = String(lastAccountNumber).padStart(4, '0')
                warnings.push(`Rij ${index + 2}: Grootboeknummer ontbreekt, gegenereerd: ${accountNumber}`)
              }
            } else {
              errors.push(`Rij ${index + 2}: Grootboeknummer ontbreekt en geen andere data gevonden`)
              return
            }
          } else {
            // Store last account number for sequential generation
            const numMatch = String(accountNumber).match(/^(\d+)/)
            if (numMatch) {
              lastAccountNumber = parseInt(numMatch[1])
            }
          }

          // Validate required fields (after auto-generation)
          if (!accountNumber) {
            errors.push(`Rij ${index + 2}: Grootboeknummer ontbreekt`)
            return
          }

          if (!normalizedRow.account_name) {
            errors.push(`Rij ${index + 2}: Omschrijving ontbreekt`)
            return
          }

          if (!normalizedRow.account_type) {
            // Try to infer from account number range
            const accountNum = parseInt(String(accountNumber).replace(/\D/g, ''))
            let inferredType: 'activa' | 'passiva' | 'kosten' | 'omzet' | null = null
            
            if (accountNum >= 1000 && accountNum < 2000) {
              inferredType = 'activa'
            } else if (accountNum >= 2000 && accountNum < 3000) {
              inferredType = 'passiva'
            } else if (accountNum >= 4000 && accountNum < 5000) {
              inferredType = 'passiva'
            } else if (accountNum >= 6000 && accountNum < 7000) {
              inferredType = 'kosten'
            } else if (accountNum >= 8000 && accountNum < 9000) {
              inferredType = 'omzet'
            }

            if (inferredType) {
              warnings.push(`Rij ${index + 2}: Categorie ontbreekt, afgeleid van grootboeknummer: ${inferredType}`)
              normalizedRow.account_type = inferredType
            } else {
              errors.push(`Rij ${index + 2}: Categorie/Type ontbreekt`)
              return
            }
          }

          // Normalize account type
          const accountTypeMap: Record<string, 'activa' | 'passiva' | 'kosten' | 'omzet'> = {
            'activa': 'activa',
            'passiva': 'passiva',
            'kosten': 'kosten',
            'omzet': 'omzet',
            'opbrengsten': 'omzet',
            'inkomsten': 'omzet',
            'revenue': 'omzet',
            'expenses': 'kosten',
            'assets': 'activa',
            'liabilities': 'passiva',
          }

          const accountType = accountTypeMap[normalizedRow.account_type.toLowerCase()]

          if (!accountType) {
            warnings.push(
              `Rij ${index + 2}: Onbekend account type "${normalizedRow.account_type}". Gebruikt "kosten" als default.`
            )
          }

          // Normalize BTW code (handle old codes like OH, OL, VH, VL)
          let btwCode = normalizedRow.btw_code || null
          if (btwCode) {
            const btwCodeMap: Record<string, string> = {
              'oh': '1a', // Omzet hoog
              'ol': '1b', // Omzet laag
              'ov': '1e', // Omzet vrijgesteld
              'vh': '5b', // Voorbelasting hoog
              'vl': '5b-laag', // Voorbelasting laag
              '0': 'geen',
              'geen': 'geen',
            }
            const normalized = btwCode.toLowerCase().trim()
            if (btwCodeMap[normalized]) {
              btwCode = btwCodeMap[normalized]
            }
          }

          // Create account object
          const account: any = {
            account_number: String(accountNumber).trim(),
            account_name: String(normalizedRow.account_name).trim(),
            account_type: accountType || 'kosten',
            btw_code: btwCode,
            rubriek: normalizedRow.rubriek || null,
            description: normalizedRow.description || null,
            is_active: true,
          }

          accounts.push(account)
        })

        resolve({
          success: errors.length === 0,
          data: accounts,
          errors,
          warnings,
          sheetNames: allSheetNames,
        })
      } catch (error: any) {
        errors.push(`Fout bij lezen van Excel bestand: ${error.message}`)
        resolve({ success: false, data: [], errors, warnings })
      }
    }

    reader.onerror = () => {
      errors.push('Fout bij lezen van bestand')
      resolve({ success: false, data: [], errors, warnings })
    }

    reader.readAsArrayBuffer(file)
  })
}

/**
 * Parse date from various formats
 */
function parseDate(value: any): Date | null {
  if (!value) return null

  // Handle Excel date serial number
  if (typeof value === 'number') {
    const excelEpoch = new Date(1899, 11, 30)
    return new Date(excelEpoch.getTime() + value * 24 * 60 * 60 * 1000)
  }

  const dateStr = String(value).trim()
  if (!dateStr) return null

  // Try multiple date formats
  const formats = [
    // DD-MM-YYYY
    /^(\d{2})[-\/](\d{2})[-\/](\d{4})$/,
    // YYYY-MM-DD
    /^(\d{4})[-\/](\d{2})[-\/](\d{2})$/,
    // MM-DD-YYYY
    /^(\d{2})[-\/](\d{2})[-\/](\d{4})$/,
    // DD.MM.YYYY
    /^(\d{2})\.(\d{2})\.(\d{4})$/,
  ]

  for (const format of formats) {
    const match = dateStr.match(format)
    if (match) {
      let day: number, month: number, year: number
      
      // Determine format based on first number (if > 31, it's likely year)
      if (parseInt(match[1]) > 31) {
        // YYYY-MM-DD
        year = parseInt(match[1])
        month = parseInt(match[2]) - 1
        day = parseInt(match[3])
      } else {
        // DD-MM-YYYY or MM-DD-YYYY
        // Try DD-MM-YYYY first (Dutch format)
        if (parseInt(match[1]) <= 31 && parseInt(match[2]) <= 12) {
          day = parseInt(match[1])
          month = parseInt(match[2]) - 1
          year = parseInt(match[3])
        } else {
          // MM-DD-YYYY
          month = parseInt(match[1]) - 1
          day = parseInt(match[2])
          year = parseInt(match[3])
        }
      }

      const date = new Date(year, month, day)
      if (!isNaN(date.getTime())) return date
    }
  }

  // Try standard Date parsing
  const date = new Date(dateStr)
  if (!isNaN(date.getTime())) return date

  return null
}

/**
 * Parse number from various formats (handles comma/period decimals, thousand separators, currency)
 */
function parseNumber(value: any): number {
  if (value === null || value === undefined || value === '') return 0
  if (typeof value === 'number') return value

  let str = String(value).trim()
  
  // Remove currency symbols
  str = str.replace(/[€$£]/g, '')
  
  // Remove thousand separators (spaces, dots, commas)
  str = str.replace(/[\s\.]/g, '')
  
  // Replace comma with period for decimal
  str = str.replace(',', '.')
  
  // Remove any remaining non-numeric characters except minus and period
  str = str.replace(/[^\d.-]/g, '')
  
  const num = parseFloat(str)
  return isNaN(num) ? 0 : num
}

/**
 * Parse boekingsregels from Excel file
 * Expected columns:
 * - date / boekdatum / datum
 * - grootboeknummer / account_number
 * - omschrijving
 * - debet
 * - credit
 * - btw_code (optional)
 * - btw_bedrag (optional)
 */
export function parseBoekingsregelsExcel(
  file: File,
  sheetName?: string,
  columnMapping?: ColumnMapping
): Promise<ExcelParseResult<InsertTables<'boekingsregels'>>> {
  return new Promise((resolve) => {
    const reader = new FileReader()
    const errors: string[] = []
    const warnings: string[] = []
    const regels: InsertTables<'boekingsregels'>[] = []

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer)
        const workbook = XLSX.read(data, { type: 'array' })

        // Get sheet names for result
        const allSheetNames = workbook.SheetNames
        
        // Use specified sheet or first sheet
        const targetSheet = sheetName || allSheetNames[0]
        if (!allSheetNames.includes(targetSheet)) {
          errors.push(`Sheet "${targetSheet}" niet gevonden. Beschikbare sheets: ${allSheetNames.join(', ')}`)
          return resolve({ success: false, data: [], errors, warnings, sheetNames: allSheetNames })
        }

        const worksheet = workbook.Sheets[targetSheet]
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { raw: false })

        if (jsonData.length === 0) {
          errors.push('Excel bestand is leeg of heeft geen data')
          return resolve({ success: false, data: [], errors, warnings })
        }

        // Normalize column names (use mapping if provided, otherwise use default normalization)
        const normalizeKey = (key: string): string => {
          // If column mapping is provided, use it
          if (columnMapping && columnMapping[key]) {
            return columnMapping[key]
          }

          // Otherwise use default normalization
          const lower = key.toLowerCase().trim()
          const mappings: Record<string, string> = {
            'datum': 'boekdatum',
            'date': 'boekdatum',
            'boekdatum': 'boekdatum',
            'grootboeknummer': 'account_number',
            'rekeningnummer': 'account_number',
            'account_number': 'account_number',
            'omschrijving': 'omschrijving',
            'description': 'omschrijving',
            'debet': 'debet',
            'debit': 'debet',
            'credit': 'credit',
            'btw_code': 'btw_code',
            'btwcode': 'btw_code',
            'btw_bedrag': 'btw_bedrag',
            'btwbedrag': 'btw_bedrag',
            'btw': 'btw_bedrag',
            'factuurnummer': 'factuurnummer',
            'factuur': 'factuurnummer',
            'relatie': 'relatie',
            'tegenhrekening': 'tegenhrekening',
          }
          return mappings[lower] || lower
        }

        // Track last valid date for auto-fill
        let lastValidDate: string | null = null

        jsonData.forEach((row: any, index: number) => {
          const normalizedRow: any = {}
          Object.keys(row).forEach((key) => {
            normalizedRow[normalizeKey(key)] = row[key]
          })

          // Skip completely empty rows
          const isEmptyRow = !normalizedRow.boekdatum && 
                            !normalizedRow.account_number && 
                            !normalizedRow.omschrijving &&
                            !normalizedRow.debet &&
                            !normalizedRow.credit
          
          if (isEmptyRow) {
            warnings.push(`Rij ${index + 2}: Lege rij overgeslagen`)
            return
          }

          // Auto-fill date if missing (use last valid date or today)
          if (!normalizedRow.boekdatum) {
            if (lastValidDate) {
              normalizedRow.boekdatum = lastValidDate
              warnings.push(`Rij ${index + 2}: Datum ontbreekt, gebruikt datum van vorige regel (${lastValidDate})`)
            } else {
              // Use today's date as fallback
              const today = new Date().toISOString().split('T')[0]
              normalizedRow.boekdatum = today
              warnings.push(`Rij ${index + 2}: Datum ontbreekt, gebruikt vandaag (${today})`)
            }
          } else {
            // Store valid date for next rows
            lastValidDate = String(normalizedRow.boekdatum).trim()
          }

          if (!normalizedRow.account_number) {
            errors.push(`Rij ${index + 2}: Grootboeknummer ontbreekt`)
            return
          }

          if (!normalizedRow.omschrijving) {
            errors.push(`Rij ${index + 2}: Omschrijving ontbreekt`)
            return
          }

          // Parse date using improved parser
          const parsedDate = parseDate(normalizedRow.boekdatum)
          if (!parsedDate) {
            errors.push(`Rij ${index + 2}: Ongeldige datum "${normalizedRow.boekdatum}"`)
            return
          }
          const boekdatum = parsedDate

          // Parse amounts using improved parser
          const debet = parseNumber(normalizedRow.debet)
          const credit = parseNumber(normalizedRow.credit)

          if (debet === 0 && credit === 0) {
            warnings.push(`Rij ${index + 2}: Zowel debet als credit zijn 0`)
          }

          if (debet > 0 && credit > 0) {
            errors.push(`Rij ${index + 2}: Zowel debet als credit zijn ingevuld`)
            return
          }

          // Normalize BTW code
          let btwCode = normalizedRow.btw_code || null
          if (btwCode) {
            const btwCodeMap: Record<string, string> = {
              'oh': '1a',
              'ol': '1b',
              'ov': '1e',
              'vh': '5b',
              'vl': '5b-laag',
              '0': 'geen',
              'geen': 'geen',
            }
            const normalized = String(btwCode).toLowerCase().trim()
            if (btwCodeMap[normalized]) {
              btwCode = btwCodeMap[normalized]
            }
          }

          const btwBedrag = parseNumber(normalizedRow.btw_bedrag)

          const regel: any = {
            boekdatum: boekdatum.toISOString().split('T')[0],
            account_number: String(normalizedRow.account_number).trim(),
            omschrijving: String(normalizedRow.omschrijving).trim(),
            debet,
            credit,
            btw_code: btwCode,
            btw_bedrag: btwBedrag,
            factuurnummer: normalizedRow.factuurnummer || null,
            relatie: normalizedRow.relatie || null,
            tegenhrekening: normalizedRow.tegenhrekening || null,
            periode: boekdatum.getMonth() + 1,
            jaar: boekdatum.getFullYear(),
          }

          regels.push(regel)
        })

        resolve({
          success: errors.length === 0,
          data: regels,
          errors,
          warnings,
          sheetNames: allSheetNames,
        })
      } catch (error: any) {
        errors.push(`Fout bij lezen van Excel bestand: ${error.message}`)
        resolve({ success: false, data: [], errors, warnings })
      }
    }

    reader.onerror = () => {
      errors.push('Fout bij lezen van bestand')
      resolve({ success: false, data: [], errors, warnings })
    }

    reader.readAsArrayBuffer(file)
  })
}

