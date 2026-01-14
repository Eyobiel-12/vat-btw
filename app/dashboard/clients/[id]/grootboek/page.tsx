import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { DashboardHeader } from "@/components/dashboard-header"
import { Breadcrumbs } from "@/components/breadcrumbs"
import { ArrowLeft, Upload, Download, Plus, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { getGrootboekAccounts } from "@/lib/actions/grootboek"
import { notFound } from "next/navigation"
import { ExportGrootboekButton } from "@/components/export-grootboek-button"

export default async function GrootboekPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  
  if (!id || id === "undefined") {
    notFound()
  }
  
  const grootboekData = await getGrootboekAccounts(id)
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
              { label: "Grootboek" },
            ]}
          />
        </div>

        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Grootboek Schema</h1>
            <p className="text-muted-foreground">Beheer grootboekrekeningen, categorieën en BTW-codes</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <ExportGrootboekButton grootboekAccounts={grootboekData} />
            <Link href={`/dashboard/clients/${id}/upload`}>
              <Button variant="outline">
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
              <div className="text-2xl font-bold text-foreground">{grootboekData.length}</div>
              <p className="text-sm text-muted-foreground">Totaal rekeningen</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-foreground">
                {grootboekData.filter((g) => g.account_type === "activa").length}
              </div>
              <p className="text-sm text-muted-foreground">Activa</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-foreground">
                {grootboekData.filter((g) => g.account_type === "passiva").length}
              </div>
              <p className="text-sm text-muted-foreground">Passiva</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-foreground">{grootboekData.filter((g) => g.btw_code).length}</div>
              <p className="text-sm text-muted-foreground">Met BTW-code</p>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Zoek op grootboeknummer of omschrijving..." className="pl-10" />
            </div>
          </CardContent>
        </Card>

        {/* Grootboek Table */}
        <Card>
          <CardHeader>
            <CardTitle>Grootboekrekeningen</CardTitle>
            <CardDescription>Overzicht van alle grootboekrekeningen met BTW-toewijzing</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border border-border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[120px]">Grootboeknr</TableHead>
                    <TableHead>Omschrijving</TableHead>
                    <TableHead>Categorie</TableHead>
                    <TableHead>BTW-code</TableHead>
                    <TableHead>Rubriek</TableHead>
                    <TableHead>Natuur</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {grootboekData.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        Geen grootboekrekeningen gevonden. Upload een grootboek schema of voeg handmatig rekeningen toe.
                      </TableCell>
                    </TableRow>
                  ) : (
                    grootboekData.map((item) => (
                      <TableRow key={item.id} className="hover:bg-muted/50">
                        <TableCell className="font-mono font-semibold">{item.account_number}</TableCell>
                        <TableCell>{item.account_name}</TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="capitalize">{item.account_type}</Badge>
                        </TableCell>
                        <TableCell>
                          {item.btw_code ? (
                            <Badge variant="outline">{item.btw_code}</Badge>
                          ) : (
                            <span className="text-muted-foreground text-sm">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {item.rubriek ? (
                            <span className="text-sm font-medium">{item.rubriek}</span>
                          ) : (
                            <span className="text-muted-foreground text-sm">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant={item.account_type === "activa" || item.account_type === "kosten" ? "default" : "secondary"}>
                            {item.account_type === "activa" || item.account_type === "kosten" ? "Debet" : "Credit"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* BTW Codes Reference */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>BTW-codes Referentie</CardTitle>
            <CardDescription>Beschikbare BTW-codes en hun betekenis</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="p-4 rounded-lg border border-border">
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="outline">OH</Badge>
                  <span className="text-sm font-medium text-muted-foreground">21%</span>
                </div>
                <p className="text-sm text-foreground font-medium">Omzet hoog tarief</p>
                <p className="text-xs text-muted-foreground mt-1">Rubriek: 1a</p>
              </div>

              <div className="p-4 rounded-lg border border-border">
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="outline">OL</Badge>
                  <span className="text-sm font-medium text-muted-foreground">9%</span>
                </div>
                <p className="text-sm text-foreground font-medium">Omzet laag tarief</p>
                <p className="text-xs text-muted-foreground mt-1">Rubriek: 1b</p>
              </div>

              <div className="p-4 rounded-lg border border-border">
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="outline">OV</Badge>
                  <span className="text-sm font-medium text-muted-foreground">0%</span>
                </div>
                <p className="text-sm text-foreground font-medium">Omzet vrijgesteld</p>
                <p className="text-xs text-muted-foreground mt-1">Rubriek: -</p>
              </div>

              <div className="p-4 rounded-lg border border-border">
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="outline">VH</Badge>
                  <span className="text-sm font-medium text-muted-foreground">21%</span>
                </div>
                <p className="text-sm text-foreground font-medium">Voorbelasting hoog</p>
                <p className="text-xs text-muted-foreground mt-1">Rubriek: 5b</p>
              </div>

              <div className="p-4 rounded-lg border border-border">
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="outline">VL</Badge>
                  <span className="text-sm font-medium text-muted-foreground">9%</span>
                </div>
                <p className="text-sm text-foreground font-medium">Voorbelasting laag</p>
                <p className="text-xs text-muted-foreground mt-1">Rubriek: 5b</p>
              </div>

              <div className="p-4 rounded-lg border border-border">
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="outline">0</Badge>
                  <span className="text-sm font-medium text-muted-foreground">0%</span>
                </div>
                <p className="text-sm text-foreground font-medium">Geen BTW</p>
                <p className="text-xs text-muted-foreground mt-1">Rubriek: -</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
