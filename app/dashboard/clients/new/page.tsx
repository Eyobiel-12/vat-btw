"use client"

import { useState } from "react"
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
import { ArrowLeft, Building2, Loader2, AlertCircle, CheckCircle2, Mail, Phone, MapPin, Hash, HelpCircle } from "lucide-react"
import { createClient } from "@/lib/actions/clients"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"

export default function NewClientPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError(null)
    setSuccess(false)

    // Client-side validation
    const name = formData.get("name") as string
    if (!name || name.trim().length === 0) {
      setError("Naam is verplicht")
      setLoading(false)
      return
    }

    const result = await createClient(formData)

    if (result?.error) {
      setError(result.error)
      setLoading(false)
      toast.error("Fout bij aanmaken", {
        description: result.error,
      })
    } else if (result?.success) {
      setSuccess(true)
      toast.success("Klant aangemaakt!", {
        description: `${name} is succesvol toegevoegd.`,
      })
      // Redirect to client detail page after 1 second
      setTimeout(() => {
        router.push(`/dashboard/clients/${(result.data as any)?.id}`)
        router.refresh()
      }, 1000)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />

      <main className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-4xl">
        {/* Breadcrumbs */}
        <div className="mb-6">
          <Breadcrumbs
            items={[
              { label: "Klanten", href: "/dashboard" },
              { label: "Nieuwe Klant" },
            ]}
          />
        </div>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2 flex-wrap">
            <div className="p-2 sm:p-3 rounded-lg bg-primary/10 shrink-0">
              <Building2 className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Nieuwe Klant Toevoegen</h1>
          </div>
          <p className="text-sm sm:text-base text-muted-foreground">
            Voeg een nieuwe klant toe aan uw administratie
          </p>
        </div>

        {/* Success Message */}
        {success && (
          <Alert className="mb-6 border-green-500 bg-green-50 dark:bg-green-950">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertTitle className="text-green-800 dark:text-green-200">Klant toegevoegd!</AlertTitle>
            <AlertDescription className="text-green-700 dark:text-green-300">
              U wordt doorgestuurd naar de klantpagina...
            </AlertDescription>
          </Alert>
        )}

        {/* Error Message */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Fout</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Form Card */}
        <Card>
          <CardHeader>
            <CardTitle>Klantgegevens</CardTitle>
            <CardDescription>Vul de gegevens van de nieuwe klant in. Alleen naam is verplicht.</CardDescription>
          </CardHeader>
          <CardContent>
            <form action={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground border-b pb-2">Basisgegevens</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="name">
                    Naam <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="Bijv. Jan de Vries"
                    required
                    disabled={loading || success}
                    className="w-full"
                  />
                  <p className="text-xs text-muted-foreground">Volledige naam van de klant of contactpersoon</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="company_name">Bedrijfsnaam</Label>
                  <Input
                    id="company_name"
                    name="company_name"
                    type="text"
                    placeholder="Bijv. BV De Vries"
                    disabled={loading || success}
                    className="w-full"
                  />
                  <p className="text-xs text-muted-foreground">Optioneel: bedrijfsnaam als deze verschilt van de naam</p>
                </div>
              </div>

              {/* Contact Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground border-b pb-2">Contactgegevens</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">
                      <Mail className="w-4 h-4 inline mr-1" />
                      E-mailadres
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="klant@bedrijf.nl"
                      disabled={loading || success}
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">
                      <Phone className="w-4 h-4 inline mr-1" />
                      Telefoonnummer
                    </Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      placeholder="+31 6 12345678"
                      disabled={loading || success}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>

              {/* Address Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground border-b pb-2">
                  <MapPin className="w-5 h-5 inline mr-2" />
                  Adresgegevens
                </h3>
                
                <div className="space-y-2">
                  <Label htmlFor="address">Straat en huisnummer</Label>
                  <Input
                    id="address"
                    name="address"
                    type="text"
                    placeholder="Hoofdstraat 123"
                    disabled={loading || success}
                    className="w-full"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="postal_code">Postcode</Label>
                    <Input
                      id="postal_code"
                      name="postal_code"
                      type="text"
                      placeholder="1234 AB"
                      disabled={loading || success}
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="city">Plaats</Label>
                    <Input
                      id="city"
                      name="city"
                      type="text"
                      placeholder="Amsterdam"
                      disabled={loading || success}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>

              {/* Business Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground border-b pb-2">
                  <Hash className="w-5 h-5 inline mr-2" />
                  Bedrijfsgegevens
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="kvk_number">KVK Nummer</Label>
                    <Input
                      id="kvk_number"
                      name="kvk_number"
                      type="text"
                      placeholder="12345678"
                      disabled={loading || success}
                      className="w-full"
                    />
                    <p className="text-xs text-muted-foreground">Kamer van Koophandel nummer</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="btw_number">BTW Nummer</Label>
                    <Input
                      id="btw_number"
                      name="btw_number"
                      type="text"
                      placeholder="NL123456789B01"
                      disabled={loading || success}
                      className="w-full"
                    />
                    <p className="text-xs text-muted-foreground">Belasting Toegevoegde Waarde nummer</p>
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label htmlFor="notes">Notities</Label>
                <Textarea
                  id="notes"
                  name="notes"
                  placeholder="Extra informatie over deze klant..."
                  rows={4}
                  disabled={loading || success}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">Optionele notities of opmerkingen</p>
              </div>

              {/* Form Actions */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
                <Button
                  type="submit"
                  size="lg"
                  disabled={loading || success}
                  className="flex-1"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Klant aanmaken...
                    </>
                  ) : success ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Klant toegevoegd!
                    </>
                  ) : (
                    <>
                      <Building2 className="w-4 h-4 mr-2" />
                      Klant Toevoegen
                    </>
                  )}
                </Button>
                <Link href="/dashboard" className="flex-1 sm:flex-initial">
                  <Button type="button" variant="outline" size="lg" className="w-full" disabled={loading || success}>
                    Annuleren
                  </Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Help Text */}
        <Card className="mt-6 bg-muted/50">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">
              <strong>Tip:</strong> U kunt later altijd meer gegevens toevoegen of aanpassen via de klantdetailpagina.
              Alleen de naam is verplicht om te beginnen.
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

