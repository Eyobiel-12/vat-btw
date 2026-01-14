import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calculator, Home, ArrowLeft } from "lucide-react"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background">
      {/* Simple Header */}
      <header className="border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10">
        <div className="flex items-center justify-between px-4 sm:px-6 py-4">
          <Link href="/dashboard" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="p-2 rounded-lg bg-primary">
              <Calculator className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">BTW ASSIST</span>
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <Card className="max-w-2xl mx-auto">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="p-4 rounded-full bg-primary/10">
                <Calculator className="w-12 h-12 sm:w-16 sm:h-16 text-primary" />
              </div>
            </div>
            <CardTitle className="text-3xl sm:text-4xl font-bold">404</CardTitle>
            <CardDescription className="text-lg sm:text-xl mt-2">
              Pagina niet gevonden
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 text-center">
            <p className="text-muted-foreground">
              De pagina die u zoekt bestaat niet of is verplaatst.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/dashboard">
                <Button size="lg" className="w-full sm:w-auto">
                  <Home className="w-4 h-4 mr-2" />
                  Naar Dashboard
                </Button>
              </Link>
              <Button
                variant="outline"
                size="lg"
                asChild
                className="w-full sm:w-auto"
              >
                <a href="javascript:history.back()">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Terug
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

