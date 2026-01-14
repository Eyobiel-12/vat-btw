"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { CheckCircle2, Upload, Plus, Calculator, FileSpreadsheet, ArrowRight } from "lucide-react"
import Link from "next/link"

interface WorkflowGuideProps {
  clientId: string
  hasGrootboek?: boolean
  hasBoekingsregels?: boolean
}

export function WorkflowGuide({ clientId, hasGrootboek = false, hasBoekingsregels = false }: WorkflowGuideProps) {
  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="w-5 h-5 text-primary" />
          Hoe Werkt Het?
        </CardTitle>
        <CardDescription>Volg deze stappen om BTW aangifte te maken</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          {/* Step 1 */}
          <div className="flex items-start gap-3">
            <div
              className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                hasGrootboek ? "bg-green-500 text-white" : "bg-muted text-muted-foreground"
              }`}
            >
              {hasGrootboek ? <CheckCircle2 className="w-4 h-4" /> : "1"}
            </div>
            <div className="flex-1">
              <p className="font-medium text-foreground">Grootboek Uploaden (Optioneel)</p>
              <p className="text-sm text-muted-foreground">
                Upload grootboekrekeningen met BTW codes. Dit helpt bij validatie.
              </p>
              {!hasGrootboek && (
                <Link href={`/dashboard/clients/${clientId}/upload`} className="mt-1 inline-block">
                  <Button variant="link" size="sm" className="h-auto p-0 text-primary">
                    Upload grootboek <ArrowRight className="w-3 h-3 ml-1" />
                  </Button>
                </Link>
              )}
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex items-start gap-3">
            <div
              className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                hasBoekingsregels ? "bg-green-500 text-white" : "bg-primary text-primary-foreground"
              }`}
            >
              {hasBoekingsregels ? <CheckCircle2 className="w-4 h-4" /> : "2"}
            </div>
            <div className="flex-1">
              <p className="font-medium text-foreground">Transacties Toevoegen (Verplicht)</p>
              <p className="text-sm text-muted-foreground">
                Voeg transacties toe via handmatig formulier of Excel upload. Zonder transacties kan er geen BTW berekend
                worden.
              </p>
              <div className="flex flex-wrap gap-2 mt-2">
                <Link href={`/dashboard/clients/${clientId}/boekingsregels/new`}>
                  <Button variant="outline" size="sm">
                    <Plus className="w-3 h-3 mr-1" />
                    Handmatig
                  </Button>
                </Link>
                <Link href={`/dashboard/clients/${clientId}/upload`}>
                  <Button variant="outline" size="sm">
                    <Upload className="w-3 h-3 mr-1" />
                    Excel Upload
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold bg-muted text-muted-foreground">
              3
            </div>
            <div className="flex-1">
              <p className="font-medium text-foreground">BTW Berekening Bekijken</p>
              <p className="text-sm text-muted-foreground">
                Het systeem berekent automatisch alle BTW rubrieken op basis van je transacties.
              </p>
              <Link href={`/dashboard/clients/${clientId}/btw`} className="mt-1 inline-block">
                <Button variant="link" size="sm" className="h-auto p-0 text-primary">
                  Bekijk BTW berekening <ArrowRight className="w-3 h-3 ml-1" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Step 4 */}
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold bg-muted text-muted-foreground">
              4
            </div>
            <div className="flex-1">
              <p className="font-medium text-foreground">Aangifte Opslaan & Markeren</p>
              <p className="text-sm text-muted-foreground">
                Controleer de berekening, markeer als "Klaar" en daarna als "Ingediend".
              </p>
            </div>
          </div>
        </div>

        {!hasBoekingsregels && (
          <Alert className="mt-4">
            <FileSpreadsheet className="h-4 w-4" />
            <AlertTitle>Begin met transacties toevoegen</AlertTitle>
            <AlertDescription>
              Voeg eerst transacties toe (handmatig of via Excel) voordat je BTW kunt berekenen. Zonder transacties met BTW
              codes kan het systeem geen BTW berekenen.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}

