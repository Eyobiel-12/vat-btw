"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import { AlertCircle, CheckCircle2, XCircle, Filter, Download, ArrowUpDown } from "lucide-react"
import * as XLSX from "xlsx"

interface PreviewRow {
  rowNumber: number
  data: Record<string, any>
  errors?: string[]
  warnings?: string[]
}

interface DataPreviewTableProps {
  data: PreviewRow[]
  columns: string[]
  errors?: Array<{ row: number; message: string }>
  warnings?: Array<{ row: number; message: string }>
  onExport?: () => void
  maxRows?: number
}

type SortConfig = {
  column: string | null
  direction: "asc" | "desc"
}

export function DataPreviewTable({
  data,
  columns,
  errors = [],
  warnings = [],
  onExport,
  maxRows = 50,
}: DataPreviewTableProps) {
  const [filter, setFilter] = useState<string>("")
  const [sortConfig, setSortConfig] = useState<SortConfig>({ column: null, direction: "asc" })
  const [highlightedRow, setHighlightedRow] = useState<number | null>(null)

  // Group errors and warnings by row
  const errorsByRow = errors.reduce((acc, err) => {
    if (!acc[err.row]) acc[err.row] = []
    acc[err.row].push(err.message)
    return acc
  }, {} as Record<number, string[]>)

  const warningsByRow = warnings.reduce((acc, warn) => {
    if (!acc[warn.row]) acc[warn.row] = []
    acc[warn.row].push(warn.message)
    return acc
  }, {} as Record<number, string[]>)

  // Filter data
  const filteredData = data.filter((row) => {
    if (!filter) return true
    const searchLower = filter.toLowerCase()
    return Object.values(row.data).some((val) =>
      String(val).toLowerCase().includes(searchLower)
    )
  })

  // Sort data
  const sortedData = [...filteredData].sort((a, b) => {
    if (!sortConfig.column) return 0

    const aVal = a.data[sortConfig.column]
    const bVal = b.data[sortConfig.column]

    if (aVal === bVal) return 0

    const comparison = aVal < bVal ? -1 : 1
    return sortConfig.direction === "asc" ? comparison : -comparison
  })

  // Limit rows
  const displayData = sortedData.slice(0, maxRows)

  const handleSort = (column: string) => {
    setSortConfig({
      column,
      direction:
        sortConfig.column === column && sortConfig.direction === "asc" ? "desc" : "asc",
    })
  }

  const handleExport = () => {
    const exportData = displayData.map((row) => ({
      Rij: row.rowNumber,
      ...row.data,
      Fouten: errorsByRow[row.rowNumber]?.join("; ") || "",
      Waarschuwingen: warningsByRow[row.rowNumber]?.join("; ") || "",
    }))

    const worksheet = XLSX.utils.json_to_sheet(exportData)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Preview")

    XLSX.writeFile(workbook, "data-preview.xlsx")
    onExport?.()
  }

  const getRowStatus = (rowNumber: number) => {
    if (errorsByRow[rowNumber]?.length) return "error"
    if (warningsByRow[rowNumber]?.length) return "warning"
    return "ok"
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Data Preview</CardTitle>
            <CardDescription>
              {displayData.length} van {data.length} rijen getoond
              {filter && ` (gefilterd: ${filteredData.length})`}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="w-4 h-4 mr-2" />
              Exporteer
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filter */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Filter data..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="max-w-sm"
          />
          {filter && (
            <Button variant="ghost" size="sm" onClick={() => setFilter("")}>
              <XCircle className="w-4 h-4" />
            </Button>
          )}
        </div>

        {/* Summary Stats */}
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-600" />
            <span>
              {data.filter((r) => getRowStatus(r.rowNumber) === "ok").length} OK
            </span>
          </div>
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-yellow-600" />
            <span>
              {data.filter((r) => getRowStatus(r.rowNumber) === "warning").length} Waarschuwingen
            </span>
          </div>
          <div className="flex items-center gap-2">
            <XCircle className="w-4 h-4 text-red-600" />
            <span>
              {data.filter((r) => getRowStatus(r.rowNumber) === "error").length} Fouten
            </span>
          </div>
        </div>

        {/* Table */}
        <div className="rounded-md border border-border overflow-x-auto max-h-[600px] overflow-y-auto">
          <Table>
            <TableHeader className="sticky top-0 bg-background z-10">
              <TableRow>
                <TableHead className="w-12">#</TableHead>
                <TableHead className="w-16">Status</TableHead>
                {columns.map((col) => (
                  <TableHead
                    key={col}
                    className="min-w-[120px] cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort(col)}
                  >
                    <div className="flex items-center gap-2">
                      <span>{col}</span>
                      {sortConfig.column === col && (
                        <ArrowUpDown
                          className={`w-3 h-3 ${
                            sortConfig.direction === "asc" ? "rotate-180" : ""
                          }`}
                        />
                      )}
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={columns.length + 2} className="text-center py-8 text-muted-foreground">
                    {filter ? "Geen resultaten gevonden" : "Geen data"}
                  </TableCell>
                </TableRow>
              ) : (
                displayData.map((row) => {
                  const status = getRowStatus(row.rowNumber)
                  const isHighlighted = highlightedRow === row.rowNumber
                  return (
                    <TableRow
                      key={row.rowNumber}
                      className={`${
                        isHighlighted ? "bg-primary/10 ring-2 ring-primary" : ""
                      } ${
                        status === "error"
                          ? "bg-destructive/5 hover:bg-destructive/10"
                          : status === "warning"
                          ? "bg-yellow-50/50 dark:bg-yellow-950/20 hover:bg-yellow-100/50 dark:hover:bg-yellow-950/30"
                          : ""
                      } cursor-pointer`}
                      onClick={() => setHighlightedRow(row.rowNumber)}
                    >
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        {row.rowNumber}
                      </TableCell>
                      <TableCell>
                        {status === "error" ? (
                          <Badge variant="destructive" className="text-xs">
                            Fout
                          </Badge>
                        ) : status === "warning" ? (
                          <Badge variant="outline" className="text-xs border-yellow-500 text-yellow-700">
                            Waarschuwing
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-xs text-green-700 border-green-500">
                            OK
                          </Badge>
                        )}
                      </TableCell>
                      {columns.map((col) => {
                        const value = row.data[col]
                        return (
                          <TableCell key={col} className="text-sm">
                            {value === "" || value === null || value === undefined ? (
                              <span className="text-muted-foreground italic">leeg</span>
                            ) : typeof value === "number" ? (
                              <span className="font-mono">
                                {value.toLocaleString("nl-NL", {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                })}
                              </span>
                            ) : (
                              <span className="truncate max-w-[200px]" title={String(value)}>
                                {String(value)}
                              </span>
                            )}
                          </TableCell>
                        )
                      })}
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* Error/Warning Details for Highlighted Row */}
        {highlightedRow !== null && (errorsByRow[highlightedRow] || warningsByRow[highlightedRow]) && (
          <Alert
            variant={errorsByRow[highlightedRow] ? "destructive" : "default"}
            className="border-yellow-500 bg-yellow-50 dark:bg-yellow-950"
          >
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-2">
                <p className="font-semibold">Rij {highlightedRow}:</p>
                {errorsByRow[highlightedRow]?.map((err, idx) => (
                  <p key={idx} className="text-sm">
                    ❌ {err}
                  </p>
                ))}
                {warningsByRow[highlightedRow]?.map((warn, idx) => (
                  <p key={idx} className="text-sm">
                    ⚠️ {warn}
                  </p>
                ))}
              </div>
            </AlertDescription>
          </Alert>
        )}

        {displayData.length < filteredData.length && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Er worden alleen de eerste {maxRows} rijen getoond. Gebruik filter om specifieke rijen te vinden.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}

