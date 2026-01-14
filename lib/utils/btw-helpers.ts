/**
 * Smart BTW Helper Functions
 * Dutch VAT calculation utilities for boekhouders
 */

export interface BTWCodeInfo {
  code: string
  description: string
  percentage: number
  rubriek: string
  type: 'verschuldigd' | 'voorbelasting' | 'verlegd' | 'geen'
}

/**
 * Standard Dutch BTW codes
 */
export const BTW_CODES: Record<string, BTWCodeInfo> = {
  '1a': {
    code: '1a',
    description: 'Leveringen/diensten belast met hoog tarief',
    percentage: 21.0,
    rubriek: '1a',
    type: 'verschuldigd',
  },
  '1b': {
    code: '1b',
    description: 'Leveringen/diensten belast met laag tarief',
    percentage: 9.0,
    rubriek: '1b',
    type: 'verschuldigd',
  },
  '1c': {
    code: '1c',
    description: 'Leveringen/diensten belast met overige tarieven',
    percentage: 0.0,
    rubriek: '1c',
    type: 'verschuldigd',
  },
  '1d': {
    code: '1d',
    description: 'Privégebruik',
    percentage: 21.0,
    rubriek: '1d',
    type: 'verschuldigd',
  },
  '1e': {
    code: '1e',
    description: 'Leveringen/diensten belast met 0% of niet bij u belast',
    percentage: 0.0,
    rubriek: '1e',
    type: 'geen',
  },
  '2a': {
    code: '2a',
    description: 'Leveringen naar landen buiten de EU',
    percentage: 0.0,
    rubriek: '2a',
    type: 'geen',
  },
  '3a': {
    code: '3a',
    description: 'Leveringen naar landen binnen de EU',
    percentage: 0.0,
    rubriek: '3a',
    type: 'geen',
  },
  '3b': {
    code: '3b',
    description: 'Diensten naar landen binnen de EU',
    percentage: 0.0,
    rubriek: '3b',
    type: 'geen',
  },
  '4a': {
    code: '4a',
    description: 'Leveringen uit landen buiten de EU',
    percentage: 21.0,
    rubriek: '4a',
    type: 'verlegd',
  },
  '4b': {
    code: '4b',
    description: 'Leveringen uit landen binnen de EU',
    percentage: 21.0,
    rubriek: '4b',
    type: 'verlegd',
  },
  '5b': {
    code: '5b',
    description: 'Voorbelasting hoog tarief',
    percentage: 21.0,
    rubriek: '5b',
    type: 'voorbelasting',
  },
  '5b-laag': {
    code: '5b-laag',
    description: 'Voorbelasting laag tarief',
    percentage: 9.0,
    rubriek: '5b',
    type: 'voorbelasting',
  },
  'geen': {
    code: 'geen',
    description: 'Geen BTW',
    percentage: 0.0,
    rubriek: 'geen',
    type: 'geen',
  },
}

/**
 * Calculate BTW amount from base amount and BTW code
 * Uses Dutch rounding rules (round to nearest cent)
 */
export function calculateBTWAmount(baseAmount: number, btwCode: string | null): number {
  if (!btwCode || btwCode === 'geen' || btwCode === '0') {
    return 0
  }

  const codeInfo = BTW_CODES[btwCode]
  if (!codeInfo) {
    return 0
  }

  // Calculate BTW: base * percentage / 100
  const btwAmount = (baseAmount * codeInfo.percentage) / 100

  // Round to 2 decimals (Dutch accounting standard)
  return Math.round(btwAmount * 100) / 100
}

/**
 * Calculate base amount from total amount including BTW
 */
export function calculateBaseFromTotal(totalAmount: number, btwCode: string | null): number {
  if (!btwCode || btwCode === 'geen' || btwCode === '0') {
    return totalAmount
  }

  const codeInfo = BTW_CODES[btwCode]
  if (!codeInfo) {
    return totalAmount
  }

  // Base = Total / (1 + percentage/100)
  const baseAmount = totalAmount / (1 + codeInfo.percentage / 100)

  // Round to 2 decimals
  return Math.round(baseAmount * 100) / 100
}

/**
 * Validate boekingsregel according to Dutch accounting rules
 */
export interface BoekingsregelValidation {
  isValid: boolean
  errors: string[]
  warnings: string[]
}

