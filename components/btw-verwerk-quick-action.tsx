"use client"

import { useState, useCallback, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Calendar, Play, FileCheck, Loader2, ArrowRight, AlertCircle, Pencil } from "lucide-react"
import { useRouter } from "next/navigation"
// Note: Server actions can be called from client components in Next.js
import { calculateBTW, saveBTWAangifte, updateBTWAangifteStatus } from "@/lib/actions/btw"
import { toast } from "sonner"

interface BTWVerwerkQuickActionProps {
  clientId: string
}

export function BTWVerwerkQuickAction({ clientId }: BTWVerwerkQuickActionProps) {
  const router = useRouter()
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear())
  const [selectedQuarter, setSelectedQuarter] = useState<number>(Math.ceil((new Date().getMonth() + 1) / 3))
  const [processing, setProcessing] = useState(false)
  const [showProcessDialog, setShowProcessDialog] = useState(false)
  const [calculation, setCalculation] = useState<any>(null)

  // Generate years (current year and previous 2 years, plus next year) - memoized
  const years = useMemo(() => {
    const currentYear = new Date().getFullYear()
    return Array.from({ length: 4 }, (_, i) => currentYear - 1 + i) // 2024, 2025, 2026, 2027
  }, [])

  // Memoized quarter months function
  const getQuarterMonths = useCallback((quarter: number): string => {
    const monthNames = ["januari", "februari", "maart", "april", "mei", "juni", "juli", "augustus", "september", "oktober", "november", "december"]
    const startMonth = (quarter - 1) * 3
    return `${monthNames[startMonth]} - ${monthNames[startMonth + 2]}`
  }, [])

  // Memoized currency formatter
  const formatCurrency = useCallback((amount: number) => {
    return new Intl.NumberFormat("nl-NL", {
      style: "currency",
      currency: "EUR",
    }).format(amount)
  }, [])

  // Memoized handlers
  const handleCalculateAndProcess = useCallback(async () => {
    if (processing) return
    setProcessing(true)
    try {
      // First calculate BTW for the selected quarter
      const btwCalc = await calculateBTW(clientId, selectedYear, "kwartaal", selectedQuarter)
      setCalculation(btwCalc)
      setShowProcessDialog(true)
      
      // Show warning if no transactions found for this period
      if ((btwCalc as any).totalTransactions === 0) {
        toast.warning("Geen transacties gevonden", {
          description: `Geen transacties gevonden voor Q${selectedQuarter} ${selectedYear}. Controleer of u het juiste jaar en kwartaal heeft geselecteerd.`,
          duration: 6000,
        })
      } else if (btwCalc.transactionsWithBTW === 0 && (btwCalc as any).totalTransactions > 0) {
        toast.warning("Geen BTW codes toegewezen", {
          description: `${(btwCalc as any).totalTransactions} transactie(s) gevonden, maar geen met BTW codes. Wijs eerst BTW codes toe aan transacties.`,
          duration: 5000,
        })
      }
    } catch (error: any) {
      toast.error("Fout bij berekenen", {
        description: error.message || "Kon BTW niet berekenen voor dit kwartaal",
      })
    } finally {
      setProcessing(false)
    }
  }, [clientId, selectedYear, selectedQuarter, processing])

  const handleProcess = useCallback(async () => {
    if (!calculation || processing) return

    setProcessing(true)
    try {
      // Save aangifte as concept first
      const saveResult = await saveBTWAangifte(
        clientId,
        selectedYear,
        "kwartaal",
        selectedQuarter,
        calculation
      )

      if (saveResult.error) {
        toast.error("Fout bij opslaan", {
          description: saveResult.error,
        })
        setProcessing(false)
        return
      }

      // Now mark as definitief (verwerkt)
      const updateResult = await updateBTWAangifteStatus(
        (saveResult.data as any)?.id,
        clientId,
        "definitief"
      )

      if (updateResult.error) {
        toast.error("Fout bij verwerken", {
          description: updateResult.error,
        })
      } else {
        toast.success("Aangifte verwerkt!", {
          description: `Q${selectedQuarter} ${selectedYear} is verwerkt en klaar voor indiening.`,
        })
        setShowProcessDialog(false)
        setCalculation(null)
        // Navigate to BTW page for this quarter
        router.push(`/dashboard/clients/${clientId}/btw?jaar=${selectedYear}&periodeType=kwartaal&periode=${selectedQuarter}`)
      }
    } catch (error: any) {
      toast.error("Fout opgetreden", {
        description: error.message || "Onbekende fout",
      })
    } finally {
      setProcessing(false)
    }
  }, [calculation, clientId, selectedYear, selectedQuarter, processing, router])

  const handleViewAangifte = useCallback(() => {
    router.push(
      `/dashboard/clients/${clientId}/btw?jaar=${selectedYear}&periodeType=kwartaal&periode=${selectedQuarter}`
    )
  }, [router, clientId, selectedYear, selectedQuarter])

  const handleCloseDialog = useCallback(() => {
    setShowProcessDialog(false)
  }, [])

  // Memoized computed values
  const totalBTW = useMemo(() => {
    if (!calculation) return 0
    return calculation.rubriek_1a_btw + calculation.rubriek_1b_btw - calculation.rubriek_5b_btw
  }, [calculation])

  const hasNoBTWCodes = useMemo(() => {
    return calculation && calculation.totalTransactions > 0 && (calculation.transactionsWithBTW || 0) === 0
  }, [calculation])

  const canProcess = useMemo(() => {
    return calculation && !hasNoBTWCodes && calculation.totalTransactions > 0
  }, [calculation, hasNoBTWCodes])

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            BTW Aangifte Verwerken
          </CardTitle>
          <CardDescription>
            Selecteer een kwartaal en verwerk de BTW aangifte direct vanuit hier
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium mb-2 block">Jaar</Label>
              <Select
                value={selectedYear.toString()}
                onValueChange={(value) => setSelectedYear(parseInt(value))}
                disabled={processing}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {years.map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm font-medium mb-2 block">Kwartaal</Label>
              <Select
                value={selectedQuarter.toString()}
                onValueChange={(value) => setSelectedQuarter(parseInt(value))}
                disabled={processing}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Q1 - {getQuarterMonths(1)}</SelectItem>
                  <SelectItem value="2">Q2 - {getQuarterMonths(2)}</SelectItem>
                  <SelectItem value="3">Q3 - {getQuarterMonths(3)}</SelectItem>
                  <SelectItem value="4">Q4 - {getQuarterMonths(4)}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              onClick={handleCalculateAndProcess}
              disabled={processing}
              className="flex-1 sm:flex-none bg-primary hover:bg-primary/90"
            >
              {processing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Berekenen...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Verwerk Q{selectedQuarter} {selectedYear}
                </>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={handleViewAangifte}
              disabled={processing}
              className="flex-1 sm:flex-none"
            >
              <FileCheck className="w-4 h-4 mr-2" />
              Bekijk Aangifte
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Kwartaal Toewijzing</AlertTitle>
            <AlertDescription>
              Selecteer het kwartaal waarvoor u de BTW aangifte wilt verwerken. De aangifte wordt automatisch berekend op basis van alle transacties in dat kwartaal.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Process Dialog */}
      <Dialog open={showProcessDialog} onOpenChange={setShowProcessDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>BTW Aangifte Verwerken</DialogTitle>
            <DialogDescription>
              Controleer de berekening voordat u de aangifte verwerkt voor Q{selectedQuarter} {selectedYear}
            </DialogDescription>
          </DialogHeader>

          {calculation && (
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-muted">
                <p className="text-sm font-medium mb-3">Kwartaal Informatie:</p>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Kwartaal: Q{selectedQuarter} {selectedYear}</li>
                  <li>• Periode: {getQuarterMonths(selectedQuarter)}</li>
                  <li>• Type: Kwartaal aangifte</li>
                  {calculation.totalTransactions !== undefined && (
                    <>
                      <li>• Totaal transacties: {calculation.totalTransactions}</li>
                      <li>• Transacties met BTW-code: {calculation.transactionsWithBTW || 0}</li>
                      {calculation.totalTransactions > 0 && (calculation.transactionsWithBTW || 0) === 0 && (
                        <li className="text-destructive font-medium">
                          ⚠️ Geen transacties met BTW codes!
                        </li>
                      )}
                    </>
                  )}
                </ul>
              </div>

              {/* Warning if no BTW codes */}
              {calculation.totalTransactions !== undefined && 
               calculation.totalTransactions > 0 && 
               (calculation.transactionsWithBTW || 0) === 0 && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Geen BTW Codes Toegewezen</AlertTitle>
                  <AlertDescription>
                    Er zijn {calculation.totalTransactions} transactie(s) gevonden voor Q{selectedQuarter} {selectedYear}, 
                    maar geen enkele heeft een BTW-code toegewezen. 
                    <br />
                    <br />
                    <strong>Wat te doen:</strong>
                    <ul className="list-disc list-inside mt-2 space-y-1">
                      <li>Ga naar de transactie overzicht pagina</li>
                      <li>Klik op het potlood icoon bij elke transactie</li>
                      <li>Wijs een BTW-code toe (bijv. "5b" voor voorbelasting, "1a" voor omzet 21%)</li>
                      <li>Probeer daarna opnieuw te verwerken</li>
                    </ul>
                    <div className="mt-3">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full"
                        onClick={() => router.push(`/dashboard/clients/${clientId}/boekingsregels`)}
                        disabled={processing}
                      >
                        <Pencil className="w-4 h-4 mr-2" />
                        Ga naar Transacties om BTW Codes Toe te Wijzen
                      </Button>
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              {/* Info if no transactions at all */}
              {calculation.totalTransactions === 0 && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Geen Transacties Gevonden</AlertTitle>
                  <AlertDescription>
                    Er zijn geen transacties gevonden voor Q{selectedQuarter} {selectedYear}. 
                    <br />
                    <br />
                    <strong>Mogelijke oorzaken:</strong>
                    <ul className="list-disc list-inside mt-2 space-y-1">
                      <li>De transacties zijn in een ander jaar/kwartaal (bijv. Q2 2025)</li>
                      <li>Er zijn nog geen transacties geüpload voor deze periode</li>
                    </ul>
                    <br />
                    Controleer de transactie overzicht pagina om te zien in welk jaar/kwartaal uw transacties staan.
                  </AlertDescription>
                </Alert>
              )}

              {calculation.totalTransactions === 0 ? (
                <div className="p-4 rounded-lg bg-muted text-center">
                  <p className="text-sm text-muted-foreground">Geen transacties om te berekenen</p>
                </div>
              ) : (calculation.transactionsWithBTW || 0) === 0 ? (
                <div className="p-4 rounded-lg bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800">
                  <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200 mb-2">
                    ⚠️ Geen BTW Codes
                  </p>
                  <p className="text-xs text-yellow-700 dark:text-yellow-300">
                    Alle bedragen zijn €0,00 omdat er geen BTW codes zijn toegewezen aan de transacties.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 rounded-lg bg-destructive/5">
                    <p className="text-xs text-muted-foreground mb-1">Verschuldigde BTW</p>
                    <p className="text-lg font-bold text-destructive">
                      {formatCurrency(calculation.rubriek_1a_btw + calculation.rubriek_1b_btw)}
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-primary/5">
                    <p className="text-xs text-muted-foreground mb-1">Voorbelasting</p>
                    <p className="text-lg font-bold text-primary">
                      {formatCurrency(calculation.rubriek_5b_btw)}
                    </p>
                  </div>
                </div>
              )}

              {calculation.totalTransactions === 0 || (calculation.transactionsWithBTW || 0) === 0 ? (
                <div className="p-4 rounded-lg bg-muted border-2 border-muted">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">Saldo:</p>
                    <p className="text-xl font-bold text-muted-foreground">
                      € 0,00
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Geen berekening mogelijk zonder BTW codes
                  </p>
                </div>
              ) : (
                <div className="p-4 rounded-lg bg-accent border-2 border-primary">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">Saldo:</p>
                    <p
                      className={`text-xl font-bold ${
                        calculation.rubriek_5e_btw >= 0 ? "text-destructive" : "text-primary"
                      }`}
                    >
                      {formatCurrency(Math.abs(calculation.rubriek_5e_btw))}
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {calculation.rubriek_5e_btw >= 0 ? "Te betalen" : "Terug te ontvangen"}
                  </p>
                </div>
              )}

              <Alert>
                <FileCheck className="h-4 w-4" />
                <AlertTitle>Verwerking</AlertTitle>
                <AlertDescription>
                  Na verwerking wordt de aangifte gemarkeerd als definitief en kunt u deze indienen bij de Belastingdienst.
                </AlertDescription>
              </Alert>
            </div>
          )}

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={handleCloseDialog}
              disabled={processing}
            >
              Annuleren
            </Button>
            <Button 
              onClick={handleProcess} 
              disabled={processing || !canProcess}
            >
              {processing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Verwerken...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Verwerk Aangifte
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

