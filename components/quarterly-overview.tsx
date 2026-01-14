"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { Calendar, TrendingUp, TrendingDown } from "lucide-react"
import Link from "next/link"

interface QuarterlyOverviewProps {
  clientId: string
  year: number
  quarters: Array<{
    quarter: number
    totalOmzet: number
    totalBTW: number
    status?: "concept" | "definitief" | "ingediend"
  }>
}

export function QuarterlyOverview({ clientId, year, quarters }: QuarterlyOverviewProps) {
  const router = useRouter()

  function formatCurrency(amount: number) {
    return new Intl.NumberFormat("nl-NL", {
      style: "currency",
      currency: "EUR",
    }).format(amount)
  }

  function getQuarterMonths(quarter: number): string {
    const monthNames = ["Jan", "Feb", "Mrt", "Apr", "Mei", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dec"]
    const startMonth = (quarter - 1) * 3
    return `${monthNames[startMonth]}-${monthNames[startMonth + 2]}`
  }

  function getStatusColor(status?: string) {
    switch (status) {
      case "ingediend":
        return "bg-green-500"
      case "definitief":
        return "bg-blue-500"
      case "concept":
        return "bg-yellow-500"
      default:
        return "bg-gray-400"
    }
  }

  function getStatusLabel(status?: string) {
    switch (status) {
      case "ingediend":
        return "Ingediend"
      case "definitief":
        return "Klaar"
      case "concept":
        return "Concept"
      default:
        return "Niet gestart"
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Kwartaal Overzicht {year}
        </CardTitle>
        <CardDescription>Bekijk en beheer BTW aangiftes per kwartaal</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((q) => {
            const quarterData = quarters.find((qData) => qData.quarter === q)
            const hasData = quarterData && (quarterData.totalOmzet > 0 || quarterData.totalBTW > 0)

            return (
              <Card
                key={q}
                className={`cursor-pointer transition-all hover:shadow-lg ${
                  hasData ? "border-primary/50" : "border-muted"
                }`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Q{q}</CardTitle>
                    {quarterData?.status && (
                      <Badge className={getStatusColor(quarterData.status)}>
                        {getStatusLabel(quarterData.status)}
                      </Badge>
                    )}
                  </div>
                  <CardDescription className="text-xs">{getQuarterMonths(q)}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {hasData ? (
                    <>
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Omzet:</span>
                          <span className="font-semibold">{formatCurrency(quarterData!.totalOmzet)}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">BTW:</span>
                          <span className={`font-semibold ${quarterData!.totalBTW >= 0 ? "text-destructive" : "text-primary"}`}>
                            {formatCurrency(Math.abs(quarterData!.totalBTW))}
                          </span>
                        </div>
                      </div>
                      <Link href={`/dashboard/clients/${clientId}/btw?jaar=${year}&periodeType=kwartaal&periode=${q}`}>
                        <Button variant="outline" className="w-full" size="sm">
                          Bekijk Details
                        </Button>
                      </Link>
                    </>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-sm text-muted-foreground mb-3">Geen data beschikbaar</p>
                      <Link href={`/dashboard/clients/${clientId}/btw?jaar=${year}&periodeType=kwartaal&periode=${q}`}>
                        <Button variant="ghost" className="w-full" size="sm">
                          Start Aangifte
                        </Button>
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Year Summary */}
        {quarters.some((q) => q.totalOmzet > 0) && (
          <div className="mt-6 pt-6 border-t">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Jaar Totaal {year}</p>
                <p className="text-2xl font-bold text-foreground mt-1">
                  {formatCurrency(quarters.reduce((sum, q) => sum + q.totalOmzet, 0))}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-muted-foreground">Totaal BTW</p>
                <p className="text-2xl font-bold text-destructive mt-1">
                  {formatCurrency(quarters.reduce((sum, q) => sum + q.totalBTW, 0))}
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

