/**
 * Invoice OCR and Data Extraction
 * Extracts data from invoice images/PDFs using OCR
 */

import { createWorker } from "tesseract.js"

export interface ExtractedInvoiceData {
  invoiceNumber?: string
  date?: string
  totalAmount?: number
  vatAmount?: number
  vatRate?: number
  supplierName?: string
  lineItems?: Array<{
    description: string
    quantity?: number
    unitPrice?: number
    total?: number
    vatRate?: number
  }>
  rawText: string
}

/**
 * Extract text from image using OCR
 */
export async function extractTextFromImage(imageFile: File): Promise<string> {
  let worker
  try {
    // Create worker with Dutch language and better settings
    worker = await createWorker("nld", 1, {
      logger: (m) => {
        // Only log progress in development
        if (process.env.NODE_ENV === 'development' && m.status === 'recognizing text') {
          console.log(`OCR Progress: ${Math.round(m.progress * 100)}%`)
        }
      }
    })
    
    // Set parameters for better accuracy
    await worker.setParameters({
      tessedit_pageseg_mode: '1', // Automatic page segmentation with OSD
      tessedit_char_whitelist: '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz€.,-/:() ',
    })
    
    const { data } = await worker.recognize(imageFile)
    await worker.terminate()
    
    if (!data.text || data.text.trim().length < 10) {
      throw new Error('OCR kon geen tekst extraheren uit de afbeelding. Zorg ervoor dat de afbeelding duidelijk en leesbaar is.')
    }
    
    return data.text
  } catch (error: any) {
    if (worker) {
      await worker.terminate()
    }
    if (error.message) {
      throw error
    }
    throw new Error(`OCR fout: ${error.message || 'Onbekende fout bij tekst extractie'}`)
  }
}

/**
 * Parse Dutch/European number format
 * Handles both Dutch (4.104,93) and English (4104.93) formats
 */
function parseAmount(str: string): number {
  // Remove currency symbols and whitespace
  let cleaned = str.replace(/[€$£\s]/g, '').trim()
  
  // Dutch format: 4.104,93 (period = thousands, comma = decimal)
  // English format: 4104.93 (period = decimal)
  const hasComma = cleaned.includes(',')
  const hasPeriod = cleaned.includes('.')
  
  if (hasComma && hasPeriod) {
    // Dutch format: 4.104,93
    // Last comma is decimal separator
    const lastCommaIndex = cleaned.lastIndexOf(',')
    const beforeComma = cleaned.substring(0, lastCommaIndex).replace(/\./g, '')
    const afterComma = cleaned.substring(lastCommaIndex + 1)
    return parseFloat(`${beforeComma}.${afterComma}`)
  } else if (hasComma && !hasPeriod) {
    // Could be Dutch (comma as decimal) or thousands separator
    // If comma is followed by 2 digits, it's likely decimal
    const commaIndex = cleaned.indexOf(',')
    const afterComma = cleaned.substring(commaIndex + 1)
    if (afterComma.length === 2) {
      // Likely decimal: 4104,93
      return parseFloat(cleaned.replace(',', '.'))
    } else {
      // Likely thousands: 4,104
      return parseFloat(cleaned.replace(/,/g, ''))
    }
  } else if (hasPeriod && !hasComma) {
    // Could be English decimal or thousands
    // If period is followed by 2 digits, it's likely decimal
    const periodIndex = cleaned.indexOf('.')
    const afterPeriod = cleaned.substring(periodIndex + 1)
    if (afterPeriod.length === 2) {
      // Likely decimal: 4104.93
      return parseFloat(cleaned)
    } else {
      // Likely thousands: 4.104
      return parseFloat(cleaned.replace(/\./g, ''))
    }
  } else {
    // No separators, just digits
    return parseFloat(cleaned)
  }
}

/**
 * Smart extraction of invoice data from OCR text
 * Understands Dutch invoice formats and tax system
 */
