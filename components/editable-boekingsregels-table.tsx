"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { BTWCodeSelect } from "@/components/btw-code-select"
import { Pencil, Trash2, X, Check, Loader2, AlertCircle, Info } from "lucide-react"
import { updateBoekingsregel, deleteBoekingsregel } from "@/lib/actions/boekingsregels"
import { getGrootboekAccount } from "@/lib/actions/grootboek"
import { suggestBTWCode, calculateBTWAmount } from "@/lib/utils/btw-helpers"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

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
}

interface EditableBoekingsregelsTableProps {
  boekingsregels: Boekingsregel[]
  clientId: string
}

/**
 * Format number to Dutch format (4.104,93)
 */
function formatDutchNumber(value: number | null | string): string {
  if (value === null || value === undefined || value === "") return ""
  const num = typeof value === "string" ? parseFloat(value) : value
  if (isNaN(num) || num === 0) return ""
  
  // Dutch format: 4.104,93 (period for thousands, comma for decimal)
  return num.toLocaleString("nl-NL", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

/**
 * Parse Dutch number format to number
 * Handles: 4.104,93 (thousands. decimal,) or 4104,93 or 4104.93
 */
function parseDutchNumber(value: string): number {
  if (!value || value.trim() === "") return 0
  // Remove spaces and currency symbols
  let cleaned = value.replace(/\s/g, "").replace(/€/g, "").trim()
  if (!cleaned) return 0
  
  // If has comma, it's definitely Dutch format (decimal separator)
  if (cleaned.includes(",")) {
    // Remove all periods (thousands separators) and replace comma with dot
    cleaned = cleaned.replace(/\./g, "").replace(",", ".")
  } else if (cleaned.includes(".")) {
    // Check if it's thousands or decimal
    const parts = cleaned.split(".")
    // If last part has 2 digits, likely decimal (e.g., 4104.93)
    if (parts.length === 2 && parts[1].length === 2 && !parts[1].includes(".")) {
      // Decimal separator
      cleaned = cleaned
    } else {
      // Thousands separator - remove all periods
      cleaned = cleaned.replace(/\./g, "")
    }
  }
  
  const parsed = parseFloat(cleaned)
  return isNaN(parsed) ? 0 : parsed
}

/**
 * Format date to Dutch format (DD-MM-YYYY)
 */
function formatDutchDate(dateString: string): string {
  const date = new Date(dateString)
  const day = date.getDate().toString().padStart(2, "0")
  const month = (date.getMonth() + 1).toString().padStart(2, "0")
  const year = date.getFullYear()
  return `${day}-${month}-${year}`
}

/**
 * Parse Dutch date format (DD-MM-YYYY) to ISO
 */
function parseDutchDate(dateString: string): string {
  const parts = dateString.split("-")
  if (parts.length === 3) {
    const day = parseInt(parts[0])
    const month = parseInt(parts[1]) - 1
    const year = parseInt(parts[2])
    const date = new Date(year, month, day)
    return date.toISOString().split("T")[0]
  }
  return dateString
}

export function EditableBoekingsregelsTable({ boekingsregels, clientId }: EditableBoekingsregelsTableProps) {
  const router = useRouter()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [editForm, setEditForm] = useState<Partial<Boekingsregel>>({})
  const [suggestedBTWCode, setSuggestedBTWCode] = useState<string | null>(null)
  const [showBTWConfirmDialog, setShowBTWConfirmDialog] = useState(false)
  const [accountType, setAccountType] = useState<string | null>(null)

  const startEdit = async (regel: Boekingsregel) => {
    setEditingId(regel.id)
    setEditForm({
      boekdatum: formatDutchDate(regel.boekdatum),
      account_number: regel.account_number,
      omschrijving: regel.omschrijving,
      debet: regel.debet,
      credit: regel.credit,
      btw_code: regel.btw_code || "none",
      btw_bedrag: regel.btw_bedrag,
      factuurnummer: regel.factuurnummer,
    })
    
    // Fetch account type for BTW suggestion
    if (regel.account_number) {
      try {
        const account = await getGrootboekAccount(clientId, regel.account_number)
        if (account) {
          setAccountType((account as any).account_type || null)
        }
      } catch (error) {
        console.error("Error fetching account:", error)
      }
    }
  }
  
  // Auto-suggest BTW code when account number or amount changes (only if no BTW code exists)
  useEffect(() => {
    if (!editingId || !editForm.account_number || editForm.btw_code) return
    if (showBTWConfirmDialog) return // Don't suggest again if dialog is already open
    
    const suggestBTW = async () => {
      try {
        const account = await getGrootboekAccount(clientId, editForm.account_number || "")
        if (account) {
          setAccountType((account as any).account_type || null)
          const baseAmount = (editForm.debet || 0) > 0 ? editForm.debet : (editForm.credit || 0)
          
          // Only suggest if there's an amount and no BTW code
          if ((baseAmount ?? 0) > 0 && (!editForm.btw_code || editForm.btw_code === "none")) {
            const suggested = suggestBTWCode((account as any).account_type || null, editForm.omschrijving || "")
            if (suggested && suggested !== "geen") {
              setSuggestedBTWCode(suggested)
              setShowBTWConfirmDialog(true)
            }
          }
        }
      } catch (error) {
        console.error("Error suggesting BTW code:", error)
      }
    }
    
    // Debounce to avoid too many calls
    const timeoutId = setTimeout(suggestBTW, 500)
    return () => clearTimeout(timeoutId)
  }, [editingId, editForm.account_number, editForm.debet, editForm.credit, editForm.omschrijving, editForm.btw_code, clientId, showBTWConfirmDialog])

  const cancelEdit = () => {
    setEditingId(null)
    setEditForm({})
  }

  const handleSave = async () => {
    if (!editingId) return

    setLoading(true)
    try {
      // Auto-calculate BTW amount if BTW code is set but amount is 0
      let btwBedrag = editForm.btw_bedrag || 0
      const btwCode = editForm.btw_code === "none" ? null : (editForm.btw_code || null)
      const baseAmount = (editForm.debet || 0) > 0 ? (editForm.debet || 0) : (editForm.credit || 0)
      
      if (btwCode && btwBedrag === 0 && baseAmount > 0) {
        btwBedrag = calculateBTWAmount(baseAmount, btwCode)
      }

      const formData = new FormData()
      formData.append("boekdatum", parseDutchDate(editForm.boekdatum || ""))
      formData.append("account_number", editForm.account_number || "")
      formData.append("omschrijving", editForm.omschrijving || "")
      formData.append("debet", (editForm.debet || 0).toString())
      formData.append("credit", (editForm.credit || 0).toString())
      formData.append("btw_code", btwCode || "")
      formData.append("btw_bedrag", btwBedrag.toString())
      formData.append("factuurnummer", editForm.factuurnummer || "")

      const result = await updateBoekingsregel(editingId, clientId, formData)

      if (result?.error) {
        toast.error("Fout bij bijwerken", {
          description: result.error,
        })
      } else {
        toast.success("Transactie bijgewerkt!", {
          description: "De wijzigingen zijn opgeslagen.",
        })
        setEditingId(null)
        setEditForm({})
        setSuggestedBTWCode(null)
        setShowBTWConfirmDialog(false)
        router.refresh()
      }
    } catch (error: any) {
      toast.error("Fout opgetreden", {
        description: error.message || "Onbekende fout",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    setLoading(true)
    try {
      const result = await deleteBoekingsregel(id, clientId)

      if (result?.error) {
        toast.error("Fout bij verwijderen", {
          description: result.error,
        })
      } else {
        toast.success("Transactie verwijderd!", {
          description: "De transactie is verwijderd.",
        })
        setDeletingId(null)
        router.refresh()
      }
    } catch (error: any) {
      toast.error("Fout opgetreden", {
        description: error.message || "Onbekende fout",
      })
    } finally {
      setLoading(false)
    }
  }
  
  const handleAcceptBTWCode = () => {
    if (suggestedBTWCode) {
      const baseAmount = (editForm.debet || 0) > 0 ? (editForm.debet || 0) : (editForm.credit || 0)
      const calculatedBTW = calculateBTWAmount(baseAmount, suggestedBTWCode)
      
      setEditForm({
        ...editForm,
        btw_code: suggestedBTWCode,
        btw_bedrag: calculatedBTW,
      })
      setShowBTWConfirmDialog(false)
      setSuggestedBTWCode(null)
      
      toast.success("BTW-code toegewezen", {
        description: `BTW-code "${suggestedBTWCode}" is toegewezen en BTW-bedrag is berekend.`,
      })
    }
  }
  
  const handleRejectBTWCode = () => {
    setShowBTWConfirmDialog(false)
    setSuggestedBTWCode(null)
  }

  return (
    <>
      <div className="rounded-md border border-border overflow-x-auto max-h-[600px] overflow-y-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Datum</TableHead>
              <TableHead className="w-[100px]">Grootboek</TableHead>
              <TableHead className="min-w-[200px]">Omschrijving</TableHead>
              <TableHead className="text-right w-[120px]">Debet</TableHead>
              <TableHead className="text-right w-[120px]">Credit</TableHead>
              <TableHead className="w-[100px]">BTW-code</TableHead>
              <TableHead className="text-right w-[120px]">BTW Bedrag</TableHead>
              <TableHead className="w-[100px]">Acties</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {boekingsregels.map((regel) => {
              const isEditing = editingId === regel.id

              return (
                <TableRow key={regel.id} className="hover:bg-muted/50">
                  {isEditing ? (
                    <>
                      <TableCell>
                        <Input
                          type="text"
                          value={editForm.boekdatum || ""}
                          onChange={(e) => setEditForm({ ...editForm, boekdatum: e.target.value })}
                          placeholder="DD-MM-YYYY"
                          className="h-8 w-[100px]"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="text"
                          value={editForm.account_number || ""}
                          onChange={(e) => setEditForm({ ...editForm, account_number: e.target.value })}
                          className="h-8 w-[100px] font-mono"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="text"
                          value={editForm.omschrijving || ""}
                          onChange={(e) => setEditForm({ ...editForm, omschrijving: e.target.value })}
                          className="h-8 min-w-[200px]"
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <span className="text-sm text-muted-foreground">€</span>
                          <Input
                            type="text"
                            value={editForm.debet && editForm.debet > 0 ? formatDutchNumber(editForm.debet) : ""}
                            onChange={(e) => {
                              const inputValue = e.target.value
                              // Allow empty input
                              if (!inputValue || inputValue.trim() === "") {
                                setEditForm({ 
                                  ...editForm, 
                                  debet: 0, 
                                  credit: editForm.credit || 0
                                })
                                return
                              }
                              const parsed = parseDutchNumber(inputValue)
                              setEditForm({ 
                                ...editForm, 
                                debet: parsed > 0 ? parsed : 0, 
                                credit: parsed > 0 ? 0 : (editForm.credit || 0)
                              })
                            }}
                            onBlur={(e) => {
                              // Ensure proper formatting on blur
                              const parsed = parseDutchNumber(e.target.value)
                              if (parsed > 0) {
                                setEditForm({ ...editForm, debet: parsed })
                              }
                            }}
                            placeholder="0,00"
                            className="h-8 w-[100px] text-right font-mono"
                          />
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <span className="text-sm text-muted-foreground">€</span>
                          <Input
                            type="text"
                            value={editForm.credit && editForm.credit > 0 ? formatDutchNumber(editForm.credit) : ""}
                            onChange={(e) => {
                              const inputValue = e.target.value
                              // Allow empty input
                              if (!inputValue || inputValue.trim() === "") {
                                setEditForm({ 
                                  ...editForm, 
                                  credit: 0, 
                                  debet: editForm.debet || 0
                                })
                                return
                              }
                              const parsed = parseDutchNumber(e.target.value)
                              setEditForm({ 
                                ...editForm, 
                                credit: parsed > 0 ? parsed : 0, 
                                debet: parsed > 0 ? 0 : (editForm.debet || 0)
                              })
                            }}
                            onBlur={(e) => {
                              // Ensure proper formatting on blur
                              const parsed = parseDutchNumber(e.target.value)
                              if (parsed > 0) {
                                setEditForm({ ...editForm, credit: parsed })
                              }
                            }}
                            placeholder="0,00"
                            className="h-8 w-[100px] text-right font-mono"
                          />
                        </div>
                      </TableCell>
                      <TableCell>
                        <BTWCodeSelect
                          value={editForm.btw_code || "none"}
                          onValueChange={(value) => setEditForm({ ...editForm, btw_code: value === "none" ? null : value })}
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <span className="text-xs text-muted-foreground">€</span>
                          <Input
                            type="text"
                            value={editForm.btw_bedrag && editForm.btw_bedrag > 0 ? formatDutchNumber(editForm.btw_bedrag) : ""}
                            onChange={(e) => {
                              const parsed = parseDutchNumber(e.target.value)
                              setEditForm({ ...editForm, btw_bedrag: parsed > 0 ? parsed : 0 })
                            }}
                            placeholder="0,00"
                            className="h-8 w-[100px] text-right font-mono text-sm"
                          />
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={handleSave}
                            disabled={loading}
                            className="h-8 w-8 p-0"
                          >
                            {loading ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Check className="h-4 w-4 text-green-600" />
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={cancelEdit}
                            disabled={loading}
                            className="h-8 w-8 p-0"
                          >
                            <X className="h-4 w-4 text-red-600" />
                          </Button>
                        </div>
                      </TableCell>
                    </>
                  ) : (
                    <>
                      <TableCell className="text-sm">{formatDutchDate(regel.boekdatum)}</TableCell>
                      <TableCell className="font-mono font-semibold">{regel.account_number}</TableCell>
                      <TableCell className="text-sm">{regel.omschrijving}</TableCell>
                      <TableCell className="text-right font-mono">
                        {Number(regel.debet || 0) > 0 ? (
                          <span className="text-foreground font-medium">
                            {formatDutchNumber(Number(regel.debet))} €
                          </span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {Number(regel.credit || 0) > 0 ? (
                          <span className="text-foreground font-medium">
                            {formatDutchNumber(Number(regel.credit))} €
                          </span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {regel.btw_code ? (
                          <Badge variant="outline">{regel.btw_code}</Badge>
                        ) : (
                          <span className="text-muted-foreground text-sm">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right font-mono text-sm">
                        {Number(regel.btw_bedrag || 0) > 0 ? (
                          <span>{formatDutchNumber(Number(regel.btw_bedrag))} €</span>
                        ) : (
                          "-"
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => startEdit(regel)}
                            className="h-8 w-8 p-0"
                            title="Bewerken"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setDeletingId(regel.id)}
                            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                            title="Verwijderen"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </>
                  )}
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deletingId !== null} onOpenChange={(open) => !open && setDeletingId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Transactie Verwijderen</DialogTitle>
            <DialogDescription>
              Weet u zeker dat u deze transactie wilt verwijderen? Deze actie kan niet ongedaan worden gemaakt.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeletingId(null)} disabled={loading}>
              Annuleren
            </Button>
            <Button
              variant="destructive"
              onClick={() => deletingId && handleDelete(deletingId)}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verwijderen...
                </>
              ) : (
                "Verwijderen"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* BTW Code Suggestion Dialog */}
      <Dialog open={showBTWConfirmDialog} onOpenChange={setShowBTWConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Info className="h-5 w-5 text-primary" />
              BTW-code Suggestie
            </DialogTitle>
            <DialogDescription>
              Op basis van het grootboekrekeningnummer en het bedrag hebben we een BTW-code voorgesteld.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-2">
                  <p className="font-medium">Voorgestelde BTW-code: <Badge variant="outline" className="ml-2">{suggestedBTWCode}</Badge></p>
                  {accountType && (
                    <p className="text-sm text-muted-foreground">
                      Grootboekrekening type: <span className="font-medium">{accountType}</span>
                    </p>
                  )}
                  {editForm.omschrijving && (
                    <p className="text-sm text-muted-foreground">
                      Omschrijving: <span className="font-medium">{editForm.omschrijving}</span>
                    </p>
                  )}
                  {(editForm.debet || editForm.credit) && (
                    <p className="text-sm text-muted-foreground">
                      Bedrag: <span className="font-medium">
                        € {formatDutchNumber((editForm.debet || 0) > 0 ? (editForm.debet ?? 0) : (editForm.credit ?? 0))}
                      </span>
                    </p>
                  )}
                  {suggestedBTWCode && (editForm.debet || editForm.credit) && (
                    <p className="text-sm text-muted-foreground">
                      BTW-bedrag: <span className="font-medium">
                        € {formatDutchNumber(calculateBTWAmount((editForm.debet || 0) > 0 ? (editForm.debet || 0) : (editForm.credit || 0), suggestedBTWCode))}
                      </span>
                    </p>
                  )}
                </div>
              </AlertDescription>
            </Alert>
            
            <Alert variant="default">
              <Info className="h-4 w-4" />
              <AlertDescription className="text-sm">
                Controleer of deze BTW-code correct is. U kunt deze later nog aanpassen in het formulier.
              </AlertDescription>
            </Alert>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleRejectBTWCode} disabled={loading}>
              Overslaan
            </Button>
            <Button onClick={handleAcceptBTWCode} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Toepassen...
                </>
              ) : (
                "Toepassen"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

