"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "lucide-react"
import { useState, useEffect } from "react"

interface PeriodSelectorProps {
  clientId: string
  currentYear?: number
  currentPeriodType?: "maand" | "kwartaal" | "jaar"
  currentPeriod?: number
}

export function PeriodSelector({ 
  clientId, 
  currentYear, 
  currentPeriodType = "maand", 
  currentPeriod 
}: PeriodSelectorProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [year, setYear] = useState<number>(currentYear || new Date().getFullYear())
  const [periodType, setPeriodType] = useState<"maand" | "kwartaal" | "jaar">(currentPeriodType)
  const [period, setPeriod] = useState<number>(currentPeriod || (periodType === "kwartaal" ? getCurrentQuarter() : new Date().getMonth() + 1))

  // Get values from URL params if available
  useEffect(() => {
    const urlYear = searchParams.get("jaar")
    const urlPeriodType = searchParams.get("periodeType") as "maand" | "kwartaal" | "jaar" | null
    const urlPeriod = searchParams.get("periode")
    
    if (urlYear) setYear(parseInt(urlYear))
    if (urlPeriodType) setPeriodType(urlPeriodType)
    if (urlPeriod) setPeriod(parseInt(urlPeriod))
  }, [searchParams])

  function getCurrentQuarter(): number {
    const month = new Date().getMonth() + 1
    return Math.ceil(month / 3)
  }

  function handlePeriodChange(value: string) {
    // Parse value format: "2026-Q1" or "2026-01" or "2026-jaar"
    const parts = value.split("-")
    const newYear = parseInt(parts[0])
    
    if (parts[1].startsWith("Q")) {
      // Quarterly: "2026-Q1" -> Q1 = period 1
      const quarter = parseInt(parts[1].substring(1))
      setYear(newYear)
      setPeriodType("kwartaal")
      setPeriod(quarter)
      updateURL(newYear, "kwartaal", quarter)
    } else if (parts[1] === "jaar") {
      // Yearly
      setYear(newYear)
      setPeriodType("jaar")
      setPeriod(0)
      updateURL(newYear, "jaar", 0)
    } else {
      // Monthly: "2026-01" -> month 1
      const month = parseInt(parts[1])
      setYear(newYear)
      setPeriodType("maand")
      setPeriod(month)
      updateURL(newYear, "maand", month)
    }
  }

  function updateURL(year: number, type: "maand" | "kwartaal" | "jaar", period: number) {
    const params = new URLSearchParams()
    params.set("jaar", year.toString())
    params.set("periodeType", type)
    params.set("periode", period.toString())
    router.push(`/dashboard/clients/${clientId}/btw?${params.toString()}`)
  }

  // Generate period options
  function generatePeriodOptions() {
    const options: Array<{ value: string; label: string }> = []
    const currentDate = new Date()
    const currentYear = currentDate.getFullYear()
    
    // Add current and previous 2 years
    for (let y = currentYear; y >= currentYear - 2; y--) {
      // Add quarters for each year
      for (let q = 4; q >= 1; q--) {
        const quarterMonths = getQuarterMonths(q)
        const quarterLabel = `Q${q} ${y} (${quarterMonths})`
        options.push({
          value: `${y}-Q${q}`,
          label: quarterLabel,
        })
      }
      
      // Add months for current year and previous year
      if (y >= currentYear - 1) {
        const maxMonth = y === currentYear ? currentDate.getMonth() + 1 : 12
        for (let m = maxMonth; m >= 1; m--) {
          const monthName = new Date(y, m - 1).toLocaleDateString("nl-NL", { month: "long" })
          options.push({
            value: `${y}-${m.toString().padStart(2, "0")}`,
            label: `${monthName.charAt(0).toUpperCase() + monthName.slice(1)} ${y}`,
          })
        }
      }
      
      // Add yearly option
      if (y < currentYear) {
        options.push({
          value: `${y}-jaar`,
          label: `Jaar ${y}`,
        })
      }
    }
    
    return options
  }

  function getQuarterMonths(quarter: number): string {
    const monthNames = ["jan", "feb", "mrt", "apr", "mei", "jun", "jul", "aug", "sep", "okt", "nov", "dec"]
    const startMonth = (quarter - 1) * 3
    return `${monthNames[startMonth]}-${monthNames[startMonth + 2]}`
  }

  function getCurrentValue(): string {
    if (periodType === "kwartaal") {
      return `${year}-Q${period}`
    } else if (periodType === "jaar") {
      return `${year}-jaar`
    } else {
      return `${year}-${period.toString().padStart(2, "0")}`
    }
  }

  const options = generatePeriodOptions()
  const currentValue = getCurrentValue()

  return (
    <div className="flex items-center gap-4">
      <span className="text-sm font-medium text-foreground">Periode:</span>
      <Select value={currentValue} onValueChange={handlePeriodChange}>
        <SelectTrigger className="w-[250px]">
          <Calendar className="w-4 h-4 mr-2" />
          <SelectValue placeholder="Selecteer periode" />
        </SelectTrigger>
        <SelectContent className="max-h-[400px]">
          <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground border-b">
            Kwartalen
          </div>
          {options.filter(opt => opt.value.includes("Q")).map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
          <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground border-b border-t mt-1">
            Maanden
          </div>
          {options.filter(opt => !opt.value.includes("Q") && !opt.value.includes("jaar")).map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
          {options.filter(opt => opt.value.includes("jaar")).length > 0 && (
            <>
              <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground border-b border-t mt-1">
                Jaren
              </div>
              {options.filter(opt => opt.value.includes("jaar")).map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </>
          )}
        </SelectContent>
      </Select>
    </div>
  )
}

