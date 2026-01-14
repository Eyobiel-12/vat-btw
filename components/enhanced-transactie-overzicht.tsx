"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { EditableBoekingsregelsTable } from "@/components/editable-boekingsregels-table"
import { Search, Filter, Calendar, TrendingUp, TrendingDown, ArrowUpDown, X } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Label } from "@/components/ui/label"

interface Boekingsregel {
  id: string
  boekdatum: string
  account_number: string
  omschrijving: string
  debet: number | null
  credit: number | null
  btw_code: string | null
  btw_bedrag: number | null
  factuurnummer: string | null
  periode?: number | null
  jaar?: number | null
}

interface EnhancedTransactieOverzichtProps {
  boekingsregels: Boekingsregel[]
  clientId: string
}

/**
 * Format number in Dutch format: 4.104,93
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
 * Get month name in Dutch
 */
function getMonthName(month: number): string {
  const months = [
    "Januari", "Februari", "Maart", "April", "Mei", "Juni",
    "Juli", "Augustus", "September", "Oktober", "November", "December"
  ]
  return months[month - 1] || ""
}

export function EnhancedTransactieOverzicht({ boekingsregels, clientId }: EnhancedTransactieOverzichtProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedPeriod, setSelectedPeriod] = useState<string>("all")
  const [selectedBTWCode, setSelectedBTWCode] = useState<string>("all")
  const [sortBy, setSortBy] = useState<"datum" | "bedrag" | "grootboek">("datum")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")

  // Get unique periods and years
  const periods = useMemo(() => {
    const periodMap = new Map<string, { jaar: number; periode: number }>()
    boekingsregels.forEach((regel) => {
      if (regel.jaar && regel.periode) {
        const key = `${regel.jaar}-${regel.periode}`
        if (!periodMap.has(key)) {
          periodMap.set(key, { jaar: regel.jaar, periode: regel.periode })
        }
      }
    })
    return Array.from(periodMap.values())
      .sort((a, b) => {
        if (a.jaar !== b.jaar) return b.jaar - a.jaar
        return b.periode - a.periode
      })
  }, [boekingsregels])

  // Get unique BTW codes
  const btwCodes = useMemo(() => {
    const codes = new Set<string>()
    boekingsregels.forEach((regel) => {
      if (regel.btw_code) codes.add(regel.btw_code)
    })
    return Array.from(codes).sort()
  }, [boekingsregels])

  // Filter and sort boekingsregels
  const filteredAndSorted = useMemo(() => {
    let filtered = [...boekingsregels]

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (regel) =>
          regel.omschrijving.toLowerCase().includes(query) ||
          regel.account_number.toLowerCase().includes(query) ||
          regel.factuurnummer?.toLowerCase().includes(query) ||
          regel.btw_code?.toLowerCase().includes(query)
      )
    }

    // Period filter
    if (selectedPeriod !== "all") {
      const [jaar, periode] = selectedPeriod.split("-").map(Number)
      filtered = filtered.filter(
        (regel) => regel.jaar === jaar && regel.periode === periode
      )
    }

    // BTW code filter
    if (selectedBTWCode !== "all") {
      filtered = filtered.filter((regel) => regel.btw_code === selectedBTWCode)
    }

    // Sort
    filtered.sort((a, b) => {
      let comparison = 0

      switch (sortBy) {
        case "datum":
          comparison = new Date(a.boekdatum).getTime() - new Date(b.boekdatum).getTime()
          break
        case "bedrag":
          const amountA = Math.max(Number(a.debet || 0), Number(a.credit || 0))
          const amountB = Math.max(Number(b.debet || 0), Number(b.credit || 0))
          comparison = amountA - amountB
          break
        case "grootboek":
          comparison = a.account_number.localeCompare(b.account_number)
          break
      }

      return sortOrder === "asc" ? comparison : -comparison
    })

    return filtered
  }, [boekingsregels, searchQuery, selectedPeriod, selectedBTWCode, sortBy, sortOrder])

  // Calculate statistics
  const stats = useMemo(() => {
    const totalDebet = filteredAndSorted.reduce((sum, regel) => sum + Number(regel.debet || 0), 0)
    const totalCredit = filteredAndSorted.reduce((sum, regel) => sum + Number(regel.credit || 0), 0)
    const totalBTW = filteredAndSorted.reduce((sum, regel) => sum + Number(regel.btw_bedrag || 0), 0)
    const withBTW = filteredAndSorted.filter((regel) => regel.btw_code).length
    const withoutBTW = filteredAndSorted.length - withBTW

    return {
      totalDebet,
      totalCredit,
      totalBTW,
      verschil: totalDebet - totalCredit,
      withBTW,
      withoutBTW,
      count: filteredAndSorted.length,
    }
  }, [filteredAndSorted])

  const clearFilters = () => {
    setSearchQuery("")
    setSelectedPeriod("all")
    setSelectedBTWCode("all")
  }

  const hasActiveFilters = searchQuery || selectedPeriod !== "all" || selectedBTWCode !== "all"

  return (
    <div className="space-y-6">
      {/* Filters & Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filters & Zoeken
          </CardTitle>
          <CardDescription>Filter en sorteer transacties op verschillende criteria</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Zoek op omschrijving, grootboeknummer, factuurnummer of BTW-code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filters Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Period Filter */}
            <div>
              <Label className="text-sm font-medium mb-2 block">Periode</Label>
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger>
                  <Calendar className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Alle periodes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle periodes</SelectItem>
                  {periods.map((p) => (
                    <SelectItem key={`${p.jaar}-${p.periode}`} value={`${p.jaar}-${p.periode}`}>
                      {getMonthName(p.periode)} {p.jaar}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* BTW Code Filter */}
            <div>
              <Label className="text-sm font-medium mb-2 block">BTW-code</Label>
              <Select value={selectedBTWCode} onValueChange={setSelectedBTWCode}>
                <SelectTrigger>
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Alle BTW-codes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle BTW-codes</SelectItem>
                  {btwCodes.map((code) => (
                    <SelectItem key={code} value={code}>
                      {code}
                    </SelectItem>
                  ))}
                  <SelectItem value="geen">Geen BTW-code</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Sort */}
            <div>
              <Label className="text-sm font-medium mb-2 block">Sorteren op</Label>
              <div className="flex gap-2">
                <Select value={sortBy} onValueChange={(v) => setSortBy(v as any)}>
                  <SelectTrigger className="flex-1">
                    <ArrowUpDown className="w-4 h-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="datum">Datum</SelectItem>
                    <SelectItem value="bedrag">Bedrag</SelectItem>
                    <SelectItem value="grootboek">Grootboek</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                  title={sortOrder === "asc" ? "Oplopend" : "Aflopend"}
                >
                  {sortOrder === "asc" ? (
                    <TrendingUp className="w-4 h-4" />
                  ) : (
                    <TrendingDown className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Active Filters Indicator */}
          {hasActiveFilters && (
            <Alert>
              <div className="flex items-center justify-between">
                <AlertDescription>
                  <span className="font-medium">
                    {filteredAndSorted.length} transactie{filteredAndSorted.length !== 1 ? "s" : ""} gevonden
                  </span>
                  {searchQuery && <span className="ml-2">• Zoekterm: "{searchQuery}"</span>}
                  {selectedPeriod !== "all" && (
                    <span className="ml-2">
                      • Periode: {getMonthName(Number(selectedPeriod.split("-")[1]))} {selectedPeriod.split("-")[0]}
                    </span>
                  )}
                  {selectedBTWCode !== "all" && (
                    <span className="ml-2">• BTW-code: {selectedBTWCode === "geen" ? "Geen" : selectedBTWCode}</span>
                  )}
                </AlertDescription>
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  <X className="w-4 h-4 mr-1" />
                  Wis filters
                </Button>
              </div>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-foreground">{stats.count}</div>
            <p className="text-sm text-muted-foreground">Gevonden transacties</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-foreground">€ {formatDutchNumber(stats.totalDebet)}</div>
            <p className="text-sm text-muted-foreground">Totaal debet</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-foreground">€ {formatDutchNumber(stats.totalCredit)}</div>
            <p className="text-sm text-muted-foreground">Totaal credit</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div
              className={`text-2xl font-bold ${
                Math.abs(stats.verschil) < 0.01 ? "text-primary" : "text-destructive"
              }`}
            >
              € {formatDutchNumber(stats.verschil)}
            </div>
            <p className="text-sm text-muted-foreground">Verschil</p>
          </CardContent>
        </Card>
      </div>

      {/* BTW Statistics */}
      {stats.totalBTW > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Totaal BTW</p>
                <p className="text-xl font-bold text-foreground">€ {formatDutchNumber(stats.totalBTW)}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">
                  {stats.withBTW} met BTW • {stats.withoutBTW} zonder BTW
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Transactions Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Transactie Overzicht</CardTitle>
              <CardDescription>
                {filteredAndSorted.length === boekingsregels.length
                  ? `Alle ${boekingsregels.length} boekingsregels met debet, credit en BTW informatie`
                  : `${filteredAndSorted.length} van ${boekingsregels.length} boekingsregels getoond`}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredAndSorted.length === 0 ? (
            <div className="text-center py-12">
              <div className="flex flex-col items-center justify-center space-y-4">
                <div className="p-4 rounded-full bg-muted">
                  <Search className="w-8 h-8 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">Geen transacties gevonden</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {hasActiveFilters
                      ? "Probeer andere filters of zoektermen"
                      : "Er zijn nog geen transacties toegevoegd"}
                  </p>
                  {hasActiveFilters && (
                    <Button variant="outline" onClick={clearFilters}>
                      <X className="w-4 h-4 mr-2" />
                      Wis alle filters
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <EditableBoekingsregelsTable boekingsregels={filteredAndSorted} clientId={clientId} />
          )}
        </CardContent>
      </Card>
    </div>
  )
}

