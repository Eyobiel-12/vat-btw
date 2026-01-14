import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Calculator, FileSpreadsheet, TrendingUp, Shield, CheckCircle2, Users } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary">
              <Calculator className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold text-foreground">BTW ASSIST</span>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link href="/login">
              <Button variant="ghost">Inloggen</Button>
            </Link>
            <Link href="/register">
              <Button className="bg-primary hover:bg-primary/90">Boek Een Afspraak</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section - MARCOFIC inspired */}
      <section className="container mx-auto px-4 py-20 lg:py-32">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-block px-4 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
            Sinds 2019
          </div>
          <h1 className="text-5xl lg:text-7xl font-bold text-foreground mb-6 text-balance leading-tight">
            Professionele boekhouding met meer dan <span className="text-primary">200 tevreden klanten</span>
          </h1>
          <p className="text-lg lg:text-xl text-muted-foreground mb-10 text-pretty max-w-3xl mx-auto leading-relaxed">
            Automatische BTW-berekening en grootboek beheer volgens Belastingdienst-richtlijnen. Bespaar tijd, vermijd
            fouten, groei met vertrouwen.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link href="/register">
              <Button size="lg" className="w-full sm:w-auto text-base px-8 py-6 bg-primary hover:bg-primary/90">
                Boek Een Afspraak
              </Button>
            </Link>
            <Link href="#features">
              <Button size="lg" variant="outline" className="w-full sm:w-auto text-base px-8 py-6 bg-transparent">
                Meer Informatie
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">200+</div>
              <div className="text-sm text-muted-foreground">Tevreden Klanten</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">5+</div>
              <div className="text-sm text-muted-foreground">Jaar Ervaring</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">100%</div>
              <div className="text-sm text-muted-foreground">Betrouwbaarheid</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="bg-muted/30 py-20 lg:py-28">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-5xl font-bold text-foreground mb-4">Waarom BTW Assist?</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Wij bieden professionele boekhouding met aandacht voor detail en persoonlijke service
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="bg-card p-8 rounded-xl border border-border shadow-sm hover:shadow-md transition-shadow">
              <div className="p-3 rounded-lg bg-primary/10 w-fit mb-4">
                <Users className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-card-foreground mb-3">Ervaren Team</h3>
              <p className="text-muted-foreground leading-relaxed">
                Meer dan 5 jaar ervaring in de branche met bewezen resultaten en expertise
              </p>
            </div>

            <div className="bg-card p-8 rounded-xl border border-border shadow-sm hover:shadow-md transition-shadow">
              <div className="p-3 rounded-lg bg-primary/10 w-fit mb-4">
                <FileSpreadsheet className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-card-foreground mb-3">Persoonlijke Aanpak</h3>
              <p className="text-muted-foreground leading-relaxed">
                Elke klant krijgt persoonlijke aandacht en maatwerk oplossingen op maat
              </p>
            </div>

            <div className="bg-card p-8 rounded-xl border border-border shadow-sm hover:shadow-md transition-shadow">
              <div className="p-3 rounded-lg bg-primary/10 w-fit mb-4">
                <Shield className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-card-foreground mb-3">Professioneel</h3>
              <p className="text-muted-foreground leading-relaxed">
                Betrouwbaar, punctueel en altijd met de hoogste standaarden
              </p>
            </div>

            <div className="bg-card p-8 rounded-xl border border-border shadow-sm hover:shadow-md transition-shadow">
              <div className="p-3 rounded-lg bg-primary/10 w-fit mb-4">
                <TrendingUp className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-card-foreground mb-3">Efficiënte Service</h3>
              <p className="text-muted-foreground leading-relaxed">
                Snelle en effectieve werkwijze zonder in te boeten op kwaliteit
              </p>
            </div>

            <div className="bg-card p-8 rounded-xl border border-border shadow-sm hover:shadow-md transition-shadow">
              <div className="p-3 rounded-lg bg-primary/10 w-fit mb-4">
                <Calculator className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-card-foreground mb-3">Automatische BTW</h3>
              <p className="text-muted-foreground leading-relaxed">
                Correcte BTW-berekening volgens Belastingdienst-rubrieken (1a, 1b, 5b)
              </p>
            </div>

            <div className="bg-card p-8 rounded-xl border border-border shadow-sm hover:shadow-md transition-shadow">
              <div className="p-3 rounded-lg bg-primary/10 w-fit mb-4">
                <CheckCircle2 className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-card-foreground mb-3">Kwaliteit</h3>
              <p className="text-muted-foreground leading-relaxed">
                We streven naar perfectie en excellentie in alles wat we doen
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20 lg:py-28">
        <div className="max-w-4xl mx-auto text-center bg-primary/5 rounded-2xl p-12 border border-primary/20">
          <h2 className="text-3xl lg:text-5xl font-bold text-foreground mb-4">Klaar om te beginnen?</h2>
          <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
            Boek vandaag nog je afspraak en ervaar het verschil van professionele boekhouding
          </p>
          <Link href="/register">
            <Button size="lg" className="text-base px-8 py-6 bg-primary hover:bg-primary/90">
              Boek Nu Je Afspraak
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 bg-muted/30">
        <div className="container mx-auto px-4 py-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary">
                <Calculator className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <div className="font-bold text-foreground">BTW ASSIST</div>
                <div className="text-sm text-muted-foreground">Professionele boekhoudondersteuning</div>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">© 2026 BTW Assist. Alle rechten voorbehouden.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
