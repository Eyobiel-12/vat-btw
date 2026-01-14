import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { DashboardHeader } from "@/components/dashboard-header"
import { Breadcrumbs } from "@/components/breadcrumbs"
import { BTWAangifteActions } from "@/components/btw-aangifte-actions"
import { PeriodSelector } from "@/components/period-selector"
import { QuarterlyOverview } from "@/components/quarterly-overview"
import { ExportBTWButton } from "@/components/export-btw-button"
import { ArrowLeft, Download, Calendar, TrendingUp, TrendingDown, AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { calculateBTW, getBTWAangiftes } from "@/lib/actions/btw"
import { getClient } from "@/lib/actions/clients"
import { notFound } from "next/navigation"

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("nl-NL", {
    style: "currency",
    currency: "EUR",
  }).format(amount)
}

function getQuarterMonths(quarter: number): string {
  const monthNames = ["januari", "februari", "maart", "april", "mei", "juni", "juli", "augustus", "september", "oktober", "november", "december"]
  const startMonth = (quarter - 1) * 3
  return `${monthNames[startMonth]} - ${monthNames[startMonth + 2]}`
}

export default async function BTWPage({ 
  params, 
  searchParams 
}: { 
  params: Promise<{ id: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const { id } = await params
  const search = await searchParams
  
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

  // Get period from URL params or use defaults
  const now = new Date()
  const currentYear = search?.jaar ? parseInt(search.jaar as string) : now.getFullYear()
  const currentMonth = now.getMonth() + 1
  const currentQuarter = Math.ceil(currentMonth / 3)
  
  const periodeType: "maand" | "kwartaal" | "jaar" = 
    (search?.periodeType as "maand" | "kwartaal" | "jaar") || "kwartaal"
  
  const periode = search?.periode 
    ? parseInt(search.periode as string) 
    : periodeType === "kwartaal" 
      ? currentQuarter 
      : currentMonth

  // Calculate BTW for selected period

  // Calculate BTW for selected period
  let btwCalculation
  try {
    btwCalculation = await calculateBTW(id, currentYear, periodeType, periode)
  } catch (error) {
    // If no data, use empty calculation
    btwCalculation = {
      rubriek_1a_omzet: 0,
      rubriek_1a_btw: 0,
      rubriek_1b_omzet: 0,
      rubriek_1b_btw: 0,
      rubriek_1c_omzet: 0,
      rubriek_1c_btw: 0,
      rubriek_1d_omzet: 0,
      rubriek_1d_btw: 0,
      rubriek_1e_omzet: 0,
      rubriek_2a_omzet: 0,
      rubriek_3a_omzet: 0,
      rubriek_3b_omzet: 0,
      rubriek_4a_omzet: 0,
      rubriek_4a_btw: 0,
      rubriek_4b_omzet: 0,
      rubriek_4b_btw: 0,
      rubriek_5a_btw: 0,
      rubriek_5b_btw: 0,
      rubriek_5c_btw: 0,
      rubriek_5d_btw: 0,
      rubriek_5e_btw: 0,
      totalTransactions: 0,
      transactionsWithBTW: 0,
    }
  }

  // Get existing aangifte for this period (if any) and all aangiftes for overview
  let existingAangifte = null
  let allAangiftes: any[] = []
  try {
    allAangiftes = await getBTWAangiftes(id, currentYear)
    existingAangifte = allAangiftes.find(
      (a) => a.periode_type === periodeType && a.periode === periode && a.jaar === currentYear
    )
  } catch (error) {
    // If error, continue without existing aangifte
  }

  // Prepare quarterly data for overview
  const quarterlyData = [1, 2, 3, 4].map((q) => {
    const aangifte = allAangiftes.find(
      (a) => a.periode_type === "kwartaal" && a.periode === q && a.jaar === currentYear
    )
    return {
      quarter: q,
      totalOmzet: aangifte
        ? (aangifte.rubriek_1a_omzet || 0) + (aangifte.rubriek_1b_omzet || 0) + (aangifte.rubriek_1e_omzet || 0)
        : 0,
      totalBTW: aangifte ? (aangifte.rubriek_5e_btw || 0) : 0,
      status: aangifte?.status,
    }
  })

  const totalOmzet = btwCalculation.rubriek_1a_omzet + btwCalculation.rubriek_1b_omzet + btwCalculation.rubriek_1e_omzet
  const totalVerschuldigdeBTW = btwCalculation.rubriek_1a_btw + btwCalculation.rubriek_1b_btw
  const totalVoorbelasting = btwCalculation.rubriek_5b_btw
  const teBetalenBTW = btwCalculation.rubriek_5e_btw

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
              { label: "BTW Aangifte" },
            ]}
          />
        </div>

        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">BTW Aangifte</h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Overzicht volgens Belastingdienst rubrieken
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 shrink-0">
            <ExportBTWButton
              calculation={btwCalculation}
              jaar={currentYear}
              periodeType={periodeType}
              periode={periode}
              periodeLabel={
                periodeType === "kwartaal"
                  ? `${currentYear}-Q${periode}`
                  : periodeType === "maand"
                  ? `${currentYear}-M${String(periode).padStart(2, "0")}`
                  : `${currentYear}`
              }
              clientInfo={{
                name: client.name,
                company_name: client.company_name,
                kvk_number: client.kvk_number,
                btw_number: client.btw_number,
                email: client.email,
                phone: client.phone,
                address: client.address,
                city: client.city,
                postal_code: client.postal_code,
              }}
              status={existingAangifte?.status as "concept" | "klaar" | "ingediend" | "definitief" | undefined}
            />
            <Button className="w-full sm:w-auto" disabled>
              <Download className="w-4 h-4 mr-2" />
              Download PDF
              <span className="ml-2 text-xs opacity-70">(Binnenkort)</span>
            </Button>
          </div>
        </div>

        {/* Quarterly Overview - Show when viewing quarters */}
        {periodeType === "kwartaal" && (
          <div className="mb-6">
            <QuarterlyOverview clientId={id} year={currentYear} quarters={quarterlyData} />
          </div>
        )}

        {/* Period Selector */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <PeriodSelector 
              clientId={id}
              currentYear={currentYear}
              currentPeriodType={periodeType}
              currentPeriod={periode}
            />
            <div className="mt-3 text-xs text-muted-foreground">
              {periodeType === "kwartaal" && (
                <span>
                  Kwartaal {periode} {currentYear}: {getQuarterMonths(periode)}
                </span>
              )}
              {periodeType === "maand" && (
                <span>
                  {new Date(currentYear, periode - 1).toLocaleDateString("nl-NL", { month: "long", year: "numeric" })}
                </span>
              )}
              {periodeType === "jaar" && (
                <span>Jaar {currentYear}</span>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Totaal Omzet</CardTitle>
              <TrendingUp className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{formatCurrency(totalOmzet)}</div>
              <p className="text-xs text-muted-foreground mt-1">Excl. BTW</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Verschuldigde BTW</CardTitle>
              <TrendingDown className="w-4 h-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">{formatCurrency(totalVerschuldigdeBTW)}</div>
              <p className="text-xs text-muted-foreground mt-1">Te betalen aan Belastingdienst</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Voorbelasting</CardTitle>
              <TrendingUp className="w-4 h-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{formatCurrency(totalVoorbelasting)}</div>
              <p className="text-xs text-muted-foreground mt-1">Terug te vorderen</p>
            </CardContent>
          </Card>

          <Card className="border-2 border-primary">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Saldo</CardTitle>
              <AlertCircle className="w-4 h-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${teBetalenBTW >= 0 ? "text-destructive" : "text-primary"}`}>
                {formatCurrency(teBetalenBTW)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {teBetalenBTW >= 0 ? "Te betalen" : "Terug te ontvangen"}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Aangifte Beheer met Kwartaal Info */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Aangifte Beheer</CardTitle>
            <CardDescription>
              {periodeType === "kwartaal" ? (
                <>
                  Kwartaal {periode} {currentYear} - {getQuarterMonths(periode)}
                </>
              ) : periodeType === "maand" ? (
                <>
                  {new Date(currentYear, periode - 1).toLocaleDateString("nl-NL", { month: "long", year: "numeric" })}
                </>
              ) : (
                <>Jaar {currentYear}</>
              )}
              {" - "}Sla de aangifte op, verwerk, of dien in bij de Belastingdienst
            </CardDescription>
          </CardHeader>
          <CardContent>
            <BTWAangifteActions
              clientId={id}
              jaar={currentYear}
              periodeType={periodeType}
              periode={periode}
              calculation={btwCalculation}
              currentStatus={existingAangifte?.status as "concept" | "definitief" | "ingediend" | undefined}
              aangifteId={existingAangifte?.id}
            />
          </CardContent>
        </Card>

        {/* Alert */}
        <Alert className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Let op: Controle vereist</AlertTitle>
          <AlertDescription>
            Controleer alle bedragen zorgvuldig voordat u de aangifte indient bij de Belastingdienst. Deze berekening is
            automatisch gegenereerd op basis van uw boekingsregels.
          </AlertDescription>
        </Alert>

        {/* BTW Aangifte - Omzet */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Prestaties / Omzet</CardTitle>
            <CardDescription>Rubrieken 1a t/m 3c - Geleverde goederen en diensten (verschuldigde BTW)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border border-border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">Rubriek</TableHead>
                    <TableHead>Omschrijving</TableHead>
                    <TableHead className="text-right w-[150px]">Omzet (excl. BTW)</TableHead>
                    <TableHead className="text-right w-[100px]">Tarief</TableHead>
                    <TableHead className="text-right w-[150px]">Verschuldigde BTW</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow className="hover:bg-muted/50">
                    <TableCell className="font-semibold">
                      <Badge>1a</Badge>
                    </TableCell>
                    <TableCell>Leveringen/diensten belast met hoog tarief</TableCell>
                    <TableCell className="text-right font-mono font-medium">
                      {formatCurrency(btwCalculation.rubriek_1a_omzet)}
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">21%</TableCell>
                    <TableCell className="text-right font-mono font-bold text-destructive">
                      {formatCurrency(btwCalculation.rubriek_1a_btw)}
                    </TableCell>
                  </TableRow>
                  <TableRow className="hover:bg-muted/50">
                    <TableCell className="font-semibold">
                      <Badge>1b</Badge>
                    </TableCell>
                    <TableCell>Leveringen/diensten belast met laag tarief</TableCell>
                    <TableCell className="text-right font-mono font-medium">
                      {formatCurrency(btwCalculation.rubriek_1b_omzet)}
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">9%</TableCell>
                    <TableCell className="text-right font-mono font-bold text-destructive">
                      {formatCurrency(btwCalculation.rubriek_1b_btw)}
                    </TableCell>
                  </TableRow>
                  <TableRow className="hover:bg-muted/50">
                    <TableCell className="font-semibold">
                      <Badge variant="secondary">1e</Badge>
                    </TableCell>
                    <TableCell>Leveringen/diensten vrijgesteld</TableCell>
                    <TableCell className="text-right font-mono font-medium">
                      {formatCurrency(btwCalculation.rubriek_1e_omzet)}
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">0%</TableCell>
                    <TableCell className="text-right font-mono text-muted-foreground">-</TableCell>
                  </TableRow>
                  <TableRow className="bg-muted/50 font-bold">
                    <TableCell colSpan={4} className="text-right">
                      Totaal verschuldigde BTW:
                    </TableCell>
                    <TableCell className="text-right font-mono text-lg text-destructive">
                      {formatCurrency(totalVerschuldigdeBTW)}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* BTW Aangifte - Voorbelasting */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Voorbelasting</CardTitle>
            <CardDescription>Rubriek 5b - Terugvordering van BTW op inkopen en kosten</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border border-border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">Rubriek</TableHead>
                    <TableHead>Omschrijving</TableHead>
                    <TableHead className="text-right w-[150px]">Basis (excl. BTW)</TableHead>
                    <TableHead className="text-right w-[100px]">Tarief</TableHead>
                    <TableHead className="text-right w-[150px]">Voorbelasting</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow className="hover:bg-muted/50">
                    <TableCell className="font-semibold">
                      <Badge>5b</Badge>
                    </TableCell>
                    <TableCell>Voorbelasting (hoog + laag tarief)</TableCell>
                    <TableCell className="text-right font-mono font-medium">
                      {formatCurrency(btwCalculation.rubriek_5b_btw / 0.21 + btwCalculation.rubriek_5b_btw / 0.09)}
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">21% / 9%</TableCell>
                    <TableCell className="text-right font-mono font-bold text-primary">
                      {formatCurrency(btwCalculation.rubriek_5b_btw)}
                    </TableCell>
                  </TableRow>
                  <TableRow className="bg-muted/50 font-bold">
                    <TableCell colSpan={4} className="text-right">
                      Totaal voorbelasting:
                    </TableCell>
                    <TableCell className="text-right font-mono text-lg text-primary">
                      {formatCurrency(totalVoorbelasting)}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Final Calculation */}
        <Card className="border-2 border-primary">
          <CardHeader>
            <CardTitle className="text-xl">Te betalen / Te ontvangen</CardTitle>
            <CardDescription>Eindberekening voor de Belastingdienst</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg bg-destructive/5">
                <span className="text-sm font-medium text-foreground">Verschuldigde BTW (1a + 1b)</span>
                <span className="text-lg font-bold text-destructive">{formatCurrency(totalVerschuldigdeBTW)}</span>
              </div>
              <div className="flex items-center justify-between p-4 rounded-lg bg-primary/5">
                <span className="text-sm font-medium text-foreground">Voorbelasting (5b)</span>
                <span className="text-lg font-bold text-primary">- {formatCurrency(totalVoorbelasting)}</span>
              </div>
              <div className="h-px bg-border" />
              <div className="flex items-center justify-between p-6 rounded-lg bg-accent">
                <span className="text-lg font-bold text-foreground">
                  {teBetalenBTW >= 0 ? "Te betalen aan Belastingdienst" : "Terug te ontvangen van Belastingdienst"}
                </span>
                <span className={`text-2xl font-bold ${teBetalenBTW >= 0 ? "text-destructive" : "text-primary"}`}>
                  {formatCurrency(Math.abs(teBetalenBTW))}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