export function extractInvoiceDataFromText(text: string): ExtractedInvoiceData {
  const result: ExtractedInvoiceData = {
    rawText: text,
  }

  // Normalize text
  const normalizedText = text.toLowerCase().replace(/\s+/g, " ")

  // Extract invoice number (common patterns - improved for Dutch invoices)
  const invoiceNumberPatterns = [
    /factuurnummer[:\s]+([a-z0-9\-_\/]+)/i,
    /invoice[:\s]+([a-z0-9\-_\/]+)/i,
    /factuur[:\s]+([a-z0-9\-_\/]+)/i,
    /nr[.\s:]+([a-z0-9\-_\/]+)/i,
    /nummer[:\s]+([a-z0-9\-_\/]+)/i,
    /(?:factuur|invoice|nr)[:\s]*([a-z]{2,4}\d{4}[-_\/]\d{1,2}[-_\/]\d{3,})/i, // Pattern like FY2025-05-006
    /(?:factuur|invoice|nr)[:\s]*([a-z0-9]{3,}[-_\/]\d{4}[-_\/]\d{1,2}[-_\/]\d{2,})/i, // Various formats
  ]

  for (const pattern of invoiceNumberPatterns) {
    const match = text.match(pattern)
    if (match && match[1]) {
      result.invoiceNumber = match[1].trim()
      break
    }
  }
  
  // If still not found, look for common invoice number patterns in the text
  if (!result.invoiceNumber) {
    const standalonePatterns = [
      /(?:^|\s)([A-Z]{2,4}\d{4}[-_\/]\d{1,2}[-_\/]\d{2,})/i, // FY2025-05-006
      /(?:^|\s)([A-Z]{2,4}[-_\/]\d{4}[-_\/]\d{1,2}[-_\/]\d{2,})/i,
      /(?:^|\s)(FACT[-_]?\d{4,})/i, // FACT-2026-001
      /(?:^|\s)(INV[-_]?\d{4,})/i, // INV-2026-001
    ]
    
    for (const pattern of standalonePatterns) {
      const match = text.match(pattern)
      if (match && match[1] && match[1].length >= 6) {
        result.invoiceNumber = match[1].trim()
        break
      }
    }
  }

  // Extract date (Dutch formats - improved to handle single digit months/days)
  const datePatterns = [
    /factuurdatum[:\s]+(\d{1,2})[-\/](\d{1,2})[-\/](\d{4})/i,
    /datum[:\s]+(\d{1,2})[-\/](\d{1,2})[-\/](\d{4})/i,
    /date[:\s]+(\d{1,2})[-\/](\d{1,2})[-\/](\d{4})/i,
    /(\d{1,2})[-\/](\d{1,2})[-\/](\d{4})/g, // DD-M-YYYY or DD-MM-YYYY
    /(\d{4})[-\/](\d{1,2})[-\/](\d{1,2})/g, // YYYY-MM-DD or YYYY-M-DD
  ]

  // Try to find date near "factuurdatum" or "datum" first
  for (const pattern of datePatterns.slice(0, 3)) {
    const match = text.match(pattern)
    if (match) {
      const day = parseInt(match[1])
      const month = parseInt(match[2])
      const year = parseInt(match[3])
      
      // Validate reasonable date values
      if (day >= 1 && day <= 31 && month >= 1 && month <= 12 && year >= 2000 && year <= 2100) {
        result.date = `${year}-${month.toString().padStart(2, "0")}-${day.toString().padStart(2, "0")}`
        break
      }
    }
  }
  
  // If not found, try general date patterns
  if (!result.date) {
    const allDates = text.match(/(\d{1,2})[-\/](\d{1,2})[-\/](\d{4})/g) || []
    for (const dateStr of allDates) {
      const match = dateStr.match(/(\d{1,2})[-\/](\d{1,2})[-\/](\d{4})/)
      if (match) {
        const day = parseInt(match[1])
        const month = parseInt(match[2])
        const year = parseInt(match[3])
        
        // Prefer dates that look like invoice dates (not too far in past/future)
        if (day >= 1 && day <= 31 && month >= 1 && month <= 12 && year >= 2020 && year <= 2030) {
          result.date = `${year}-${month.toString().padStart(2, "0")}-${day.toString().padStart(2, "0")}`
          break
        }
      }
    }
  }

  // Extract subtotal first (to exclude it from total search)
  let subtotalAmount: number | null = null
  const subtotalPatterns = [
    /subtotaal[:\s]*€?\s*([\d.,]+)/i,
    /subtotal[:\s]*€?\s*([\d.,]+)/i,
  ]
  
  for (const pattern of subtotalPatterns) {
    const match = text.match(pattern)
    if (match && match[1]) {
      const amount = parseAmount(match[1])
      if (!isNaN(amount) && amount > 0) {
        subtotalAmount = amount
        break
      }
    }
  }

  // Extract total amount (look for "totaal", "totaal incl. btw", etc. - improved)
  const totalPatterns = [
    /totaal[:\s]*€?\s*([\d.,]+)/i,
    /totaal\s+(?:incl\.?\s+)?btw[:\s]*€?\s*([\d.,]+)/i,
    /totaalbedrag[:\s]*€?\s*([\d.,]+)/i,
    /eindtotaal[:\s]*€?\s*([\d.,]+)/i,
    /totaal\s+te\s+betalen[:\s]*€?\s*([\d.,]+)/i,
    /€\s*([\d.,]+)\s*(?:totaal|eindtotaal)/i, // Euro symbol before amount
  ]

  // Try patterns in order, prefer "totaal" without "subtotaal"
  for (const pattern of totalPatterns) {
    const matches = [...text.matchAll(new RegExp(pattern.source, 'gi'))]
    for (const match of matches) {
      // Skip if it's "subtotaal"
      const context = text.substring(Math.max(0, match.index! - 20), match.index! + match[0].length + 20).toLowerCase()
      if (context.includes('subtotaal') || context.includes('subtotal')) {
        continue
      }
      
      if (match[1]) {
        const amount = parseAmount(match[1])
        if (!isNaN(amount) && amount > 0) {
          // If we found a subtotal, make sure total is larger
          if (subtotalAmount && amount <= subtotalAmount) {
            continue
          }
          result.totalAmount = amount
          break
        }
      }
    }
    if (result.totalAmount) break
  }
  
  // If we have subtotal but no total, use subtotal + VAT as total
  if (!result.totalAmount && subtotalAmount && result.vatAmount) {
    result.totalAmount = subtotalAmount + result.vatAmount
  }
  
  // If we have both subtotal and total, validate and correct VAT
  if (subtotalAmount && result.totalAmount) {
    const calculatedVat = result.totalAmount - subtotalAmount
    // If we don't have VAT amount yet, use calculated
    if (!result.vatAmount) {
      result.vatAmount = calculatedVat
    } else {
      // Validate: if extracted VAT is very different from calculated, use calculated
      // Allow 5% tolerance for rounding differences
      const tolerance = calculatedVat * 0.05
      if (Math.abs(result.vatAmount - calculatedVat) > tolerance) {
        // Extracted VAT seems wrong, use calculated
        result.vatAmount = calculatedVat
      }
    }
  }
  
  // If still not found, look for the largest amount that might be total
  if (!result.totalAmount) {
    const amountMatches = [...text.matchAll(/€\s*([\d.,]+)/gi)]
    const amounts = amountMatches
      .map(m => {
        const amt = parseAmount(m[1])
        return { amount: amt, match: m[0] }
      })
      .filter(a => !isNaN(a.amount) && a.amount > 0)
      .sort((a, b) => b.amount - a.amount)
    
    // Take the largest amount that's not clearly a line item
    if (amounts.length > 0) {
      result.totalAmount = amounts[0].amount
    }
  }

  // Extract VAT amount (look for "btw", "omzetbelasting", etc. - improved)
  const vatPatterns = [
    /btw\s*\(?\d+%\)?[:\s]*€?\s*([\d.,]+)/i, // BTW (21%): €712.43 - PREFERRED
    /btw[:\s]*€?\s*([\d.,]+)/i,
    /omzetbelasting[:\s]*€?\s*([\d.,]+)/i,
    /belasting[:\s]*€?\s*([\d.,]+)/i,
    /vat[:\s]*€?\s*([\d.,]+)/i,
    /€\s*([\d.,]+)\s*(?:btw|omzetbelasting)/i, // Euro symbol before amount
  ]

  // Try patterns, prefer ones with percentage
  for (const pattern of vatPatterns) {
    const matches = [...text.matchAll(new RegExp(pattern.source, 'gi'))]
    for (const match of matches) {
      // Skip if it's part of a company name or address
      const context = text.substring(Math.max(0, match.index! - 10), match.index! + match[0].length + 10).toLowerCase()
      if (context.includes('kvk') || context.includes('btw-nr') || context.includes('btw nummer')) {
        continue
      }
      
      if (match[1]) {
        const amount = parseAmount(match[1])
        // VAT amount should be less than total and typically less than subtotal
        // Also, VAT is usually much smaller than the base amount (9% or 21%)
        if (!isNaN(amount) && amount > 0 && amount < (result.totalAmount || Infinity)) {
          // Additional validation: VAT should be reasonable (not more than 30% of total)
          if (result.totalAmount && amount < result.totalAmount * 0.3) {
            result.vatAmount = amount
            break
          } else if (!result.totalAmount) {
            result.vatAmount = amount
            break
          }
        }
      }
    }
    if (result.vatAmount) break
  }
  
  // Also try to extract VAT percentage and calculate if we have total
  if (!result.vatAmount && result.totalAmount) {
    const vatRateMatch = text.match(/btw\s*\(?(\d+)%\)?/i)
    if (vatRateMatch) {
      const vatRate = parseFloat(vatRateMatch[1])
      if (!isNaN(vatRate) && vatRate > 0 && vatRate <= 25) {
        const calculatedBase = result.totalAmount / (1 + vatRate / 100)
        const calculatedVat = result.totalAmount - calculatedBase
        result.vatAmount = calculatedVat
        result.vatRate = vatRate
      }
    }
  }

  // Validate and correct if VAT amount seems wrong
  if (result.totalAmount && result.vatAmount && subtotalAmount) {
    // If we have subtotal, VAT should be total - subtotal
    const calculatedVat = result.totalAmount - subtotalAmount
    // If extracted VAT is way off (more than 5% difference), use calculated VAT
    const tolerance = Math.max(calculatedVat * 0.05, 1) // At least 1 euro tolerance
    if (Math.abs(result.vatAmount - calculatedVat) > tolerance) {
      // Extracted VAT doesn't match - use calculated VAT
      result.vatAmount = calculatedVat
    }
  } else if (result.totalAmount && result.vatAmount) {
    // Validate VAT is reasonable (should be less than 30% of total for Dutch rates)
    // If VAT is more than 30% of total, it's likely swapped with base amount
    if (result.vatAmount > result.totalAmount * 0.3) {
      // VAT seems too high - might be swapped with base amount
      // Try to calculate from 21% rate (most common)
      const calculatedBase = result.totalAmount / 1.21
      const calculatedVat = result.totalAmount - calculatedBase
      // If calculated VAT is much smaller (less than half), use it
      if (calculatedVat < result.vatAmount * 0.5) {
        result.vatAmount = calculatedVat
      }
    }
  }

  // Calculate VAT rate if we have total and VAT amount
  if (result.totalAmount && result.vatAmount) {
    const baseAmount = result.totalAmount - result.vatAmount
    if (baseAmount > 0) {
      result.vatRate = (result.vatAmount / baseAmount) * 100
      // Round to nearest standard rate (9% or 21%)
      if (result.vatRate >= 8 && result.vatRate <= 10) {
        result.vatRate = 9
      } else if (result.vatRate >= 19 && result.vatRate <= 22) {
        result.vatRate = 21
      }
    }
  }

  // Extract supplier name (usually at top of invoice - improved for Dutch companies)
  const supplierPatterns = [
    /^([A-Z][A-Z\s&]+(?:B\.?V\.?|N\.?V\.?|V\.?O\.?F\.?|BEDRIJF|EENMANSZAAK))/m, // Company name at start
    /([A-Z][A-Z\s&]{3,}(?:B\.?V\.?|N\.?V\.?|V\.?O\.?F\.?|BEDRIJF))/i, // Any company name
    /leverancier[:\s]+([A-Z][A-Z\s&]+)/i,
    /supplier[:\s]+([A-Z][A-Z\s&]+)/i,
  ]

  for (const pattern of supplierPatterns) {
    const match = text.match(pattern)
    if (match && match[1]) {
      const name = match[1].trim()
      // Filter out common false positives
      if (name.length > 5 && !name.match(/^(FACTUUR|INVOICE|KLANT|CLIENT)/i)) {
        result.supplierName = name
        break
      }
    }
  }
  
  // If not found, look for company names in first few lines
  if (!result.supplierName) {
    const lines = text.split('\n').slice(0, 10)
    for (const line of lines) {
      const companyMatch = line.match(/([A-Z][A-Z\s&]{5,}(?:B\.?V\.?|N\.?V\.?|V\.?O\.?F\.?|BEDRIJF))/)
      if (companyMatch && companyMatch[1]) {
        const name = companyMatch[1].trim()
        if (name.length > 5 && !name.includes('FACTUUR') && !name.includes('INVOICE')) {
          result.supplierName = name
          break
        }
      }
    }
  }

  // Extract line items (look for itemized lists)
  const lines = text.split("\n").filter((line) => line.trim().length > 0)
  const lineItems: ExtractedInvoiceData["lineItems"] = []

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    // Look for lines with amounts (likely line items)
    const amountMatch = line.match(/([\d.,]+)\s*€/)
    if (amountMatch) {
      const description = line.replace(/[\d.,€]+/g, "").trim()
      if (description.length > 3) {
        // Extract quantity, price if available
        const numbers = line.match(/[\d.,]+/g)
        if (numbers && numbers.length >= 1) {
          const total = parseFloat(numbers[numbers.length - 1].replace(/\./g, "").replace(",", "."))
          lineItems.push({
            description,
            total: !isNaN(total) ? total : undefined,
          })
        }
      }
    }
  }

  if (lineItems.length > 0) {
    result.lineItems = lineItems
  }

  return result
}

