"use client"

import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import { exportGrootboekToExcel } from "@/lib/utils/excel-exporter"
import { toast } from "sonner"

interface ExportGrootboekButtonProps {
  grootboekAccounts: Array<{
    account_number: string
    account_name: string
    account_type: string
    btw_code: string | null
    rubriek: string | null
    description: string | null
  }>
}

export function ExportGrootboekButton({ grootboekAccounts }: ExportGrootboekButtonProps) {
  const handleExport = () => {
    try {
      if (grootboekAccounts.length === 0) {
        toast.error("Geen data om te exporteren", {
          description: "Er zijn geen grootboekrekeningen om te exporteren.",
        })
        return
      }

      exportGrootboekToExcel(grootboekAccounts)
      toast.success("Export geslaagd!", {
        description: `${grootboekAccounts.length} grootboekrekeningen geëxporteerd naar Excel.`,
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

