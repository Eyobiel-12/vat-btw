"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { Calculator, Bell, User, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { signOut } from "@/lib/actions/auth"
import { toast } from "sonner"

export function DashboardHeader() {
  const router = useRouter()

  async function handleLogout() {
    const result = await signOut()
    if (result?.error) {
      toast.error("Fout bij uitloggen", {
        description: result.error,
      })
    } else {
      toast.success("Uitgelogd", {
        description: "Je bent succesvol uitgelogd.",
      })
      router.push("/login")
      router.refresh()
    }
  }

  return (
    <header className="border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10">
      <div className="flex items-center justify-between px-4 sm:px-6 py-4">
        <Link href="/dashboard" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <div className="p-2 rounded-lg bg-primary">
            <Calculator className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold text-foreground">BTW ASSIST</span>
        </Link>

        <div className="flex items-center gap-3">
          <ThemeToggle />

          <Button variant="ghost" size="icon" aria-label="Notificaties">
            <Bell className="w-5 h-5" />
            <span className="sr-only">Notificaties</span>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Account menu">
                <User className="w-5 h-5" />
                <span className="sr-only">Account menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Mijn Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/dashboard">Dashboard</Link>
              </DropdownMenuItem>
              <DropdownMenuItem disabled>Profiel</DropdownMenuItem>
              <DropdownMenuItem disabled>Instellingen</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
                <LogOut className="w-4 h-4 mr-2" />
                Uitloggen
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
