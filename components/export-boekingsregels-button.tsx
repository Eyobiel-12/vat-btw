"use client"

import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import { exportBoekingsregelsToExcel } from "@/lib/utils/excel-exporter"
import { toast } from "sonner"

interface ExportBoekingsregelsButtonProps {
  boekingsregels: Array<{
    boekdatum: string
    account_number: string
    omschrijving: string
    debet: number | null
    credit: number | null
    btw_code: string | null
    btw_bedrag: number | null
    factuurnummer: string | null
  }>
}

export function ExportBoekingsregelsButton({ boekingsregels, clientInfo }: ExportBoekingsregelsButtonProps) {
  const handleExport = () => {
    try {
      if (boekingsregels.length === 0) {
        toast.error("Geen data om te exporteren", {
          description: "Er zijn geen boekingsregels om te exporteren.",
        })
        return
      }

      exportBoekingsregelsToExcel(boekingsregels, clientInfo)
      toast.success("Export geslaagd!", {
        description: `${boekingsregels.length} boekingsregels geëxporteerd naar Excel.`,
      })
    } catch (error: any) {
      toast.error("Export mislukt", {
        description: error.message || "Er is een fout opgetreden bij het exporteren.",
      })
    }
  }

  return (
    <Button variant="outline" className="w-full sm:w-auto" onClick={handleExport}>
      <Download className="w-4 h-4 mr-2" />
      Exporteren
    </Button>
  )
}

