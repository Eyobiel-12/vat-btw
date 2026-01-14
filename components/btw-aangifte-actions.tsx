"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Save, CheckCircle2, Send, Loader2, AlertCircle, Play, FileCheck } from "lucide-react"
import { saveBTWAangifte, updateBTWAangifteStatus } from "@/lib/actions/btw"
import type { BTWCalculationResult } from "@/lib/actions/btw"
import { toast } from "sonner"

interface BTWAangifteActionsProps {
  clientId: string
  jaar: number
  periodeType: "maand" | "kwartaal" | "jaar"
  periode: number
  calculation: BTWCalculationResult
  currentStatus?: "concept" | "definitief" | "ingediend"
  aangifteId?: string
}

export function BTWAangifteActions({
  clientId,
  jaar,
  periodeType,
  periode,
  calculation,
  currentStatus,
  aangifteId,
}: BTWAangifteActionsProps) {
  const [saving, setSaving] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [showSubmitDialog, setShowSubmitDialog] = useState(false)
  const [showProcessDialog, setShowProcessDialog] = useState(false)

  async function handleSaveAsConcept() {
    setSaving(true)
    try {
      const result = await saveBTWAangifte(clientId, jaar, periodeType, periode, calculation)
      if (result.error) {
        toast.error("Fout bij opslaan", {
          description: result.error,
        })
      } else {
        toast.success("Aangifte opgeslagen", {
          description: "De aangifte is opgeslagen als concept.",
        })
        // Refresh page to show updated status
        window.location.reload()
      }
    } catch (error: any) {
      toast.error("Fout opgetreden", {
        description: error.message || "Onbekende fout",
      })
    } finally {
      setSaving(false)
    }
  }

  async function handleMarkAsReady() {
    if (!aangifteId) {
      // First save as concept, then mark as ready
      setSaving(true)
      try {
        const saveResult = await saveBTWAangifte(clientId, jaar, periodeType, periode, calculation)
        if (saveResult.error) {
          toast.error("Fout bij opslaan", {
            description: saveResult.error,
          })
          setSaving(false)
          return
        }
        // Now mark as ready
        const updateResult = await updateBTWAangifteStatus(
          (saveResult.data as any)?.id,
          clientId,
          "definitief"
        )
        if (updateResult.error) {
          toast.error("Fout bij markeren", {
            description: updateResult.error,
          })
        } else {
          toast.success("Aangifte gemarkeerd als klaar", {
            description: "De aangifte is nu definitief en klaar voor indiening.",
          })
          window.location.reload()
        }
      } catch (error: any) {
        toast.error("Fout opgetreden", {
          description: error.message || "Onbekende fout",
        })
      } finally {
        setSaving(false)
      }
    } else {
      setSaving(true)
      try {
        const result = await updateBTWAangifteStatus(aangifteId, clientId, "definitief")
        if (result.error) {
          toast.error("Fout bij markeren", {
            description: result.error,
          })
        } else {
          toast.success("Aangifte gemarkeerd als klaar", {
            description: "De aangifte is nu definitief en klaar voor indiening.",
          })
          window.location.reload()
        }
      } catch (error: any) {
        toast.error("Fout opgetreden", {
          description: error.message || "Onbekende fout",
        })
      } finally {
        setSaving(false)
      }
    }
  }

  async function handleProcess() {
    // First ensure aangifte is saved
    if (!aangifteId) {
      setProcessing(true)
      try {
        const saveResult = await saveBTWAangifte(clientId, jaar, periodeType, periode, calculation)
        if (saveResult.error) {
          toast.error("Fout bij opslaan", {
            description: saveResult.error,
          })
          setProcessing(false)
          return
        }
        // Now process (mark as definitief)
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
          toast.success("Aangifte verwerkt", {
            description: `De aangifte voor ${periodeType === "kwartaal" ? `Q${periode}` : periodeType === "maand" ? getMonthName(periode) : "jaar"} ${jaar} is verwerkt en klaar voor indiening.`,
          })
          setShowProcessDialog(false)
          window.location.reload()
        }
      } catch (error: any) {
        toast.error("Fout opgetreden", {
          description: error.message || "Onbekende fout",
        })
      } finally {
        setProcessing(false)
      }
    } else {
      setProcessing(true)
      try {
        const result = await updateBTWAangifteStatus(aangifteId, clientId, "definitief")
        if (result.error) {
          toast.error("Fout bij verwerken", {
            description: result.error,
          })
        } else {
          toast.success("Aangifte verwerkt", {
            description: `De aangifte voor ${periodeType === "kwartaal" ? `Q${periode}` : periodeType === "maand" ? getMonthName(periode) : "jaar"} ${jaar} is verwerkt en klaar voor indiening.`,
          })
          setShowProcessDialog(false)
          window.location.reload()
        }
      } catch (error: any) {
        toast.error("Fout opgetreden", {
          description: error.message || "Onbekende fout",
        })
      } finally {
        setProcessing(false)
      }
    }
  }

  function getMonthName(month: number): string {
    const months = [
      "Januari", "Februari", "Maart", "April", "Mei", "Juni",
      "Juli", "Augustus", "September", "Oktober", "November", "December"
    ]
    return months[month - 1] || ""
  }

  async function handleSubmit() {
    if (!aangifteId) {
      toast.error("Eerst opslaan", {
        description: "Sla eerst de aangifte op voordat u deze indient.",
      })
      return
    }

    setSubmitting(true)
    try {
      const result = await updateBTWAangifteStatus(aangifteId, clientId, "ingediend")
      if (result.error) {
        toast.error("Fout bij indienen", {
          description: result.error,
        })
      } else {
        toast.success("Aangifte ingediend", {
          description: "De aangifte is gemarkeerd als ingediend bij de Belastingdienst.",
        })
        setShowSubmitDialog(false)
        window.location.reload()
      }
    } catch (error: any) {
      toast.error("Fout opgetreden", {
        description: error.message || "Onbekende fout",
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Status Badge */}
      {currentStatus && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Status:</span>
          <Badge
            variant={
              currentStatus === "ingediend"
                ? "default"
                : currentStatus === "definitief"
                  ? "default"
                  : "secondary"
            }
            className={
              currentStatus === "ingediend"
                ? "bg-green-500"
                : currentStatus === "definitief"
                  ? "bg-blue-500"
                  : ""
            }
          >
            {currentStatus === "concept" && "Concept"}
            {currentStatus === "definitief" && "Klaar"}
            {currentStatus === "ingediend" && "Ingediend"}
          </Badge>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2">
        {currentStatus !== "ingediend" && (
          <>
            {!currentStatus || currentStatus === "concept" ? (
              <>
                <Button
                  onClick={handleSaveAsConcept}
                  disabled={saving || processing}
                  variant="outline"
                  className="flex-1 sm:flex-none"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Opslaan...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Opslaan als Concept
                    </>
                  )}
                </Button>

                <Dialog open={showProcessDialog} onOpenChange={setShowProcessDialog}>
                  <DialogTrigger asChild>
                    <Button
                      disabled={saving || processing}
                      className="flex-1 sm:flex-none bg-primary hover:bg-primary/90"
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
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>BTW Aangifte Verwerken</DialogTitle>
                      <DialogDescription>
                        Weet u zeker dat u deze aangifte wilt verwerken? De aangifte wordt gecontroleerd en gemarkeerd als definitief.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-3">
                      <div className="p-3 rounded-lg bg-muted">
                        <p className="text-sm font-medium mb-2">Aangifte Details:</p>
                        <ul className="text-sm space-y-1 text-muted-foreground">
                          <li>• Periode: {periodeType === "kwartaal" ? `Q${periode}` : periodeType === "maand" ? getMonthName(periode) : "Jaar"} {jaar}</li>
                          <li>• Type: {periodeType === "kwartaal" ? "Kwartaal" : periodeType === "maand" ? "Maand" : "Jaar"} aangifte</li>
                          {calculation.rubriek_5e_btw !== 0 && (
                            <li>• Saldo: € {calculation.rubriek_5e_btw.toLocaleString("nl-NL", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</li>
                          )}
                        </ul>
                      </div>
                      <Alert>
                        <FileCheck className="h-4 w-4" />
                        <AlertTitle>Controle</AlertTitle>
                        <AlertDescription>
                          Na verwerking wordt de aangifte gemarkeerd als definitief en kan deze worden ingediend bij de Belastingdienst.
                        </AlertDescription>
                      </Alert>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setShowProcessDialog(false)}>
                        Annuleren
                      </Button>
                      <Button onClick={handleProcess} disabled={processing}>
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

                <Button
                  onClick={handleMarkAsReady}
                  disabled={saving || processing}
                  variant="outline"
                  className="flex-1 sm:flex-none"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Verwerken...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Markeer als Klaar
                    </>
                  )}
                </Button>
              </>
            ) : currentStatus === "definitief" ? (
              <Dialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
                <DialogTrigger asChild>
                  <Button className="flex-1 sm:flex-none">
                    <Send className="w-4 h-4 mr-2" />
                    Markeer als Ingediend
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>BTW Aangifte Indienen</DialogTitle>
                    <DialogDescription>
                      Weet u zeker dat u deze aangifte wilt markeren als ingediend bij de Belastingdienst?
                    </DialogDescription>
                  </DialogHeader>
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Let op</AlertTitle>
                    <AlertDescription>
                      Deze actie markeert de aangifte alleen als ingediend in het systeem. U moet de aangifte nog steeds
                      daadwerkelijk indienen bij de Belastingdienst.
                    </AlertDescription>
                  </Alert>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowSubmitDialog(false)}>
                      Annuleren
                    </Button>
                    <Button onClick={handleSubmit} disabled={submitting}>
                      {submitting ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Verwerken...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4 mr-2" />
                          Bevestigen
                        </>
                      )}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            ) : null}
          </>
        )}

        {currentStatus === "ingediend" && (
          <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertTitle className="text-green-800 dark:text-green-200">Aangifte ingediend</AlertTitle>
            <AlertDescription className="text-green-700 dark:text-green-300">
              Deze aangifte is gemarkeerd als ingediend bij de Belastingdienst.
            </AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  )
}

