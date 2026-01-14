"use client"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, CheckCircle2, AlertTriangle } from "lucide-react"
import { validateBoekingsregel, calculateBTWAmount } from "@/lib/utils/btw-helpers"

interface BoekingsregelValidatorProps {
  debet: number
  credit: number
  btwCode: string | null
  btwBedrag: number
  accountNumber: string
  accountType?: string
  showWarnings?: boolean
}

export function BoekingsregelValidator({
  debet,
  credit,
  btwCode,
  btwBedrag,
  accountNumber,
  accountType,
  showWarnings = true,
}: BoekingsregelValidatorProps) {
  const validation = validateBoekingsregel({
    debet,
    credit,
    btw_code: btwCode,
    btw_bedrag: btwBedrag,
    account_number: accountNumber,
    account_type: accountType,
  })

  if (validation.isValid && validation.warnings.length === 0) {
    return (
      <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
        <CheckCircle2 className="h-4 w-4 text-green-600" />
        <AlertTitle className="text-green-800 dark:text-green-200">Boekingsregel is geldig</AlertTitle>
        <AlertDescription className="text-green-700 dark:text-green-300">
          Alle validatieregels zijn voldaan.
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-2">
      {validation.errors.length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Fouten gevonden</AlertTitle>
          <AlertDescription>
            <ul className="list-disc list-inside space-y-1 mt-2">
              {validation.errors.map((error, idx) => (
                <li key={idx}>{error}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {showWarnings && validation.warnings.length > 0 && (
        <Alert className="border-yellow-500 bg-yellow-50 dark:bg-yellow-950">
          <AlertTriangle className="h-4 w-4 text-yellow-600" />
          <AlertTitle className="text-yellow-800 dark:text-yellow-200">Waarschuwingen</AlertTitle>
          <AlertDescription className="text-yellow-700 dark:text-yellow-300">
            <ul className="list-disc list-inside space-y-1 mt-2">
              {validation.warnings.map((warning, idx) => (
                <li key={idx}>{warning}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {btwCode && btwCode !== "geen" && btwCode !== "0" && (
        <div className="text-xs text-muted-foreground mt-2">
          <p>
            Berekende BTW: €{calculateBTWAmount(debet > 0 ? debet : credit, btwCode).toFixed(2)}
            {btwBedrag > 0 && (
              <span className={Math.abs(btwBedrag - calculateBTWAmount(debet > 0 ? debet : credit, btwCode)) > 0.01 ? "text-yellow-600" : ""}>
                {" "}(ingevoerd: €{btwBedrag.toFixed(2)})
              </span>
            )}
          </p>
        </div>
      )}
    </div>
  )
}