/**
 * Convert extracted invoice data to boekingsregels
 */
export function convertInvoiceToBoekingsregels(
  extractedData: ExtractedInvoiceData,
  clientId: string,
  defaultAccountNumber: string = "4300"
): Array<{
  boekdatum: string
  account_number: string
  omschrijving: string
  debet: number
  credit: number
  btw_code: string | null
  btw_bedrag: number | null
  factuurnummer: string | null
}> {
  const regels: Array<{
    boekdatum: string
    account_number: string
    omschrijving: string
    debet: number
    credit: number
    btw_code: string | null
    btw_bedrag: number | null
    factuurnummer: string | null
  }> = []

  if (!extractedData.totalAmount) {
    return regels
  }

  const date = extractedData.date || new Date().toISOString().split("T")[0]
  const invoiceNumber = extractedData.invoiceNumber || null
  
  // Calculate amounts correctly
  // If we have both total and VAT, base = total - VAT
  // If we have total and rate, calculate VAT and base
  // If we only have total, estimate (most Dutch invoices are 21%)
  let baseAmount = 0
  let vatAmount = 0
  let btwCode: string | null = null
  
  if (extractedData.totalAmount) {
    if (extractedData.vatAmount && extractedData.vatAmount > 0) {
      // We have both total and VAT amount - calculate base
      baseAmount = extractedData.totalAmount - extractedData.vatAmount
      vatAmount = extractedData.vatAmount
    } else if (extractedData.vatRate && extractedData.vatRate > 0) {
      // We have total and rate - calculate base and VAT
      baseAmount = extractedData.totalAmount / (1 + extractedData.vatRate / 100)
      vatAmount = extractedData.totalAmount - baseAmount
    } else {
      // Only total - assume 21% VAT (most common in Netherlands)
      const estimatedRate = 21
      baseAmount = extractedData.totalAmount / (1 + estimatedRate / 100)
      vatAmount = extractedData.totalAmount - baseAmount
    }
  } else {
    // No total amount - cannot process
    return regels
  }
  
  // Determine BTW code based on VAT rate
  if (extractedData.vatRate) {
    // Dutch standard rates: 21% (hoog) or 9% (laag)
    if (extractedData.vatRate >= 20 && extractedData.vatRate <= 22) {
      btwCode = "5b" // Voorbelasting hoog (21%)
    } else if (extractedData.vatRate >= 8 && extractedData.vatRate <= 10) {
      btwCode = "5b-laag" // Voorbelasting laag (9%)
    }
  } else if (vatAmount > 0 && baseAmount > 0) {
    // Calculate rate from amounts
    const calculatedRate = (vatAmount / baseAmount) * 100
    // Round to nearest standard Dutch rate
    if (calculatedRate >= 20 && calculatedRate <= 22) {
      btwCode = "5b" // High rate (21%)
    } else if (calculatedRate >= 8 && calculatedRate <= 10) {
      btwCode = "5b-laag" // Low rate (9%)
    } else if (calculatedRate > 0) {
      // If rate doesn't match standard, use high rate as default (most common)
      btwCode = "5b"
    }
  }
  
  // If still no BTW code but we have VAT, default to high rate
  if (!btwCode && vatAmount > 0) {
    btwCode = "5b"
  }

  // Main expense entry (debet) - base amount excl. VAT
  // Note: BTW bedrag is 0 here because BTW is accounted for in separate BTW entry (1900)
  regels.push({
    boekdatum: date,
    account_number: defaultAccountNumber,
    omschrijving: extractedData.supplierName
      ? `Factuur ${invoiceNumber || ""} - ${extractedData.supplierName}`.trim()
      : `Factuur ${invoiceNumber || "onbekend"}`.trim(),
    debet: baseAmount,
    credit: 0,
    btw_code: btwCode, // Assign BTW code to expense entry for BTW calculation
    btw_bedrag: null, // BTW is in separate entry (1900), so no BTW bedrag here
    factuurnummer: invoiceNumber,
  })

  // VAT entry (debet - voorbelasting) - Create if we have VAT amount and BTW code
  if (vatAmount > 0 && btwCode) {
    regels.push({
      boekdatum: date,
      account_number: "1900", // Te vorderen BTW
      omschrijving: `BTW voorbelasting op factuur ${invoiceNumber || ""}`.trim(),
      debet: vatAmount,
      credit: 0,
      btw_code: btwCode,
      btw_bedrag: vatAmount,
      factuurnummer: invoiceNumber,
    })
  }

  // Credit entry (usually bank or creditors)
  regels.push({
    boekdatum: date,
    account_number: "2000", // Bank (or could be creditors)
    omschrijving: `Te betalen factuur ${invoiceNumber || ""}`.trim(),
    debet: 0,
    credit: extractedData.totalAmount,
    btw_code: null, // Credit side doesn't need BTW code
    btw_bedrag: null,
    factuurnummer: invoiceNumber,
  })

  return regels
}

