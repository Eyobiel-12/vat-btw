"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, ExternalLink, RefreshCw } from "lucide-react"
import Link from "next/link"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log error for debugging
    console.error("Client detail error:", error)
  }, [error])

  const isSchemaError = error.message.includes("schema cache") || error.message.includes("does not exist")

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full">
        <CardHeader>
          <div className="flex items-center gap-3 mb-2">
            <AlertCircle className="w-6 h-6 text-destructive" />
            <CardTitle className="text-2xl">Fout bij laden van klant</CardTitle>
          </div>
          <CardDescription>Er is een probleem opgetreden bij het ophalen van de klantgegevens</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Foutmelding</AlertTitle>
            <AlertDescription className="mt-2">{error.message}</AlertDescription>
          </Alert>

          {isSchemaError && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Database Setup Vereist</AlertTitle>
              <AlertDescription className="mt-2 space-y-2">
                <p>De database tabellen zijn nog niet aangemaakt. Volg deze stappen:</p>
                <ol className="list-decimal list-inside space-y-1 mt-2">
                  <li>
                    Open de{" "}
                    <a
                      href="https://supabase.com/dashboard/project/ftleeapkwqztmvlawudk/sql/new"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline inline-flex items-center gap-1"
                    >
                      Supabase SQL Editor <ExternalLink className="w-3 h-3" />
                    </a>
                  </li>
                  <li>Kopieer de inhoud van <code className="text-xs bg-muted px-1 py-0.5 rounded">scripts/setup.sql</code></li>
                  <li>Plak het in de SQL Editor en klik op "Run"</li>
                  <li>Wacht even en klik hieronder op "Opnieuw proberen"</li>
                </ol>
              </AlertDescription>
            </Alert>
          )}

          <div className="flex flex-col sm:flex-row gap-2">
            <Button onClick={reset} className="flex-1">
              <RefreshCw className="w-4 h-4 mr-2" />
              Opnieuw proberen
            </Button>
            <Link href="/database-setup" className="flex-1">
              <Button variant="outline" className="w-full">
                Database Setup
              </Button>
            </Link>
            <Link href="/dashboard" className="flex-1">
              <Button variant="outline" className="w-full">
                Terug naar dashboard
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

