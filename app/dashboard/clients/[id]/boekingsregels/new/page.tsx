"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { DashboardHeader } from "@/components/dashboard-header"
import { Breadcrumbs } from "@/components/breadcrumbs"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Plus, Loader2, AlertCircle, CheckCircle2, Calendar, HelpCircle, Calculator } from "lucide-react"
import { createBoekingsregel } from "@/lib/actions/boekingsregels"
import { calculateBTWAmount } from "@/lib/utils/btw-helpers"
import { toast } from "sonner"
import { use } from "react"

export default function NewBoekingsregelPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const { id: clientId } = use(params)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [debet, setDebet] = useState("")
  const [credit, setCredit] = useState("")
  const [btwCode, setBtwCode] = useState<string>("")
  const [btwBedrag, setBtwBedrag] = useState("")
  const [autoCalculated, setAutoCalculated] = useState(false)

  // Auto-calculate BTW when amount and code change
  useEffect(() => {
    if (btwCode && btwCode !== "0" && btwCode !== "" && btwCode !== "none") {
      const amount = debet ? parseFloat(debet) : credit ? parseFloat(credit) : 0
      if (amount > 0) {
        const calculated = calculateBTWAmount(amount, btwCode)
        if (calculated > 0 && !btwBedrag) {
          setBtwBedrag(calculated.toFixed(2))
          setAutoCalculated(true)
        }
      }
    } else {
      if (autoCalculated) {
        setBtwBedrag("")
        setAutoCalculated(false)
      }
    }
  }, [debet, credit, btwCode])

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError(null)

    // Client-side validation
    const boekdatum = formData.get("boekdatum") as string
    const account_number = formData.get("account_number") as string
    const omschrijving = formData.get("omschrijving") as string
    const debetValue = formData.get("debet") as string
    const creditValue = formData.get("credit") as string

    if (!boekdatum) {
      setError("Datum is verplicht")
      setLoading(false)
      return
    }

    if (!account_number || account_number.trim() === "") {
      setError("Grootboeknummer is verplicht")
      setLoading(false)
      return
    }

    if (!omschrijving || omschrijving.trim() === "") {
      setError("Omschrijving is verplicht")
      setLoading(false)
      return
    }

    const debetNum = debetValue ? parseFloat(debetValue) : 0
    const creditNum = creditValue ? parseFloat(creditValue) : 0

    if (debetNum === 0 && creditNum === 0) {
      setError("Vul debet OF credit in (minimaal één bedrag moet ingevuld zijn)")
      setLoading(false)
      return
    }

    if (debetNum > 0 && creditNum > 0) {
      setError("Vul alleen debet OF credit in, niet beide tegelijk")
      setLoading(false)
      return
    }

    // Handle "none" value for BTW code - convert to empty string for form submission
    const btwCodeValue = btwCode === "none" || !btwCode ? "" : btwCode
    formData.set("btw_code", btwCodeValue)

    const result = await createBoekingsregel(clientId, formData)

    if (result?.error) {
      setError(result.error)
      toast.error("Fout bij aanmaken", {
        description: result.error,
      })
      setLoading(false)
    } else if (result?.success) {
      toast.success("Boekingsregel toegevoegd", {
        description: "De boekingsregel is succesvol toegevoegd.",
      })
      router.push(`/dashboard/clients/${clientId}/boekingsregels`)
      router.refresh()
    }
  }

  if (!clientId || clientId === "undefined") {
    return (
      <div className="min-h-screen bg-background">
        <DashboardHeader />
        <main className="container mx-auto px-6 py-8">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Fout</AlertTitle>
            <AlertDescription>Ongeldige client ID</AlertDescription>
          </Alert>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />

      <main className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-3xl">
        {/* Breadcrumbs */}
        <div className="mb-6">
          <Breadcrumbs
            items={[
              { label: "Klanten", href: "/dashboard" },
              { label: "Klant", href: `/dashboard/clients/${clientId}` },
              { label: "Boekingsregels", href: `/dashboard/clients/${clientId}/boekingsregels` },
              { label: "Nieuwe Boekingsregel" },
            ]}
          />
        </div>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2 flex-wrap">
            <div className="p-2 sm:p-3 rounded-lg bg-primary/10 shrink-0">
              <Plus className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Handmatig Transactie Toevoegen</h1>
          </div>
          <p className="text-sm sm:text-base text-muted-foreground">
            Voeg één transactie per keer toe via dit formulier. Perfect voor losse facturen of kleine aantallen.
          </p>
        </div>

        {/* Info Card - What does this do? */}
        <Alert className="mb-6 border-primary/20 bg-primary/5">
          <AlertCircle className="h-4 w-4 text-primary" />
          <AlertTitle className="text-primary">Wat doet "Handmatig"?</AlertTitle>
          <AlertDescription className="mt-2 space-y-2">
            <p>
              <strong>Handmatig toevoegen</strong> betekent dat je één transactie per keer invoert via dit formulier.
            </p>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>✅ Perfect voor: Losse facturen, kleine aantallen, correcties</li>
              <li>✅ BTW wordt automatisch berekend als je een BTW-code selecteert</li>
              <li>✅ Direct zichtbaar in je boekingsregels</li>
            </ul>
            <p className="text-sm mt-2">
              <strong>Tip:</strong> Voor veel transacties tegelijk, gebruik de{" "}
              <Link href={`/dashboard/clients/${clientId}/upload`} className="underline font-medium">
                Excel upload
              </Link>{" "}
              functie.
            </p>
          </AlertDescription>
        </Alert>

        {/* Error Message */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Fout</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Example Card */}
        <Card className="mb-6 border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="text-lg">Voorbeeld: Hoe werkt het?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-semibold mb-2">Voorbeeld 1: Verkoop Factuur</p>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>Datum: 15-01-2026</li>
                  <li>Grootboek: 8000 (Omzet)</li>
                  <li>Omschrijving: "Factuur #2026-001"</li>
                  <li>Credit: €1.000,00 (omzet)</li>
                  <li>BTW Code: 1a (21%)</li>
                  <li>BTW Bedrag: €210,00 (automatisch berekend)</li>
                </ul>
              </div>
              <div>
                <p className="font-semibold mb-2">Voorbeeld 2: Inkoop Kosten</p>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>Datum: 20-01-2026</li>
                  <li>Grootboek: 4000 (Huur kosten)</li>
                  <li>Omschrijving: "Huur januari"</li>
                  <li>Debet: €1.000,00 (kosten)</li>
                  <li>BTW Code: 5b (voorbelasting)</li>
                  <li>BTW Bedrag: €210,00 (automatisch berekend)</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Form Card */}
        <Card>
          <CardHeader>
            <CardTitle>Transactie Gegevens</CardTitle>
            <CardDescription>Vul de gegevens van de nieuwe boekingsregel in</CardDescription>
          </CardHeader>
          <CardContent>
            <form action={handleSubmit} className="space-y-6">
              {/* Datum */}
              <div className="space-y-2">
                <Label htmlFor="boekdatum">
                  Datum <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="boekdatum"
                  name="boekdatum"
                  type="date"
                  required
                  disabled={loading}
                  className="w-full"
                  aria-label="Boekdatum"
                  aria-required="true"
                />
                <p className="text-xs text-muted-foreground">Datum van de transactie</p>
              </div>

              {/* Grootboeknummer */}
              <div className="space-y-2">
                <Label htmlFor="account_number">
                  Grootboeknummer <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="account_number"
                  name="account_number"
                  type="text"
                  placeholder="Bijv. 8000"
                  required
                  disabled={loading}
                  className="w-full"
                  aria-label="Grootboeknummer"
                  aria-required="true"
                  aria-describedby="account_number-help"
                />
                <p id="account_number-help" className="text-xs text-muted-foreground">
                  Rekeningnummer (bijv. 8000 voor Omzet)
                </p>
              </div>

              {/* Omschrijving */}
              <div className="space-y-2">
                <Label htmlFor="omschrijving">
                  Omschrijving <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="omschrijving"
                  name="omschrijving"
                  type="text"
                  placeholder="Bijv. Factuur 001"
                  required
                  disabled={loading}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">Beschrijving van de transactie</p>
              </div>

              {/* Debet en Credit */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="debet">
                    Debet
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <HelpCircle className="w-3 h-3 ml-1 inline text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">
                            Debet = kosten, inkopen, bezittingen. Vul alleen debet OF credit in, niet beide.
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </Label>
                  <Input
                    id="debet"
                    name="debet"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    disabled={loading}
                    className="w-full"
                    value={debet}
                    onChange={(e) => {
                      setDebet(e.target.value)
                      if (e.target.value && credit) {
                        setCredit("")
                      }
                    }}
                  />
                  <p className="text-xs text-muted-foreground">Bedrag voor kosten, inkopen, bezittingen</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="credit">
                    Credit
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <HelpCircle className="w-3 h-3 ml-1 inline text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">
                            Credit = omzet, inkomsten, schulden. Vul alleen debet OF credit in, niet beide.
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </Label>
                  <Input
                    id="credit"
                    name="credit"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    disabled={loading}
                    className="w-full"
                    value={credit}
                    onChange={(e) => {
                      setCredit(e.target.value)
                      if (e.target.value && debet) {
                        setDebet("")
                      }
                    }}
                  />
                  <p className="text-xs text-muted-foreground">Bedrag voor omzet, inkomsten, schulden</p>
                </div>
              </div>

              {/* Info Alert */}
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Let op</AlertTitle>
                <AlertDescription>
                  Vul alleen <strong>debet</strong> (kosten) OF <strong>credit</strong> (omzet) in, niet beide. Het systeem
                  berekent automatisch BTW als je een BTW code selecteert.
                </AlertDescription>
              </Alert>

              {/* BTW Code */}
              <div className="space-y-2">
                <Label htmlFor="btw_code">
                  BTW Code
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="w-3 h-3 ml-1 inline text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs">
                          Selecteer een BTW code. Het BTW bedrag wordt automatisch berekend op basis van het bedrag en de
                          geselecteerde code.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </Label>
                <Select
                  name="btw_code"
                  disabled={loading}
                  value={btwCode || "none"}
                  onValueChange={(value) => {
                    if (value === "none") {
                      setBtwCode("")
                    } else {
                      setBtwCode(value)
                    }
                    if (value === "0" || value === "none") {
                      setBtwBedrag("")
                      setAutoCalculated(false)
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecteer BTW code (optioneel)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Geen BTW</SelectItem>
                    <SelectItem value="1a">1a - Omzet hoog tarief (21%)</SelectItem>
                    <SelectItem value="1b">1b - Omzet laag tarief (9%)</SelectItem>
                    <SelectItem value="1e">1e - Omzet vrijgesteld (0%)</SelectItem>
                    <SelectItem value="5b">5b - Voorbelasting (21% / 9%)</SelectItem>
                    <SelectItem value="0">0 - Geen BTW</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  BTW code voor deze transactie. Aanbevolen voor automatische BTW berekening.
                </p>
              </div>

              {/* BTW Bedrag */}
              <div className="space-y-2">
                <Label htmlFor="btw_bedrag">
                  BTW Bedrag
                  {autoCalculated && (
                    <span className="ml-2 text-xs text-primary font-medium flex items-center gap-1">
                      <Calculator className="w-3 h-3" />
                      Automatisch berekend
                    </span>
                  )}
                </Label>
                <Input
                  id="btw_bedrag"
                  name="btw_bedrag"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  disabled={loading}
                  className="w-full"
                  value={btwBedrag}
                  onChange={(e) => {
                    setBtwBedrag(e.target.value)
                    if (e.target.value) {
                      setAutoCalculated(false)
                    }
                  }}
                />
                <p className="text-xs text-muted-foreground">
                  {autoCalculated
                    ? "BTW bedrag is automatisch berekend. Je kunt dit handmatig aanpassen als nodig."
                    : "BTW bedrag wordt automatisch berekend wanneer je een BTW code selecteert en een bedrag invult."}
                </p>
              </div>

              {/* Factuurnummer */}
              <div className="space-y-2">
                <Label htmlFor="factuurnummer">Factuurnummer</Label>
                <Input
                  id="factuurnummer"
                  name="factuurnummer"
                  type="text"
                  placeholder="Bijv. FACT-2026-001"
                  disabled={loading}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">Optioneel: factuurnummer</p>
              </div>

              {/* Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button type="submit" disabled={loading} className="flex-1 sm:flex-none">
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Toevoegen...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 mr-2" />
                      Boekingsregel Toevoegen
                    </>
                  )}
                </Button>
                <Link href={`/dashboard/clients/${clientId}/boekingsregels`} className="flex-1 sm:flex-none">
                  <Button type="button" variant="outline" className="w-full" disabled={loading}>
                    Annuleren
                  </Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

