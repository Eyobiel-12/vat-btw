import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DashboardHeader } from "@/components/dashboard-header"
import { Breadcrumbs } from "@/components/breadcrumbs"
import { Building2, Plus, FileText, TrendingUp, Calendar, AlertCircle } from "lucide-react"
import { getClients } from "@/lib/actions/clients"
import { Suspense } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { ClientCardSkeleton, StatsCardSkeleton } from "@/components/loading-skeletons"

export default async function DashboardPage() {
  let clients: Awaited<ReturnType<typeof getClients>> = []
  try {
    clients = await getClients()
  } catch (error: any) {
    // If schema error, return empty array and show message
    if (error.message.includes("schema cache") || error.message.includes("does not exist")) {
      console.error("Database schema error:", error.message)
      clients = []
    } else {
      throw error
    }
  }
  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />

      <main className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Breadcrumbs */}
        <div className="mb-6">
          <Breadcrumbs items={[{ label: "Klanten" }]} />
        </div>

        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">Klanten Overzicht</h1>
              <p className="text-base sm:text-lg text-muted-foreground">
                Beheer uw klanten en hun BTW-administratie op één centrale plek
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
              <Link href="/dashboard/clients/new" className="w-full md:w-auto">
                <Button size="lg" className="w-full md:w-auto bg-primary hover:bg-primary/90">
                  <Plus className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  Nieuwe Klant
                </Button>
              </Link>
              <Link href="/dashboard/clients/import" className="w-full md:w-auto">
                <Button size="lg" variant="outline" className="w-full md:w-auto border-border hover:bg-muted">
                  <FileText className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  Importeer Klanten
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <Suspense
          fallback={
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {Array.from({ length: 3 }).map((_, i) => (
                <StatsCardSkeleton key={i} />
              ))}
            </div>
          }
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="border-border/50 bg-card hover:shadow-md transition-all duration-200 hover:border-primary/30">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-card-foreground">Totaal Klanten</CardTitle>
                <div className="p-2 rounded-lg bg-primary/10">
                  <Building2 className="w-4 h-4 text-primary" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-card-foreground mb-1">{clients.length}</div>
                <p className="text-xs text-muted-foreground">Actieve klantenaccounts</p>
              </CardContent>
            </Card>

            <Card className="border-border/50 bg-card hover:shadow-md transition-all duration-200 hover:border-primary/30">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-card-foreground">BTW Aangiftes</CardTitle>
                <div className="p-2 rounded-lg bg-primary/10">
                  <FileText className="w-4 h-4 text-primary" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-card-foreground mb-1">-</div>
                <p className="text-xs text-muted-foreground">Bekijk per klant</p>
              </CardContent>
            </Card>

            <Card className="border-border/50 bg-card hover:shadow-md transition-all duration-200 hover:border-primary/30">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-card-foreground">Aankomende Deadlines</CardTitle>
                <div className="p-2 rounded-lg bg-primary/10">
                  <Calendar className="w-4 h-4 text-primary" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-card-foreground mb-1">-</div>
                <p className="text-xs text-muted-foreground">Bekijk per klant</p>
              </CardContent>
            </Card>
          </div>
        </Suspense>

        {/* Clients List */}
        <Suspense
          fallback={
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <ClientCardSkeleton key={i} />
              ))}
            </div>
          }
        >
          {clients.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {clients.map((client: any) => (
                <Card
                  key={client.id}
                  className="hover:shadow-lg transition-all duration-200 border-border/50 hover:border-primary/50 bg-card group"
                >
                  <CardContent className="p-5 sm:p-6">
                    <div className="flex flex-col gap-4">
                      <Link
                        href={`/dashboard/clients/${client.id}`}
                        className="flex items-start gap-4 flex-1 hover:opacity-80 transition-opacity"
                      >
                        <div className="p-3 rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors shrink-0">
                          <Building2 className="w-6 h-6 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            <h3 className="text-lg sm:text-xl font-semibold text-foreground truncate">
                              {client.name}
                            </h3>
                            <Badge variant="default" className="shrink-0 bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20">
                              Actief
                            </Badge>
                          </div>
                          {client.company_name && (
                            <p className="text-sm text-muted-foreground mb-3 truncate font-medium">
                              {client.company_name}
                            </p>
                          )}
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                            {client.btw_number && (
                              <span className="truncate flex items-center gap-1">
                                <span className="font-medium">BTW:</span> {client.btw_number}
                              </span>
                            )}
                            {client.btw_number && <span className="hidden sm:inline text-muted-foreground/50">•</span>}
                            <span className="truncate">
                              Laatste update: {new Date(client.updated_at).toLocaleDateString("nl-NL", {
                                day: "numeric",
                                month: "long",
                                year: "numeric"
                              })}
                            </span>
                          </div>
                        </div>
                      </Link>

                      <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t border-border/50">
                        <Link href={`/dashboard/clients/${client.id}`} className="flex-1">
                          <Button variant="outline" className="w-full border-border hover:bg-muted">
                            <FileText className="w-4 h-4 mr-2" />
                            Beheren
                          </Button>
                        </Link>
                        <Link href={`/dashboard/clients/${client.id}/btw`} className="flex-1">
                          <Button className="w-full bg-primary hover:bg-primary/90">
                            <TrendingUp className="w-4 h-4 mr-2" />
                            BTW Aangifte
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="py-12 sm:py-16 border-dashed border-border/50">
              <CardContent className="flex flex-col items-center justify-center text-center px-4">
                <div className="p-4 rounded-full bg-primary/10 mb-4">
                  <Building2 className="w-12 h-12 sm:w-16 sm:h-16 text-primary" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-2">
                  Nog geen klanten
                </h3>
                <p className="text-sm sm:text-base text-muted-foreground mb-6 max-w-md">
                  Begin met het toevoegen van uw eerste klant om hun BTW-administratie te beheren
                </p>
                <Link href="/dashboard/clients/new">
                  <Button size="lg" className="w-full sm:w-auto bg-primary hover:bg-primary/90">
                    <Plus className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                    Eerste Klant Toevoegen
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </Suspense>

        {/* Empty State (show when no clients) */}
        {clients.length === 0 && (
          <Card className="py-12 sm:py-16 border-dashed">
            <CardContent className="flex flex-col items-center justify-center text-center px-4">
              <div className="p-4 rounded-full bg-primary/10 mb-4">
                <Building2 className="w-12 h-12 sm:w-16 sm:h-16 text-primary" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-2">
                Nog geen klanten
              </h3>
              <p className="text-sm sm:text-base text-muted-foreground mb-6 max-w-md">
                Begin met het toevoegen van uw eerste klant om hun BTW-administratie te beheren
              </p>
              <Link href="/dashboard/clients/new">
                <Button size="lg" className="w-full sm:w-auto">
                  <Plus className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  Eerste Klant Toevoegen
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
        
      </main>
    </div>
  )
}
