"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowRight, CheckCircle2, AlertCircle, Sparkles, X } from "lucide-react"

interface ColumnMapping {
  excelColumn: string
  systemField: string | null
  required: boolean
}

interface ColumnMapperProps {
  excelColumns: string[]
  systemFields: Array<{ value: string; label: string; required: boolean }>
  onMappingChange: (mapping: Record<string, string>) => void
  initialMapping?: Record<string, string>
}

export function ColumnMapper({
  excelColumns,
  systemFields,
  onMappingChange,
  initialMapping = {},
}: ColumnMapperProps) {
  const [mappings, setMappings] = useState<ColumnMapping[]>([])
  const [autoDetected, setAutoDetected] = useState<Record<string, string>>({})

  useEffect(() => {
    // Initialize mappings
    const initialMappings: ColumnMapping[] = excelColumns.map((col) => {
      const systemField = initialMapping[col] || autoDetected[col] || null
      return {
        excelColumn: col,
        systemField,
        required: false,
      }
    })

    // Mark required fields
    systemFields.forEach((field) => {
      const mapping = initialMappings.find((m) => m.systemField === field.value)
      if (mapping) {
        mapping.required = field.required
      }
    })

    setMappings(initialMappings)
  }, [excelColumns, systemFields, initialMapping])

  useEffect(() => {
    // Auto-detect column mappings based on name similarity
    const detected: Record<string, string> = {}
    excelColumns.forEach((excelCol) => {
      const lowerExcel = excelCol.toLowerCase().trim()
      const bestMatch = systemFields.find((field) => {
        const lowerField = field.label.toLowerCase()
        const lowerValue = field.value.toLowerCase()

        // Exact match
        if (lowerExcel === lowerField || lowerExcel === lowerValue) return true

        // Contains match
        if (lowerExcel.includes(lowerField) || lowerField.includes(lowerExcel)) return true

        // Common variations
        const variations: Record<string, string[]> = {
          datum: ["date", "boekdatum", "datum", "dat"],
          grootboeknummer: ["account_number", "rekeningnummer", "nummer", "account"],
          omschrijving: ["description", "omschrijving", "omschr", "desc"],
          debet: ["debet", "debit", "deb"],
          credit: ["credit", "cred"],
          btw_code: ["btw_code", "btwcode", "btw", "vat_code"],
          btw_bedrag: ["btw_bedrag", "btwbedrag", "btw_amount", "vat_amount"],
          factuurnummer: ["factuurnummer", "factuur", "invoice", "invoice_number"],
        }

        for (const [key, variants] of Object.entries(variations)) {
          if (variants.some((v) => lowerExcel.includes(v) || v.includes(lowerExcel))) {
            const matchingField = systemFields.find((f) => f.value === key)
            if (matchingField) return true
          }
        }

        return false
      })

      if (bestMatch) {
        detected[excelCol] = bestMatch.value
      }
    })

    setAutoDetected(detected)

    // Apply auto-detected mappings if no initial mapping exists
    if (Object.keys(initialMapping).length === 0) {
      const newMappings = mappings.map((m) => ({
        ...m,
        systemField: m.systemField || detected[m.excelColumn] || null,
      }))
      setMappings(newMappings)
      updateParentMapping(newMappings)
    }
  }, [excelColumns, systemFields])

  const updateParentMapping = (newMappings: ColumnMapping[]) => {
    const mappingRecord: Record<string, string> = {}
    newMappings.forEach((m) => {
      if (m.systemField) {
        mappingRecord[m.excelColumn] = m.systemField
      }
    })
    onMappingChange(mappingRecord)
  }

  const handleMappingChange = (excelColumn: string, systemField: string | null) => {
    const newMappings = mappings.map((m) =>
      m.excelColumn === excelColumn ? { ...m, systemField } : m
    )
    setMappings(newMappings)
    updateParentMapping(newMappings)
  }

  const handleAutoMap = () => {
    const newMappings = mappings.map((m) => ({
      ...m,
      systemField: m.systemField || autoDetected[m.excelColumn] || null,
    }))
    setMappings(newMappings)
    updateParentMapping(newMappings)
  }

  const handleClearMapping = (excelColumn: string) => {
    handleMappingChange(excelColumn, null)
  }

  const getUnmappedRequired = () => {
    const requiredFields = systemFields.filter((f) => f.required).map((f) => f.value)
    const mappedFields = mappings.filter((m) => m.systemField).map((m) => m.systemField)
    return requiredFields.filter((f) => !mappedFields.includes(f))
  }

  const unmappedRequired = getUnmappedRequired()
  const allRequiredMapped = unmappedRequired.length === 0

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              Kolom Mapping
            </CardTitle>
            <CardDescription>
              Koppel Excel kolommen aan systeem velden. Automatische detectie is toegepast waar mogelijk.
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={handleAutoMap}>
            Auto-Map Alle
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status Alert */}
        {allRequiredMapped ? (
          <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800 dark:text-green-200">
              Alle verplichte velden zijn gemapped!
            </AlertDescription>
          </Alert>
        ) : (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Let op:</strong> De volgende verplichte velden zijn nog niet gemapped:{" "}
              {unmappedRequired
                .map((f) => systemFields.find((sf) => sf.value === f)?.label || f)
                .join(", ")}
            </AlertDescription>
          </Alert>
        )}

        {/* Mapping List */}
        <div className="space-y-3">
          {mappings.map((mapping) => {
            const systemFieldInfo = mapping.systemField
              ? systemFields.find((f) => f.value === mapping.systemField)
              : null
            const isAutoDetected = autoDetected[mapping.excelColumn] === mapping.systemField

            return (
              <div
                key={mapping.excelColumn}
                className={`flex items-center gap-3 p-3 rounded-lg border ${
                  mapping.required && !mapping.systemField
                    ? "border-destructive bg-destructive/5"
                    : mapping.systemField
                    ? "border-primary/20 bg-primary/5"
                    : "border-border"
                }`}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-foreground">{mapping.excelColumn}</span>
                    {isAutoDetected && (
                      <Badge variant="outline" className="text-xs">
                        Auto
                      </Badge>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground">Excel kolom</span>
                </div>

                <ArrowRight className="w-4 h-4 text-muted-foreground" />

                <div className="flex-1">
                  <Select
                    value={mapping.systemField || ""}
                    onValueChange={(value) =>
                      handleMappingChange(mapping.excelColumn, value || null)
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecteer systeem veld">
                        {systemFieldInfo ? systemFieldInfo.label : "Niet gemapped"}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Niet gemapped</SelectItem>
                      {systemFields.map((field) => (
                        <SelectItem key={field.value} value={field.value}>
                          <div className="flex items-center gap-2">
                            <span>{field.label}</span>
                            {field.required && (
                              <Badge variant="destructive" className="text-xs">
                                Verplicht
                              </Badge>
                            )}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {systemFieldInfo && (
                    <span className="text-xs text-muted-foreground mt-1 block">
                      {systemFieldInfo.required ? "Verplicht veld" : "Optioneel veld"}
                    </span>
                  )}
                </div>

                {mapping.systemField && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleClearMapping(mapping.excelColumn)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
            )
          })}
        </div>

        {/* Summary */}
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="text-sm text-muted-foreground">
            {mappings.filter((m) => m.systemField).length} van {mappings.length} kolommen gemapped
          </div>
          <div className="flex items-center gap-2">
            {mappings.filter((m) => m.systemField).length > 0 && (
              <Button variant="outline" size="sm" onClick={() => {
                mappings.forEach((m) => {
                  if (m.systemField) {
                    handleClearMapping(m.excelColumn)
                  }
                })
              }}>
                Wis Alle
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

