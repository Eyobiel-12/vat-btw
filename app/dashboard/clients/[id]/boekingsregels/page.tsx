import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { DashboardHeader } from "@/components/dashboard-header"
import { Breadcrumbs } from "@/components/breadcrumbs"
import { ArrowLeft, Upload, Download, Filter, Calendar, Plus, FileText } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getBoekingsregels } from "@/lib/actions/boekingsregels"
import { getClient } from "@/lib/actions/clients"
import { notFound } from "next/navigation"
import { ExportBoekingsregelsButton } from "@/components/export-boekingsregels-button"
import { EnhancedTransactieOverzicht } from "@/components/enhanced-transactie-overzicht"
import { BTWVerwerkQuickAction } from "@/components/btw-verwerk-quick-action"

/**
 * Format currency in Dutch format: € 4.104,93
 */
function formatCurrency(amount: number | null | string) {
  if (amount === null || amount === undefined || amount === "") return "-"
  const num = typeof amount === "string" ? parseFloat(amount) : amount
  if (isNaN(num)) return "-"
  return new Intl.NumberFormat("nl-NL", {
    style: "currency",
    currency: "EUR",
  }).format(num)
}

/**
 * Format number in Dutch format: 4.104,93 (without currency symbol)
 */
function formatDutchNumber(value: number | null | string): string {
  if (value === null || value === undefined || value === "") return "0,00"
  const num = typeof value === "string" ? parseFloat(value) : value
  if (isNaN(num)) return "0,00"
  return num.toLocaleString("nl-NL", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

/**
 * Format date in Dutch format: DD-MM-YYYY
 */
function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("nl-NL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })
}

export default async function BoekingsregelsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  
  if (!id || id === "undefined") {
    notFound()
  }
  
  // Get client information
  let client
  try {
    client = await getClient(id)
  } catch (error) {
    notFound()
  }
  
  const boekingsregelsResult = await getBoekingsregels(id)
  const boekingsregels = Array.isArray(boekingsregelsResult) ? boekingsregelsResult : []
  const totalDebet = boekingsregels.reduce((sum: number, regel: any) => sum + Number(regel.debet || 0), 0)
  const totalCredit = boekingsregels.reduce((sum: number, regel: any) => sum + Number(regel.credit || 0), 0)

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />

      <main className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Breadcrumbs */}
        <div className="mb-6">
          <Breadcrumbs
            items={[
              { label: "Klanten", href: "/dashboard" },
              { label: "Klant", href: `/dashboard/clients/${id}` },
              { label: "Boekingsregels" },
            ]}
          />
        </div>

        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Boekingsregels</h1>
            <p className="text-muted-foreground">Overzicht van alle geïmporteerde transacties</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 shrink-0">
            <ExportBoekingsregelsButton 
              boekingsregels={boekingsregels as any}
            />
            <Link href={`/dashboard/clients/${id}/boekingsregels/new`} className="w-full sm:w-auto">
              <Button variant="outline" className="w-full sm:w-auto">
                <Plus className="w-4 h-4 mr-2" />
                Handmatig Toevoegen
              </Button>
            </Link>
            <Link href={`/dashboard/clients/${id}/upload`} className="w-full sm:w-auto">
              <Button className="w-full sm:w-auto">
                <Upload className="w-4 h-4 mr-2" />
                Importeren
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-foreground">{boekingsregels.length}</div>
              <p className="text-sm text-muted-foreground">Totaal regels</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-foreground">
                {totalDebet > 0 ? `€ ${formatDutchNumber(totalDebet)}` : "€ 0,00"}
              </div>
              <p className="text-sm text-muted-foreground">Totaal debet</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-foreground">
                {totalCredit > 0 ? `€ ${formatDutchNumber(totalCredit)}` : "€ 0,00"}
              </div>
              <p className="text-sm text-muted-foreground">Totaal credit</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div
                className={`text-2xl font-bold ${
                  Math.abs(totalDebet - totalCredit) < 0.01 ? "text-primary" : "text-destructive"
                }`}
              >
                € {formatDutchNumber(totalDebet - totalCredit)}
              </div>
              <p className="text-sm text-muted-foreground">Verschil (moet €0,00 zijn)</p>
            </CardContent>
          </Card>
        </div>

        {/* BTW Verwerk Quick Action */}
        {boekingsregels.length > 0 && (
          <div className="mb-6">
            <BTWVerwerkQuickAction clientId={id} />
          </div>
        )}

        {/* Enhanced Transactie Overzicht */}
        {boekingsregels.length === 0 ? (
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <div className="flex flex-col items-center justify-center space-y-4">
                  <div className="p-4 rounded-full bg-muted">
                    <FileText className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">Geen boekingsregels</h3>
                    <p className="text-sm text-muted-foreground mb-4 max-w-md">
                      Er zijn nog geen transacties toegevoegd. Voeg handmatig transacties toe of upload een Excel
                      bestand.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-2 justify-center">
                      <Link href={`/dashboard/clients/${id}/boekingsregels/new`}>
                        <Button>
                          <Plus className="w-4 h-4 mr-2" />
                          Handmatig Toevoegen
                        </Button>
                      </Link>
                      <Link href={`/dashboard/clients/${id}/upload`}>
                        <Button variant="outline">
                          <Upload className="w-4 h-4 mr-2" />
                          Excel Uploaden
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <EnhancedTransactieOverzicht boekingsregels={boekingsregels} clientId={id} />
        )}
      </main>
    </div>
  )
}