/**
 * Process invoice file (image or PDF) and extract data
 */
export async function processInvoiceFile(file: File): Promise<ExtractedInvoiceData> {
  // For now, only handle images
  // PDF support would require additional libraries
  if (!file.type.startsWith("image/")) {
    throw new Error("Alleen afbeeldingen worden ondersteund. PDF ondersteuning komt binnenkort.")
  }

  try {
    const text = await extractTextFromImage(file)
    
    // Log extracted text for debugging (only in development)
    if (process.env.NODE_ENV === 'development') {
      console.log('OCR Extracted Text:', text.substring(0, 500))
    }
    
    const extractedData = extractInvoiceDataFromText(text)
    
    // Log extracted data for debugging
    if (process.env.NODE_ENV === 'development') {
      console.log('Extracted Invoice Data:', {
        invoiceNumber: extractedData.invoiceNumber,
        date: extractedData.date,
        totalAmount: extractedData.totalAmount,
        vatAmount: extractedData.vatAmount,
        vatRate: extractedData.vatRate,
        supplierName: extractedData.supplierName,
      })
    }
    
    return extractedData
  } catch (error: any) {
    console.error('OCR Processing Error:', error)
    throw new Error(`OCR fout: ${error.message || 'Onbekende fout bij verwerken van afbeelding'}`)
  }
}

