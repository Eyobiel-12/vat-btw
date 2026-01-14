"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Calculator, Loader2, CheckCircle } from "lucide-react"
import { signUp } from "@/lib/actions/auth"

export default function RegisterPage() {
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError(null)
    setSuccess(null)

    // Validate passwords match
    const password = formData.get("password") as string
    const confirmPassword = formData.get("confirm-password") as string

    if (password !== confirmPassword) {
      setError("Wachtwoorden komen niet overeen")
      setLoading(false)
      return
    }

    if (password.length < 8) {
      setError("Wachtwoord moet minimaal 8 tekens bevatten")
      setLoading(false)
      return
    }

    const result = await signUp(formData)

    if (result?.error) {
      setError(result.error)
    } else if (result?.success) {
      setSuccess(result.message || "Account aangemaakt!")
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-secondary flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <Calculator className="w-8 h-8 text-primary" />
          <span className="text-2xl font-semibold text-foreground">BTW Assist</span>
        </div>

        {/* Register Card */}
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl">Account aanmaken</CardTitle>
            <CardDescription>Maak een account aan om te beginnen met BTW Assist</CardDescription>
          </CardHeader>
          <form action={handleSubmit}>
            <CardContent className="space-y-4">
              {error && <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">{error}</div>}
              {success && (
                <div className="p-3 text-sm text-green-600 bg-green-50 dark:bg-green-900/20 rounded-md flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  {success}
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="name">Naam</Label>
                <Input id="name" name="name" type="text" placeholder="Uw volledige naam" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">E-mailadres</Label>
                <Input id="email" name="email" type="email" placeholder="naam@bedrijf.nl" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Wachtwoord</Label>
                <Input id="password" name="password" type="password" placeholder="Minimaal 8 tekens" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Bevestig wachtwoord</Label>
                <Input id="confirm-password" name="confirm-password" type="password" required />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <Button className="w-full" size="lg" disabled={loading || !!success}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Account aanmaken...
                  </>
                ) : (
                  "Account aanmaken"
                )}
              </Button>
              <p className="text-sm text-center text-muted-foreground">
                Al een account?{" "}
                <Link href="/login" className="text-primary hover:underline font-medium">
                  Inloggen
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>

        {/* Back to home */}
        <div className="mt-6 text-center">
          <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
            ← Terug naar home
          </Link>
        </div>
      </div>
    </div>
  )
}