export function validateBoekingsregel(data: {
  debet: number
  credit: number
  btw_code: string | null
  btw_bedrag: number
  account_number: string
  account_type?: string
}): BoekingsregelValidation {
  const errors: string[] = []
  const warnings: string[] = []

  // Rule 1: Exactly one of debet or credit must be filled (not both, not neither)
  const hasDebet = data.debet > 0
  const hasCredit = data.credit > 0

  if (hasDebet && hasCredit) {
    errors.push('Een boekingsregel kan niet zowel debet als credit hebben')
  }
  if (!hasDebet && !hasCredit) {
    errors.push('Een boekingsregel moet debet of credit hebben')
  }

  // Rule 2: BTW code validation
  if (data.btw_code && !BTW_CODES[data.btw_code]) {
    errors.push(`Ongeldige BTW-code: ${data.btw_code}`)
  }

  // Rule 3: BTW bedrag should match calculated BTW
  if (data.btw_code && data.btw_code !== 'geen' && data.btw_code !== '0') {
    const baseAmount = hasDebet ? data.debet : data.credit
    const calculatedBTW = calculateBTWAmount(baseAmount, data.btw_code)

    // Allow small rounding differences (0.01)
    if (Math.abs(data.btw_bedrag - calculatedBTW) > 0.01) {
      warnings.push(
        `BTW bedrag komt niet overeen met berekening. Verwacht: €${calculatedBTW.toFixed(2)}, ingevoerd: €${data.btw_bedrag.toFixed(2)}`
      )
    }
  }

  // Rule 4: BTW code should match account type
  if (data.account_type && data.btw_code) {
    const codeInfo = BTW_CODES[data.btw_code]
    if (codeInfo) {
      // Omzet accounts should typically have verschuldigd BTW codes
      if (data.account_type === 'omzet' && codeInfo.type === 'voorbelasting') {
        warnings.push('Omzet rekening met voorbelasting code - controleer of dit correct is')
      }
      // Kosten accounts should typically have voorbelasting codes
      if (data.account_type === 'kosten' && codeInfo.type === 'verschuldigd') {
        warnings.push('Kosten rekening met verschuldigd BTW code - controleer of dit correct is')
      }
    }
  }

  // Rule 5: Voorbelasting should be on debet side (inkopen/kosten)
  if (data.btw_code && (data.btw_code === '5b' || data.btw_code === '5b-laag')) {
    if (!hasDebet) {
      warnings.push('Voorbelasting staat meestal op de debet kant (inkopen/kosten)')
    }
  }

  // Rule 6: Verschuldigd BTW should be on credit side (omzet)
  if (data.btw_code && ['1a', '1b', '1c', '1d'].includes(data.btw_code)) {
    if (!hasCredit) {
      warnings.push('Verschuldigd BTW staat meestal op de credit kant (omzet)')
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  }
}

/**
 * Suggest BTW code based on account type and description
 */
export function suggestBTWCode(accountType: string | null, description: string = ''): string | null {
  if (!accountType) return null

  const desc = description.toLowerCase()

  // Omzet accounts
  if (accountType === 'omzet') {
    // Check for low rate indicators
    if (desc.includes('voed') || desc.includes('boek') || desc.includes('krant') || desc.includes('medicijn')) {
      return '1b' // Laag tarief
    }
    // Default to high rate
    return '1a'
  }

  // Kosten accounts
  if (accountType === 'kosten') {
    // Check for low rate indicators
    if (desc.includes('voed') || desc.includes('boek') || desc.includes('krant') || desc.includes('medicijn')) {
      return '5b-laag' // Laag tarief voorbelasting
    }
    // Default to high rate voorbelasting
    return '5b'
  }

  // Activa/Passiva typically have no BTW
  if (accountType === 'activa' || accountType === 'passiva') {
    return 'geen'
  }

  return null
}

/**
 * Get BTW code information
 */
export function getBTWCodeInfo(code: string | null): BTWCodeInfo | null {
  if (!code) return null
  return BTW_CODES[code] || null
}

/**
 * Format BTW code with description for display
 */
export function formatBTWCode(code: string | null): string {
  if (!code) return 'Geen BTW'
  const info = BTW_CODES[code]
  if (!info) return code
  return `${code} - ${info.description} (${info.percentage}%)`
}

