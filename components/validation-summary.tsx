"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { CheckCircle2, XCircle, AlertTriangle, FileText, TrendingUp } from "lucide-react"

interface ValidationSummaryProps {
  totalRows: number
  successCount: number
  errorCount: number
  warningCount: number
  errorsByType?: Record<string, number>
  onViewDetails?: () => void
}

export function ValidationSummary({
  totalRows,
  successCount,
  errorCount,
  warningCount,
  errorsByType = {},
  onViewDetails,
}: ValidationSummaryProps) {
  const successRate = totalRows > 0 ? (successCount / totalRows) * 100 : 0
  const errorRate = totalRows > 0 ? (errorCount / totalRows) * 100 : 0
  const warningRate = totalRows > 0 ? (warningCount / totalRows) * 100 : 0

  const getStatusColor = () => {
    if (errorCount > 0) return "destructive"
    if (warningCount > 0) return "default"
    return "default"
  }

  const getStatusText = () => {
    if (errorCount > 0) return "Fouten gevonden"
    if (warningCount > 0) return "Waarschuwingen gevonden"
    return "Alles OK"
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Validatie Samenvatting
        </CardTitle>
        <CardDescription>Overzicht van de import validatie resultaten</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Status */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Status</p>
            <p className="text-2xl font-bold">{getStatusText()}</p>
          </div>
          <Badge variant={getStatusColor()} className="text-lg px-4 py-2">
            {totalRows} rijen
          </Badge>
        </div>

        {/* Progress Bars */}
        <div className="space-y-3">
          <div>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium">Succesvol</span>
              </div>
              <span className="text-sm text-muted-foreground">
                {successCount} ({successRate.toFixed(1)}%)
              </span>
            </div>
            <Progress value={successRate} className="h-2" />
          </div>

          {warningCount > 0 && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-yellow-600" />
                  <span className="text-sm font-medium">Waarschuwingen</span>
                </div>
                <span className="text-sm text-muted-foreground">
                  {warningCount} ({warningRate.toFixed(1)}%)
                </span>
              </div>
              <Progress value={warningRate} className="h-2 bg-yellow-500" />
            </div>
          )}

          {errorCount > 0 && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <XCircle className="w-4 h-4 text-red-600" />
                  <span className="text-sm font-medium">Fouten</span>
                </div>
                <span className="text-sm text-muted-foreground">
                  {errorCount} ({errorRate.toFixed(1)}%)
                </span>
              </div>
              <Progress value={errorRate} className="h-2 bg-red-500" />
            </div>
          )}
        </div>

        {/* Error Breakdown */}
        {Object.keys(errorsByType).length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium">Fout Types:</p>
            <div className="flex flex-wrap gap-2">
              {Object.entries(errorsByType).map(([type, count]) => (
                <Badge key={type} variant="destructive" className="text-xs">
                  {type}: {count}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Statistics */}
        <div className="grid grid-cols-3 gap-4 pt-4 border-t">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{successCount}</div>
            <div className="text-xs text-muted-foreground">Succesvol</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">{warningCount}</div>
            <div className="text-xs text-muted-foreground">Waarschuwingen</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{errorCount}</div>
            <div className="text-xs text-muted-foreground">Fouten</div>
          </div>
        </div>

        {/* Action */}
        {onViewDetails && (
          <div className="pt-4 border-t">
            <button
              onClick={onViewDetails}
              className="w-full text-sm text-primary hover:underline flex items-center justify-center gap-2"
            >
              <TrendingUp className="w-4 h-4" />
              Bekijk details
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

