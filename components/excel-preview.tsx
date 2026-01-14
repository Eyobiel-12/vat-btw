"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { FileSpreadsheet, AlertCircle, CheckCircle2, Info } from "lucide-react"
import * as XLSX from "xlsx"

interface ExcelPreviewProps {
  file: File
  onColumnsDetected?: (columns: string[]) => void
  maxRows?: number
}

interface PreviewRow {
  [key: string]: any
}

export function ExcelPreview({ file, onColumnsDetected, maxRows = 10 }: ExcelPreviewProps) {
  const [previewData, setPreviewData] = useState<PreviewRow[]>([])
  const [columns, setColumns] = useState<string[]>([])
  const [sheetNames, setSheetNames] = useState<string[]>([])
  const [selectedSheet, setSelectedSheet] = useState<string>("")
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [dataTypes, setDataTypes] = useState<Record<string, "text" | "number" | "date" | "unknown">>({})

  useEffect(() => {
    async function loadPreview() {
      try {
        setLoading(true)
        setError(null)

        const arrayBuffer = await file.arrayBuffer()
        const data = new Uint8Array(arrayBuffer)
        const workbook = XLSX.read(data, { type: "array" })

        // Get sheet names
        const sheets = workbook.SheetNames
        setSheetNames(sheets)
        const sheetToUse = selectedSheet || sheets[0]
        setSelectedSheet(sheetToUse)

        // Get worksheet
        const worksheet = workbook.Sheets[sheetToUse]
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { raw: false, defval: "" })

        if (jsonData.length === 0) {
          setError("Excel bestand is leeg of heeft geen data")
          setLoading(false)
          return
        }

        // Get columns from first row
        const firstRow = jsonData[0] as PreviewRow
        const detectedColumns = Object.keys(firstRow)
        setColumns(detectedColumns)
        onColumnsDetected?.(detectedColumns)

        // Detect data types for each column
        const types: Record<string, "text" | "number" | "date" | "unknown"> = {}
        detectedColumns.forEach((col) => {
          const sampleValues = jsonData
            .slice(0, Math.min(10, jsonData.length))
            .map((row: any) => row[col])
            .filter((val) => val !== "" && val !== null && val !== undefined)

          if (sampleValues.length === 0) {
            types[col] = "unknown"
            return
          }

          // Check if all are numbers
          const allNumbers = sampleValues.every((val) => {
            const num = parseFloat(String(val).replace(",", "."))
            return !isNaN(num) && isFinite(num)
          })

          if (allNumbers) {
            types[col] = "number"
            return
          }

          // Check if all are dates
          const allDates = sampleValues.every((val) => {
            const dateStr = String(val)
            // Try common date formats
            const date1 = new Date(dateStr)
            const date2 = dateStr.match(/^\d{2}[-\/]\d{2}[-\/]\d{4}$/) // DD-MM-YYYY or DD/MM/YYYY
            return !isNaN(date1.getTime()) || date2 !== null
          })

          if (allDates) {
            types[col] = "date"
            return
          }

          types[col] = "text"
        })

        setDataTypes(types)

        // Limit rows for preview
        const limitedData = jsonData.slice(0, maxRows) as PreviewRow[]
        setPreviewData(limitedData)
      } catch (err: any) {
        setError(`Fout bij lezen van Excel bestand: ${err.message}`)
      } finally {
        setLoading(false)
      }
    }

    loadPreview()
  }, [file, selectedSheet, maxRows, onColumnsDetected])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5" />
            Excel Preview
          </CardTitle>
          <CardDescription>Bestand wordt geladen...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-destructive" />
            Fout bij laden
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5" />
              Excel Preview
            </CardTitle>
            <CardDescription>
              Eerste {Math.min(maxRows, previewData.length)} rijen van {previewData.length} totaal
            </CardDescription>
          </div>
          {sheetNames.length > 1 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Sheet:</span>
              <select
                value={selectedSheet}
                onChange={(e) => setSelectedSheet(e.target.value)}
                className="px-3 py-1 text-sm border rounded-md bg-background"
              >
                {sheetNames.map((sheet) => (
                  <option key={sheet} value={sheet}>
                    {sheet}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Column Info */}
          <div className="flex items-center gap-2 flex-wrap">
            <Info className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              {columns.length} kolommen gedetecteerd
            </span>
            {columns.length > 0 && (
              <div className="flex gap-1 flex-wrap">
                {columns.map((col) => (
                  <Badge key={col} variant="outline" className="text-xs">
                    {col} ({dataTypes[col] || "unknown"})
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Preview Table */}
          <div className="rounded-md border border-border overflow-x-auto max-h-96 overflow-y-auto">
            <Table>
              <TableHeader className="sticky top-0 bg-background z-10">
                <TableRow>
                  <TableHead className="w-12">#</TableHead>
                  {columns.map((col) => (
                    <TableHead key={col} className="min-w-[120px]">
                      <div className="flex flex-col">
                        <span>{col}</span>
                        <span className="text-xs text-muted-foreground font-normal">
                          {dataTypes[col] || "unknown"}
                        </span>
                      </div>
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {previewData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={columns.length + 1} className="text-center py-8 text-muted-foreground">
                      Geen data gevonden
                    </TableCell>
                  </TableRow>
                ) : (
                  previewData.map((row, rowIndex) => (
                    <TableRow key={rowIndex}>
                      <TableCell className="text-muted-foreground font-mono text-xs">
                        {rowIndex + 2}
                      </TableCell>
                      {columns.map((col) => {
                        const value = row[col]
                        const type = dataTypes[col]
                        return (
                          <TableCell key={col} className="text-sm">
                            {value === "" || value === null || value === undefined ? (
                              <span className="text-muted-foreground italic">leeg</span>
                            ) : type === "number" ? (
                              <span className="font-mono">
                                {parseFloat(String(value).replace(",", ".")).toLocaleString("nl-NL", {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                })}
                              </span>
                            ) : type === "date" ? (
                              <span>{String(value)}</span>
                            ) : (
                              <span className="truncate max-w-[200px]" title={String(value)}>
                                {String(value)}
                              </span>
                            )}
                          </TableCell>
                        )
                      })}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Summary */}
          <Alert>
            <CheckCircle2 className="h-4 w-4" />
            <AlertDescription className="text-sm">
              <strong>Bestand:</strong> {file.name} ({(file.size / 1024).toFixed(2)} KB)
              <br />
              <strong>Sheets:</strong> {sheetNames.length} ({sheetNames.join(", ")})
              <br />
              <strong>Kolommen:</strong> {columns.length} gedetecteerd
            </AlertDescription>
          </Alert>
        </div>
      </CardContent>
    </Card>
  )
}

