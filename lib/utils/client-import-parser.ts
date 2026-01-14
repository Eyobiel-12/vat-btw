/**
 * Client Import Parser
 * Parses Excel files to extract client data (name and email)
 */

import * as XLSX from 'xlsx'

export interface ClientImportData {
  name: string
  email: string | null
  company_name?: string | null
}

export interface ClientImportResult {
  success: boolean
  data: ClientImportData[]
  errors: string[]
  warnings: string[]
  totalRows: number
  validRows: number
}

/**
 * Normalize column names for flexible matching
 */
function normalizeKey(key: string): string {
  const normalized = key.toLowerCase().trim()
  const mappings: Record<string, string> = {
    'naam kvk': 'name',
    'naam': 'name',
    'name': 'name',
    'klant naam': 'name',
    'bedrijfsnaam': 'name',
    'company name': 'name',
    'e-mail': 'email',
    'email': 'email',
    'e-mailadres': 'email',
    'emailadres': 'email',
    'mail': 'email',
  }
  return mappings[normalized] || normalized
}

/**
 * Parse client data from Excel file
 * Expected columns: "Naam KVK" and "E-mail"
 */
export function parseClientImportExcel(file: File): Promise<ClientImportResult> {
  return new Promise((resolve) => {
    const reader = new FileReader()
    const errors: string[] = []
    const warnings: string[] = []
    const clients: ClientImportData[] = []

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer)
        const workbook = XLSX.read(data, { type: 'array' })

        // Use first sheet
        const sheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[sheetName]

        // Convert to JSON
        const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' }) as any[][]

        if (rows.length === 0) {
          errors.push('Het bestand bevat geen data')
          resolve({ success: false, data: [], errors, warnings, totalRows: 0, validRows: 0 })
          return
        }

        // First row is headers
        const headers = rows[0] as string[]
        const headerMap: Record<string, number> = {}

        // Map headers to column indices
        headers.forEach((header, index) => {
          const normalized = normalizeKey(header)
          if (normalized === 'name' || normalized === 'email') {
            headerMap[normalized] = index
          }
        })

        // Check if required columns exist
        if (headerMap['name'] === undefined) {
          errors.push('Kolom "Naam KVK" of "Naam" niet gevonden')
        }
        if (headerMap['email'] === undefined) {
          warnings.push('Kolom "E-mail" niet gevonden - e-mailadressen worden niet geïmporteerd')
        }

        // Process data rows (skip header row)
        let totalRows = 0
        let validRows = 0

        for (let i = 1; i < rows.length; i++) {
          const row = rows[i]
          totalRows++

          // Skip completely empty rows
          if (row.every((cell: any) => !cell || String(cell).trim() === '')) {
            continue
          }

          const name = headerMap['name'] !== undefined ? String(row[headerMap['name']] || '').trim() : ''
          const email = headerMap['email'] !== undefined ? String(row[headerMap['email']] || '').trim() : ''

          // Name is required
          if (!name || name.length === 0) {
            warnings.push(`Rij ${i + 1}: Naam ontbreekt, overgeslagen`)
            continue
          }

          // Validate email if provided
          let validEmail: string | null = null
          if (email && email.length > 0) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
            if (emailRegex.test(email)) {
              validEmail = email
            } else {
              warnings.push(`Rij ${i + 1}: Ongeldig e-mailadres "${email}", overgeslagen`)
            }
          }

          // Use name as company_name if it looks like a company name
          const companyName = name.includes('BV') || name.includes('VOF') || name.includes('B.V.') || name.includes('N.V.') 
            ? name 
            : null

          clients.push({
            name,
            email: validEmail,
            company_name: companyName,
          })

          validRows++
        }

        if (clients.length === 0) {
          errors.push('Geen geldige klanten gevonden in het bestand')
        }

        resolve({
          success: errors.length === 0,
          data: clients,
          errors,
          warnings,
          totalRows,
          validRows,
        })
      } catch (error: any) {
        errors.push(`Fout bij lezen van bestand: ${error.message || 'Onbekende fout'}`)
        resolve({ success: false, data: [], errors, warnings, totalRows: 0, validRows: 0 })
      }
    }

    reader.onerror = () => {
      errors.push('Fout bij lezen van bestand')
      resolve({ success: false, data: [], errors, warnings, totalRows: 0, validRows: 0 })
    }

    reader.readAsArrayBuffer(file)
  })
}

