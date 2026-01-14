"use client"

import { useState, useEffect, Suspense } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Calculator, Loader2, AlertCircle, ExternalLink, Eye, EyeOff, CheckCircle2 } from "lucide-react"
import { signIn } from "@/lib/actions/auth"
import { toast } from "sonner"

function LoginPageContent() {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [configError, setConfigError] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    // Check if redirected from middleware with config error
    if (searchParams.get("error") === "config") {
      setConfigError(true)
    }
  }, [searchParams])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const result = await signIn(formData)

    if (result?.error) {
      setError(result.error)
      setLoading(false)
      toast.error("Inloggen mislukt", {
        description: result.error,
      })
    } else {
      toast.success("Succesvol ingelogd!", {
        description: "Welkom terug bij BTW Assist",
      })
    }
    // If successful, signIn redirects to /dashboard
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary to-background flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex flex-col items-center gap-3 mb-8">
          <div className="p-3 rounded-xl bg-primary/10">
            <Calculator className="w-10 h-10 text-primary" />
          </div>
          <div className="text-center">
            <h1 className="text-3xl font-bold text-foreground">BTW Assist</h1>
            <p className="text-sm text-muted-foreground mt-1">Nederlandse BTW Automatisering</p>
          </div>
        </div>

        {/* Login Card */}
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl">Inloggen</CardTitle>
            <CardDescription>Voer uw e-mailadres en wachtwoord in om in te loggen</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {configError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Supabase niet geconfigureerd</AlertTitle>
                  <AlertDescription className="mt-2">
                    <p className="mb-2">
                      De Supabase-omgevingsvariabelen ontbreken. Voeg deze toe aan uw <code className="text-xs bg-muted px-1 py-0.5 rounded">.env.local</code> bestand:
                    </p>
                    <pre className="text-xs bg-muted p-2 rounded mt-2 mb-2 overflow-x-auto">
                      NEXT_PUBLIC_SUPABASE_URL=your-project-url{`\n`}NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
                    </pre>
                    <a
                      href="https://supabase.com/dashboard/project/_/settings/api"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline inline-flex items-center gap-1 mt-2"
                    >
                      Haal uw credentials op <ExternalLink className="h-3 w-3" />
                    </a>
                  </AlertDescription>
                </Alert>
              )}
              {error && !configError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Inloggen mislukt</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <div className="space-y-2">
                <Label htmlFor="email">E-mailadres</Label>
                <Input 
                  id="email" 
                  name="email" 
                  type="email" 
                  placeholder="naam@bedrijf.nl" 
                  required 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Wachtwoord</Label>
                  <Link href="/forgot-password" className="text-sm text-primary hover:underline">
                    Vergeten?
                  </Link>
                </div>
                <div className="relative">
                  <Input 
                    id="password" 
                    name="password" 
                    type={showPassword ? "text" : "password"} 
                    required 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    className="h-11 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    aria-label={showPassword ? "Wachtwoord verbergen" : "Wachtwoord tonen"}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <Button className="w-full" size="lg" disabled={loading || !email || !password}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Bezig met inloggen...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Inloggen
                  </>
                )}
              </Button>
              <p className="text-sm text-center text-muted-foreground">
                Nog geen account?{" "}
                <Link href="/register" className="text-primary hover:underline font-medium">
                  Registreren
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

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-secondary flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="flex items-center justify-center gap-2 mb-8">
            <span className="text-2xl font-semibold text-foreground">BTW Assist</span>
          </div>
          <div className="text-center text-muted-foreground">Laden...</div>
        </div>
      </div>
    }>
      <LoginPageContent />
    </Suspense>
  )
}
