"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Info } from "lucide-react"
import { BTW_CODES, suggestBTWCode, formatBTWCode, type BTWCodeInfo } from "@/lib/utils/btw-helpers"

interface BTWCodeSelectProps {
  value?: string | null
  onValueChange: (value: string) => void
  accountType?: string | null
  accountDescription?: string
  showTooltip?: boolean
}

export function BTWCodeSelect({
  value,
  onValueChange,
  accountType,
  accountDescription,
  showTooltip = true,
}: BTWCodeSelectProps) {
  // Get suggested code based on account type
  const suggestedCode = suggestBTWCode(accountType || null, accountDescription)

  // Get current code info
  const currentCodeInfo: BTWCodeInfo | null = value ? BTW_CODES[value] || null : null

  return (
    <div className="flex items-center gap-2">
      <Select value={value || "none"} onValueChange={(val) => onValueChange(val === "none" ? "" : val)}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Selecteer BTW-code">
            {value ? formatBTWCode(value) : "Selecteer BTW-code"}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="none">Geen BTW</SelectItem>
          {Object.values(BTW_CODES).map((codeInfo) => (
            <SelectItem key={codeInfo.code} value={codeInfo.code}>
              <div className="flex flex-col">
                <span className="font-medium">
                  {codeInfo.code} - {codeInfo.description}
                </span>
                <span className="text-xs text-muted-foreground">
                  {codeInfo.percentage}% • {codeInfo.rubriek}
                </span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {showTooltip && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="w-4 h-4 text-muted-foreground cursor-help" />
            </TooltipTrigger>
            <TooltipContent className="max-w-sm">
              <div className="space-y-2">
                {currentCodeInfo ? (
                  <>
                    <p className="font-semibold">{currentCodeInfo.description}</p>
                    <p className="text-sm">
                      <strong>Tarief:</strong> {currentCodeInfo.percentage}%
                    </p>
                    <p className="text-sm">
                      <strong>Rubriek:</strong> {currentCodeInfo.rubriek}
                    </p>
                    <p className="text-sm">
                      <strong>Type:</strong> {currentCodeInfo.type}
                    </p>
                  </>
                ) : (
                  <p>Selecteer een BTW-code om informatie te zien</p>
                )}
                {suggestedCode && suggestedCode !== value && (
                  <p className="text-xs text-primary mt-2">
                    💡 Suggestie: {formatBTWCode(suggestedCode)} (op basis van rekeningtype)
                  </p>
                )}
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  )
}

