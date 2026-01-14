import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { DashboardHeader } from "@/components/dashboard-header"
import { Breadcrumbs } from "@/components/breadcrumbs"
import { WorkflowGuide } from "@/components/workflow-guide"
import { ArrowLeft, Building2, FileSpreadsheet, Upload, TrendingUp, Settings, Download, FileText } from "lucide-react"
import { getClient } from "@/lib/actions/clients"
import { getGrootboekAccounts } from "@/lib/actions/grootboek"
import { getBoekingsregels } from "@/lib/actions/boekingsregels"
import { notFound } from "next/navigation"

export default async function ClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  
  // Validate ID
  if (!id || id === "undefined") {
    notFound()
  }

  let client
  try {
    client = await getClient(id)
  } catch (error: any) {
    // If it's a schema error, show helpful message
    if (error.message.includes("schema cache") || error.message.includes("does not exist")) {
      throw error // Let error.tsx handle it
    }
    throw error
  }
  
  if (!client) {
    notFound()
  }

  // Check if grootboek and boekingsregels exist
  let hasGrootboek = false
  let hasBoekingsregels = false
  try {
    const grootboekData = await getGrootboekAccounts(id)
    hasGrootboek = grootboekData.length > 0
  } catch (error) {
    // Ignore errors
  }
  try {
    const boekingsregelsData = await getBoekingsregels(id)
    hasBoekingsregels = boekingsregelsData.length > 0
  } catch (error) {
    // Ignore errors
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />

      <main className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Breadcrumbs */}
        <div className="mb-6">
          <Breadcrumbs
            items={[
              { label: "Klanten", href: "/dashboard" },
              { label: (client as any).name },
            ]}
          />
        </div>

        {/* Client Header */}
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6 mb-8">
          <div className="flex items-start gap-4 flex-1">
            <div className="p-3 sm:p-4 rounded-lg bg-primary/10 shrink-0">
              <Building2 className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-bold text-foreground truncate">{(client as any).name}</h1>
                <Badge className="shrink-0">Actief</Badge>
              </div>
              {(client as any).company_name && (
                <p className="text-base sm:text-lg text-muted-foreground mb-2 truncate">
                  {(client as any).company_name}
                </p>
              )}
              <div className="flex flex-col gap-1 text-xs sm:text-sm text-muted-foreground">
                {(client as any).btw_number && <span className="truncate">BTW-nummer: {(client as any).btw_number}</span>}
                {(client as any).email && <span className="truncate">E-mail: {(client as any).email}</span>}
                {(client as any).phone && <span className="truncate">Telefoon: {(client as any).phone}</span>}
              </div>
            </div>
          </div>

          <Link href="/dashboard" className="shrink-0 w-full lg:w-auto">
            <Button variant="outline" className="w-full lg:w-auto">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Terug naar Klanten
            </Button>
          </Link>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overzicht</TabsTrigger>
            <TabsTrigger value="grootboek">Grootboek</TabsTrigger>
            <TabsTrigger value="transactions">Boekingsregels</TabsTrigger>
            <TabsTrigger value="btw">BTW Overzicht</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Workflow Guide */}
            <WorkflowGuide clientId={(client as any).id} hasGrootboek={hasGrootboek} hasBoekingsregels={hasBoekingsregels} />

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Link href={`/dashboard/clients/${(client as any).id}/grootboek`}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-6 flex flex-col items-center text-center">
                    <div className="p-3 rounded-lg bg-primary/10 mb-3">
                      <FileSpreadsheet className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="font-semibold text-foreground mb-1">Grootboek Schema</h3>
                    <p className="text-sm text-muted-foreground">Beheer grootboekrekeningen</p>
                  </CardContent>
                </Card>
              </Link>

              <Link href={`/dashboard/clients/${(client as any).id}/upload`}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-6 flex flex-col items-center text-center">
                    <div className="p-3 rounded-lg bg-primary/10 mb-3">
                      <Upload className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="font-semibold text-foreground mb-1">Upload Data</h3>
                    <p className="text-sm text-muted-foreground">Import grootboek of boekingsregels</p>
                  </CardContent>
                </Card>
              </Link>

              <Link href={`/dashboard/clients/${(client as any).id}/btw`}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-6 flex flex-col items-center text-center">
                    <div className="p-3 rounded-lg bg-primary/10 mb-3">
                      <TrendingUp className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="font-semibold text-foreground mb-1">BTW Aangifte</h3>
                    <p className="text-sm text-muted-foreground">Bekijk BTW berekening</p>
                  </CardContent>
                </Card>
              </Link>

              <Link href={`/dashboard/clients/${(client as any).id}/boekingsregels`}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-6 flex flex-col items-center text-center">
                    <div className="p-3 rounded-lg bg-primary/10 mb-3">
                      <FileText className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="font-semibold text-foreground mb-1">Boekingsregels</h3>
                    <p className="text-sm text-muted-foreground">Bekijk alle transacties</p>
                  </CardContent>
                </Card>
              </Link>
            </div>

            {/* Recent Activity - Only show if there's actual activity */}
            {hasBoekingsregels && (
              <Card>
                <CardHeader>
                  <CardTitle>Recente Activiteit</CardTitle>
                  <CardDescription>Laatste wijzigingen voor deze klant</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {hasBoekingsregels && (
                      <div className="flex items-start gap-4 pb-4 border-b border-border last:border-0">
                        <div className="p-2 rounded bg-secondary">
                          <Upload className="w-4 h-4 text-muted-foreground" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-foreground">Boekingsregels beschikbaar</p>
                          <p className="text-xs text-muted-foreground">Transacties zijn geüpload en beschikbaar</p>
                        </div>
                      </div>
                    )}
                    {hasGrootboek && (
                      <div className="flex items-start gap-4 pb-4 border-b border-border last:border-0">
                        <div className="p-2 rounded bg-secondary">
                          <FileSpreadsheet className="w-4 h-4 text-muted-foreground" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-foreground">Grootboek schema geladen</p>
                          <p className="text-xs text-muted-foreground">Grootboekrekeningen zijn beschikbaar</p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="grootboek">
            <Card>
              <CardHeader>
                <CardTitle>Grootboek Schema</CardTitle>
                <CardDescription>Beheer grootboekrekeningen en BTW-codes voor deze klant</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center justify-center py-8 space-y-4">
                  <FileSpreadsheet className="w-12 h-12 text-muted-foreground" />
                  <p className="text-muted-foreground text-center">
                    Bekijk het grootboek schema of upload een nieuw bestand
                  </p>
                  <div className="flex gap-3">
                    <Link href={`/dashboard/clients/${(client as any).id}/grootboek`}>
                      <Button>
                        <FileSpreadsheet className="w-4 h-4 mr-2" />
                        Bekijk Grootboek
                      </Button>
                    </Link>
                    <Link href={`/dashboard/clients/${(client as any).id}/upload`}>
                      <Button variant="outline">
                        <Upload className="w-4 h-4 mr-2" />
                        Upload Grootboek
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="transactions">
            <Card>
              <CardHeader>
                <CardTitle>Boekingsregels</CardTitle>
                <CardDescription>Alle geïmporteerde transacties voor deze klant</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center justify-center py-8 space-y-4">
                  <FileText className="w-12 h-12 text-muted-foreground" />
                  <p className="text-muted-foreground text-center">
                    Bekijk alle boekingsregels of upload nieuwe transacties
                  </p>
                  <div className="flex gap-3">
                    <Link href={`/dashboard/clients/${(client as any).id}/boekingsregels`}>
                      <Button>
                        <FileText className="w-4 h-4 mr-2" />
                        Bekijk Boekingsregels
                      </Button>
                    </Link>
                    <Link href={`/dashboard/clients/${(client as any).id}/upload`}>
                      <Button variant="outline">
                        <Upload className="w-4 h-4 mr-2" />
                        Upload Transacties
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="btw">
            <Card>
              <CardHeader>
                <CardTitle>BTW Overzicht</CardTitle>
                <CardDescription>BTW aangiftes en berekeningen per periode</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center justify-center py-8 space-y-4">
                  <TrendingUp className="w-12 h-12 text-muted-foreground" />
                  <p className="text-muted-foreground text-center">
                    Bekijk de automatische BTW berekening voor deze klant
                  </p>
                  <Link href={`/dashboard/clients/${(client as any).id}/btw`}>
                    <Button>
                      <TrendingUp className="w-4 h-4 mr-2" />
                      Bekijk BTW Aangifte
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
