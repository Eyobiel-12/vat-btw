"use client"

import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import { exportBTWAangifteToExcel } from "@/lib/utils/excel-exporter"
import { toast } from "sonner"
import type { BTWCalculationResult } from "@/lib/actions/btw"

interface ExportBTWButtonProps {
  calculation: BTWCalculationResult
  jaar: number
  periodeType: "maand" | "kwartaal" | "jaar"
  periode: number
  periodeLabel?: string
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
  }
  status?: "concept" | "klaar" | "ingediend" | "definitief"
}

export function ExportBTWButton({
  calculation,
  jaar,
  periodeType,
  periode,
  periodeLabel,
  clientInfo,
  status,
}: ExportBTWButtonProps) {
  const handleExport = () => {
    try {
      exportBTWAangifteToExcel(calculation, {
        jaar,
        periodeType,
        periode,
        periodeLabel,
      }, clientInfo, status)
      toast.success("Excel bestand gedownload", {
        description: "De BTW aangifte is geëxporteerd naar Excel.",
      })
    } catch (error: any) {
      toast.error("Fout bij exporteren", {
        description: error.message || "Kon de BTW aangifte niet exporteren.",
      })
    }
  }

  return (
    <Button variant="outline" onClick={handleExport} className="w-full sm:w-auto">
      <Download className="w-4 h-4 mr-2" />
      Exporteren naar Excel
    </Button>
  )
}

