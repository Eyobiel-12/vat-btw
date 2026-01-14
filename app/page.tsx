import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Calculator, FileSpreadsheet, TrendingUp, Shield, CheckCircle2, Users, Sparkles, Zap, BarChart3 } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
      {/* Header */}
      <header className="border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="p-2 rounded-lg bg-primary shadow-lg">
              <Calculator className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold text-foreground">BTW ASSIST</span>
          </Link>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link href="/login">
              <Button variant="ghost" className="hidden sm:inline-flex">Inloggen</Button>
            </Link>
            <Link href="/register">
              <Button className="bg-primary hover:bg-primary/90 shadow-md hover:shadow-lg transition-shadow">
                Start Gratis
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 lg:py-24">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6 border border-primary/20">
            <Sparkles className="w-4 h-4" />
            Sinds 2019 • Betrouwbare Service
          </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-foreground mb-6 text-balance leading-tight">
              Professionele BTW Automatisering voor{" "}
              <span className="text-primary bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Nederlandse Boekhouders
              </span>
            </h1>
            <p className="text-lg sm:text-xl lg:text-2xl text-muted-foreground mb-10 text-pretty max-w-3xl mx-auto leading-relaxed">
              Automatische BTW-berekening, grootboek beheer en aangifte verwerking volgens Belastingdienst-richtlijnen. 
              <span className="block mt-2 font-medium text-foreground">Bespaar tijd, vermijd fouten, groei met vertrouwen.</span>
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
              <Link href="/register">
                <Button size="lg" className="w-full sm:w-auto text-base px-8 py-6 bg-primary hover:bg-primary/90 shadow-lg hover:shadow-xl transition-all">
                  <Zap className="w-5 h-5 mr-2" />
                  Start Nu Gratis
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline" className="w-full sm:w-auto text-base px-8 py-6 border-2">
                  Inloggen
                </Button>
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="text-center p-6 rounded-xl bg-card border border-border/50 hover:border-primary/30 transition-colors">
              <div className="text-4xl sm:text-5xl font-bold text-primary mb-2">200+</div>
              <div className="text-sm sm:text-base text-muted-foreground font-medium">Tevreden Klanten</div>
            </div>
            <div className="text-center p-6 rounded-xl bg-card border border-border/50 hover:border-primary/30 transition-colors">
              <div className="text-4xl sm:text-5xl font-bold text-primary mb-2">5+</div>
              <div className="text-sm sm:text-base text-muted-foreground font-medium">Jaar Ervaring</div>
            </div>
            <div className="text-center p-6 rounded-xl bg-card border border-border/50 hover:border-primary/30 transition-colors">
              <div className="text-4xl sm:text-5xl font-bold text-primary mb-2">100%</div>
              <div className="text-sm sm:text-base text-muted-foreground font-medium">Betrouwbaarheid</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="bg-muted/30 py-20 lg:py-28 border-y border-border/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
              Waarom BTW Assist?
            </h2>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Wij bieden professionele boekhouding met aandacht voor detail en persoonlijke service
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            <div className="bg-card p-6 sm:p-8 rounded-xl border border-border/50 shadow-sm hover:shadow-lg hover:border-primary/30 transition-all duration-200 group">
              <div className="p-3 rounded-xl bg-primary/10 group-hover:bg-primary/20 w-fit mb-4 transition-colors">
                <Users className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-card-foreground mb-3">Ervaren Team</h3>
              <p className="text-muted-foreground leading-relaxed text-sm sm:text-base">
                Meer dan 5 jaar ervaring in de branche met bewezen resultaten en expertise
              </p>
            </div>

            <div className="bg-card p-6 sm:p-8 rounded-xl border border-border/50 shadow-sm hover:shadow-lg hover:border-primary/30 transition-all duration-200 group">
              <div className="p-3 rounded-xl bg-primary/10 group-hover:bg-primary/20 w-fit mb-4 transition-colors">
                <FileSpreadsheet className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-card-foreground mb-3">Persoonlijke Aanpak</h3>
              <p className="text-muted-foreground leading-relaxed text-sm sm:text-base">
                Elke klant krijgt persoonlijke aandacht en maatwerk oplossingen op maat
              </p>
            </div>

            <div className="bg-card p-6 sm:p-8 rounded-xl border border-border/50 shadow-sm hover:shadow-lg hover:border-primary/30 transition-all duration-200 group">
              <div className="p-3 rounded-xl bg-primary/10 group-hover:bg-primary/20 w-fit mb-4 transition-colors">
                <Shield className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-card-foreground mb-3">Professioneel</h3>
              <p className="text-muted-foreground leading-relaxed text-sm sm:text-base">
                Betrouwbaar, punctueel en altijd met de hoogste standaarden
              </p>
            </div>

            <div className="bg-card p-6 sm:p-8 rounded-xl border border-border/50 shadow-sm hover:shadow-lg hover:border-primary/30 transition-all duration-200 group">
              <div className="p-3 rounded-xl bg-primary/10 group-hover:bg-primary/20 w-fit mb-4 transition-colors">
                <TrendingUp className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-card-foreground mb-3">Efficiënte Service</h3>
              <p className="text-muted-foreground leading-relaxed text-sm sm:text-base">
                Snelle en effectieve werkwijze zonder in te boeten op kwaliteit
              </p>
            </div>

            <div className="bg-card p-6 sm:p-8 rounded-xl border border-border/50 shadow-sm hover:shadow-lg hover:border-primary/30 transition-all duration-200 group">
              <div className="p-3 rounded-xl bg-primary/10 group-hover:bg-primary/20 w-fit mb-4 transition-colors">
                <Calculator className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-card-foreground mb-3">Automatische BTW</h3>
              <p className="text-muted-foreground leading-relaxed text-sm sm:text-base">
                Correcte BTW-berekening volgens Belastingdienst-rubrieken (1a, 1b, 5b)
              </p>
            </div>

            <div className="bg-card p-6 sm:p-8 rounded-xl border border-border/50 shadow-sm hover:shadow-lg hover:border-primary/30 transition-all duration-200 group">
              <div className="p-3 rounded-xl bg-primary/10 group-hover:bg-primary/20 w-fit mb-4 transition-colors">
                <BarChart3 className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-card-foreground mb-3">Kwaliteit</h3>
              <p className="text-muted-foreground leading-relaxed text-sm sm:text-base">
                We streven naar perfectie en excellentie in alles wat we doen
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20 lg:py-28">
        <div className="max-w-4xl mx-auto text-center bg-gradient-to-br from-primary/10 via-primary/5 to-background rounded-2xl p-12 border border-primary/20 shadow-lg">
          <h2 className="text-3xl lg:text-5xl font-bold text-foreground mb-4">Klaar om te beginnen?</h2>
          <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
            Start vandaag nog met professionele BTW-automatisering en ervaar het verschil
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/register">
              <Button size="lg" className="text-base px-8 py-6 bg-primary hover:bg-primary/90">
                Gratis Account Aanmaken
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="text-base px-8 py-6">
                Al een account? Inloggen
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 bg-muted/30 mt-20">
        <div className="container mx-auto px-4 py-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary shadow-md">
                <Calculator className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <div className="font-bold text-foreground text-lg">BTW ASSIST</div>
                <div className="text-sm text-muted-foreground">Professionele boekhoudondersteuning</div>
              </div>
            </div>
            <div className="flex flex-col items-center md:items-end gap-2">
              <p className="text-sm text-muted-foreground">© 2026 BTW Assist. Alle rechten voorbehouden.</p>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <Link href="/login" className="hover:text-foreground transition-colors">Inloggen</Link>
                <span>•</span>
                <Link href="/register" className="hover:text-foreground transition-colors">Registreren</Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
