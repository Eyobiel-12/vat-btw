/**
 * Helper utilities specifically for boekhouders
 * Smart features to assist Dutch bookkeepers
 */

/**
 * Get helpful explanation for BTW rubriek
 */
export function getRubriekExplanation(rubriek: string): string {
  const explanations: Record<string, string> = {
    "1a": "Omzet belast met 21% BTW (hoog tarief). Meest voorkomend voor diensten en goederen.",
    "1b": "Omzet belast met 9% BTW (laag tarief). Voor levensmiddelen, boeken, medicijnen, etc.",
    "1c": "Omzet met overige BTW-tarieven. Zeldzaam, controleer of dit correct is.",
    "1d": "Privégebruik. BTW over privégebruik van bedrijfsmiddelen.",
    "1e": "Vrijgestelde omzet. Geen BTW verschuldigd (bijv. medische diensten, onderwijs).",
    "2a": "Export naar landen buiten de EU. Geen BTW verschuldigd.",
    "3a": "Leveringen naar EU-landen. Geen BTW, maar wel aangifteplicht.",
    "3b": "Diensten naar EU-landen. Geen BTW, maar wel aangifteplicht.",
    "4a": "Inkoop uit EU-landen. BTW verschuldigd via verleggingsregeling.",
    "4b": "Import uit landen buiten EU. BTW verschuldigd bij import.",
    "5b": "Voorbelasting. BTW op inkopen/kosten die je mag terugvorderen.",
  }

  return explanations[rubriek] || "Geen uitleg beschikbaar voor deze rubriek."
}

/**
 * Get common grootboek account types and their typical BTW codes
 */
export function getAccountTypeGuidance(accountType: string): {
  typicalBTWCode: string
  explanation: string
  debitCredit: "debet" | "credit" | "both"
} {
  const guidance: Record<string, { typicalBTWCode: string; explanation: string; debitCredit: "debet" | "credit" | "both" }> = {
    omzet: {
      typicalBTWCode: "1a",
      explanation: "Omzet rekeningen hebben meestal verschuldigd BTW (1a of 1b) op de credit kant.",
      debitCredit: "credit",
    },
    kosten: {
      typicalBTWCode: "5b",
      explanation: "Kosten rekeningen hebben meestal voorbelasting (5b) op de debet kant.",
      debitCredit: "debet",
    },
    activa: {
      typicalBTWCode: "geen",
      explanation: "Activa rekeningen hebben meestal geen BTW (balansposten).",
      debitCredit: "debet",
    },
    passiva: {
      typicalBTWCode: "geen",
      explanation: "Passiva rekeningen hebben meestal geen BTW (balansposten).",
      debitCredit: "credit",
    },
  }

  return guidance[accountType] || {
    typicalBTWCode: "geen",
    explanation: "Controleer de BTW-code handmatig.",
    debitCredit: "both",
  }
}

/**
 * Format period for display (Dutch)
 */
export function formatPeriod(jaar: number, periode: number, periodeType: "maand" | "kwartaal" | "jaar"): string {
  const monthNames = [
    "januari",
    "februari",
    "maart",
    "april",
    "mei",
    "juni",
    "juli",
    "augustus",
    "september",
    "oktober",
    "november",
    "december",
  ]

  if (periodeType === "maand") {
    return `${monthNames[periode - 1]} ${jaar}`
  } else if (periodeType === "kwartaal") {
    return `Q${periode} ${jaar}`
  } else {
    return `Jaar ${jaar}`
  }
}

/**
 * Check if BTW aangifte is due soon
 */
export function getBTWDeadline(periodeType: "maand" | "kwartaal" | "jaar", periode: number, jaar: number): {
  deadline: Date
  daysRemaining: number
  isOverdue: boolean
} {
  let deadline: Date

  if (periodeType === "maand") {
    // BTW aangifte is due on the last day of the month following the period
    deadline = new Date(jaar, periode, 0) // Last day of the period month
    deadline.setMonth(deadline.getMonth() + 1) // Move to next month
    deadline.setDate(deadline.getDate() + 30) // Add 30 days (approximate)
  } else if (periodeType === "kwartaal") {
    // Quarterly: due end of month following quarter end
    const quarterEndMonth = periode * 3
    deadline = new Date(jaar, quarterEndMonth, 0)
    deadline.setMonth(deadline.getMonth() + 1)
    deadline.setDate(deadline.getDate() + 30)
  } else {
    // Yearly: due by end of May following year
    deadline = new Date(jaar + 1, 4, 31) // May 31 of next year
  }

  const now = new Date()
  const daysRemaining = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  const isOverdue = daysRemaining < 0

  return { deadline, daysRemaining, isOverdue }
}

/**
 * Get Dutch accounting terminology help
 */
export const ACCOUNTING_TERMS = {
  debet: {
    term: "Debet",
    explanation: "Linkerkant van de balans. Verhoogt activa en kosten, verlaagt passiva en omzet.",
    examples: ["Inkopen", "Kosten", "Activa (bezittingen)"],
  },
  credit: {
    term: "Credit",
    explanation: "Rechterkant van de balans. Verhoogt passiva en omzet, verlaagt activa en kosten.",
    examples: ["Omzet", "Schulden", "Eigen vermogen"],
  },
  grootboek: {
    term: "Grootboek",
    explanation: "Het complete overzicht van alle rekeningen in uw administratie.",
    examples: ["Rekening 8000: Omzet", "Rekening 4300: Huur"],
  },
  boekingsregel: {
    term: "Boekingsregel",
    explanation: "Een individuele transactie in uw administratie. Elke transactie heeft minstens twee regels (debet en credit).",
    examples: ["Factuur ontvangen", "Betaling gedaan"],
  },
  btw_code: {
    term: "BTW-code",
    explanation: "Code die aangeeft welk BTW-tarief van toepassing is. Niet het percentage zelf, maar de Belastingdienst-rubriek.",
    examples: ["1a = 21% omzet", "5b = 21% voorbelasting"],
  },
}

