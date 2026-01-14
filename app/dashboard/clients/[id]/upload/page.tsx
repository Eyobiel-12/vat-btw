"use client"

import { useState, useRef, use } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DashboardHeader } from "@/components/dashboard-header"
import { Breadcrumbs } from "@/components/breadcrumbs"
import { Progress } from "@/components/ui/progress"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { ArrowLeft, Upload, FileSpreadsheet, AlertCircle, CheckCircle2, Loader2, AlertTriangle, HelpCircle, Download, File, X, Sparkles } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { parseGrootboekExcel, parseBoekingsregelsExcel } from "@/lib/utils/excel-parser"
import { importGrootboekFromCSV } from "@/lib/actions/grootboek"
import { importBoekingsregelsFromCSV } from "@/lib/actions/boekingsregels"
import { downloadTemplate } from "@/lib/utils/template-generator"
import { toast } from "sonner"

export default function UploadPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { id: clientId } = use(params)
  const [uploadType, setUploadType] = useState<"grootboek" | "boekingsregels" | "facturen" | null>(null)
  const [uploadStatus, setUploadStatus] = useState<"idle" | "uploading" | "success" | "error">("idle")
  const [uploadMessage, setUploadMessage] = useState<string>("")
  const [errors, setErrors] = useState<string[]>([])
  const [warnings, setWarnings] = useState<string[]>([])
  const [recordsProcessed, setRecordsProcessed] = useState<number>(0)
  const [uploadProgress, setUploadProgress] = useState<number>(0)
  const [fileName, setFileName] = useState<string>("")
  const [fileSize, setFileSize] = useState<number>(0)
  const [isDragging, setIsDragging] = useState<boolean>(false)
  const [showSuccess, setShowSuccess] = useState<boolean>(false)
  const [currentStep, setCurrentStep] = useState<string>("")

  if (!clientId || clientId === "undefined") {
    return (
      <div className="min-h-screen bg-background">
        <DashboardHeader />
        <main className="container mx-auto px-6 py-8">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Fout</AlertTitle>
            <AlertDescription>Ongeldige client ID</AlertDescription>
          </Alert>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />

      <main className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Breadcrumbs */}
        <div className="mb-6">
          <Breadcrumbs
            items={[
              { label: "Klanten", href: "/dashboard" },
              { label: "Klant", href: `/dashboard/clients/${clientId}` },
              { label: "Upload" },
            ]}
          />
        </div>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">Data Importeren</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Upload grootboek schema of boekingsregels vanuit Excel/CSV
          </p>
        </div>

        {/* Upload Type Selection */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card
            className={`cursor-pointer transition-all hover:shadow-md ${
              uploadType === "grootboek" ? "ring-2 ring-primary" : ""
            }`}
            onClick={() => setUploadType("grootboek")}
          >
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-3 rounded-lg bg-primary/10">
                  <FileSpreadsheet className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>Grootboek Schema</CardTitle>
              </div>
              <CardDescription>Upload een CSV/Excel bestand met grootboekrekeningen</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2 mb-2">
                  <p className="font-medium text-foreground">Vereiste kolommen:</p>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="w-4 h-4 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs">
                          Zorg dat je Excel bestand deze kolommen bevat. De eerste rij moet kolomkoppen zijn.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <ul className="list-disc list-inside space-y-1">
                  <li>grootboeknummer</li>
                  <li>omschrijving</li>
                  <li>categorie (Activa/Passiva/Kosten/Opbrengsten/BTW)</li>
                  <li>btw_code (optioneel: OH, OL, OV, VH, VL, 0)</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card
            className={`cursor-pointer transition-all hover:shadow-md ${
              uploadType === "boekingsregels" ? "ring-2 ring-primary" : ""
            }`}
            onClick={() => setUploadType("boekingsregels")}
          >
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-3 rounded-lg bg-primary/10">
                  <Upload className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>Boekingsregels</CardTitle>
              </div>
              <CardDescription>Upload transacties en boekingen vanuit uw boekhoudpakket</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p className="font-medium text-foreground mb-2">Vereiste kolommen:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>date (DD-MM-YYYY)</li>
                  <li>grootboeknummer</li>
                  <li>omschrijving</li>
                  <li>debet (bedrag of leeg)</li>
                  <li>credit (bedrag of leeg)</li>
                  <li>btw_code</li>
                </ul>
                <p className="text-xs mt-2 text-primary font-medium">
                  💡 Tip: Ontbrekende datums worden automatisch ingevuld!
                </p>
              </div>
            </CardContent>
          </Card>

          <Card
            className={`cursor-pointer transition-all hover:shadow-md ${
              uploadType === "facturen" ? "ring-2 ring-primary" : ""
            }`}
            onClick={() => setUploadType("facturen")}
          >
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-3 rounded-lg bg-primary/10">
                  <Upload className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>Facturen/Receipts</CardTitle>
              </div>
              <CardDescription>Upload facturen (Afbeelding) - OCR Automatische extractie</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p className="font-medium text-foreground mb-2">Beschikbaar nu:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Upload afbeelding van facturen (.png, .jpg, .jpeg)</li>
                  <li>Automatische data extractie (OCR)</li>
                  <li>Automatisch boekingsregels aanmaken</li>
                  <li>BTW automatisch berekenen volgens Nederlandse regels</li>
                </ul>
                <Alert className="mt-3 border-green-500 bg-green-50 dark:bg-green-950">
                  <AlertCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-xs text-green-700 dark:text-green-300">
                    <strong>OCR Functionaliteit Actief!</strong> Upload een factuur afbeelding en het systeem extraheert automatisch alle gegevens.
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Upload Area */}
        {uploadType && (
          <Card>
            <CardHeader>
              <CardTitle>
                {uploadType === "grootboek"
                  ? "Grootboek Schema Uploaden"
                  : uploadType === "facturen"
                  ? "Facturen/Receipts Uploaden"
                  : "Boekingsregels Uploaden"}
              </CardTitle>
              <CardDescription>
                {uploadType === "facturen"
                  ? "Upload PDF of afbeelding van facturen (binnenkort beschikbaar)"
                  : "Sleep uw bestand hier of klik om te selecteren"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Drop Zone */}
              <div
                className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
                  isDragging
                    ? "border-primary bg-primary/5 scale-105 shadow-lg cursor-pointer"
                    : "border-border hover:border-primary hover:bg-muted/50 cursor-pointer"
                }`}
                onDragEnter={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  setIsDragging(true)
                }}
                onDragLeave={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  setIsDragging(false)
                }}
                onDragOver={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  setIsDragging(true)
                }}
                onDrop={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  setIsDragging(false)
                  const files = e.dataTransfer.files
                  if (files.length > 0) {
                    handleFileUpload(files[0])
                  }
                }}
                onClick={() => {
                  fileInputRef.current?.click()
                }}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={
                    uploadType === "grootboek"
                      ? ".xlsx,.xls,.csv"
                      : uploadType === "facturen"
                      ? ".png,.jpg,.jpeg,.webp"
                      : ".xlsx,.xls,.csv"
                  }
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) {
                      handleFileUpload(file)
                    }
                  }}
                />
                <div className="flex flex-col items-center gap-4">
                  <div className="p-4 rounded-full bg-primary/10">
                    <Upload className="w-8 h-8 text-primary" />
                  </div>
                  <div>
                    <p className="text-lg font-medium text-foreground mb-1">
                      {isDragging ? "Laat los om te uploaden" : "Sleep uw bestand hier"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {uploadType === "facturen"
                        ? "of klik om een factuur afbeelding (.png, .jpg, .jpeg) te selecteren"
                        : "of klik om een Excel (.xlsx, .xls) of CSV bestand te selecteren"}
                    </p>
                  </div>
                  <Button type="button" variant={isDragging ? "default" : "outline"}>
                    {isDragging ? "Laat Los" : "Bestand Selecteren"}
                  </Button>
                </div>
              </div>

              {/* Upload Status */}
              {uploadStatus === "uploading" && (
                <div className="space-y-4">
                  <Alert>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <AlertTitle>Bestand wordt verwerkt...</AlertTitle>
                    <AlertDescription>
                      {fileName && <span className="block mb-2 font-medium">{fileName}</span>}
                      {currentStep && (
                        <span className="block mb-1 text-sm font-medium text-primary">{currentStep}</span>
                      )}
                      Even geduld, uw Excel bestand wordt gelezen en gevalideerd.
                    </AlertDescription>
                  </Alert>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Voortgang</span>
                      <span className="text-foreground font-medium">{uploadProgress}%</span>
                    </div>
                    <Progress value={uploadProgress} className="h-3" />
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <div
                        className={`h-2 w-2 rounded-full ${
                          uploadProgress >= 30 ? "bg-primary" : "bg-muted"
                        }`}
                      />
                      <span>Bestand lezen</span>
                      <div
                        className={`h-2 w-2 rounded-full ${
                          uploadProgress >= 60 ? "bg-primary" : "bg-muted"
                        }`}
                      />
                      <span>Valideren</span>
                      <div
                        className={`h-2 w-2 rounded-full ${
                          uploadProgress >= 90 ? "bg-primary" : "bg-muted"
                        }`}
                      />
                      <span>Importeren</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Errors */}
              {errors.length > 0 && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Fouten gevonden ({errors.length})</AlertTitle>
                  <AlertDescription className="space-y-2">
                    <ul className="list-disc list-inside space-y-1 mt-2 max-h-60 overflow-y-auto">
                      {errors.slice(0, 15).map((error, idx) => (
                        <li key={idx} className="text-sm">{error}</li>
                      ))}
                      {errors.length > 15 && (
                        <li className="text-muted-foreground text-xs">
                          ... en {errors.length - 15} meer fouten
                        </li>
                      )}
                    </ul>
                    {uploadType === "boekingsregels" && (
                      <div className="mt-3 p-3 bg-destructive/10 rounded-md">
                        <p className="text-xs font-semibold mb-1">💡 Tips om fouten op te lossen:</p>
                        <ul className="text-xs space-y-1 list-disc list-inside">
                          <li>Zorg dat de eerste rij kolomnamen bevat (datum, grootboeknummer, omschrijving)</li>
                          <li>Lege rijen worden automatisch overgeslagen</li>
                          <li>Ontbrekende datums worden automatisch ingevuld (vorige regel of vandaag)</li>
                          <li>Download een template om de juiste structuur te zien</li>
                        </ul>
                      </div>
                    )}
                  </AlertDescription>
                </Alert>
              )}

              {/* Warnings */}
              {warnings.length > 0 && (
                <Alert className="border-yellow-500 bg-yellow-50 dark:bg-yellow-950">
                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  <AlertTitle className="text-yellow-800 dark:text-yellow-200">Waarschuwingen</AlertTitle>
                  <AlertDescription className="text-yellow-700 dark:text-yellow-300">
                    <ul className="list-disc list-inside space-y-1 mt-2">
                      {warnings.map((warning, idx) => (
                        <li key={idx}>{warning}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}

              {/* Info Alert */}
              {uploadType === "boekingsregels" && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Let op</AlertTitle>
                  <AlertDescription>
                    <p className="mb-2">
                      Zorg ervoor dat uw bestand de juiste kolomnamen bevat. De eerste rij moet de kolomkoppen bevatten.
                    </p>
                    <p className="text-xs mt-2">
                      <strong>Vereiste kolommen:</strong> datum, grootboeknummer, omschrijving, debet OF credit
                    </p>
                    <p className="text-xs mt-1">
                      <strong>Tip:</strong> Lege rijen worden automatisch overgeslagen. Ontbrekende datums worden automatisch ingevuld.
                    </p>
                  </AlertDescription>
                </Alert>
              )}
              {uploadType === "grootboek" && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Let op</AlertTitle>
                  <AlertDescription>
                    <p className="mb-2">
                      Zorg ervoor dat uw bestand de juiste kolomnamen bevat. De eerste rij moet de kolomkoppen bevatten.
                    </p>
                    <p className="text-xs mt-2 font-semibold">💡 Slimme functies:</p>
                    <ul className="text-xs mt-1 space-y-1 list-disc list-inside">
                      <li>Lege rijen worden automatisch overgeslagen</li>
                      <li>Ontbrekende grootboeknummers worden automatisch gegenereerd</li>
                      <li>Categorie kan worden afgeleid van grootboeknummer (1000-1999 = Activa, 8000-8999 = Omzet, etc.)</li>
                      <li>Grootboeknummers kunnen worden geëxtraheerd uit omschrijving (bijv. "1000 - Kas")</li>
                    </ul>
                  </AlertDescription>
                </Alert>
              )}
              {uploadType === "facturen" && (
                <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
                  <AlertCircle className="h-4 w-4 text-green-600" />
                  <AlertTitle className="text-green-800 dark:text-green-200">OCR Factuur Verwerking</AlertTitle>
                  <AlertDescription className="text-green-700 dark:text-green-300">
                    <p className="mb-2">
                      <strong>Upload een factuur (PDF of afbeelding)</strong> en het systeem extraheert automatisch:
                    </p>
                    <ul className="text-sm mt-1 space-y-1 list-disc list-inside">
                      <li>Factuurnummer en datum</li>
                      <li>Totaalbedrag en BTW bedrag</li>
                      <li>BTW percentage (21% of 9%)</li>
                      <li>Leverancier naam</li>
                    </ul>
                    <p className="text-sm font-semibold mt-3">Slimme BTW Verwerking:</p>
                    <ul className="text-sm mt-1 space-y-1 list-disc list-inside">
                      <li>Automatische BTW-code toewijzing (5b voor 21%, 5b-laag voor 9%)</li>
                      <li>Correcte boekingsregels volgens Nederlandse regels</li>
                      <li>Voorbelasting op debet kant (kosten)</li>
                    </ul>
                  </AlertDescription>
                </Alert>
              )}

              {/* Success State */}
              {uploadStatus === "success" && (
                <Alert className="border-primary bg-primary/5">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  <AlertTitle>Upload geslaagd!</AlertTitle>
                  <AlertDescription>
                    {uploadMessage || `${recordsProcessed} regels zijn succesvol geïmporteerd.`}
                  </AlertDescription>
                </Alert>
              )}

              {/* Error State */}
              {uploadStatus === "error" && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Upload mislukt</AlertTitle>
                  <AlertDescription className="space-y-2">
                    <p>{uploadMessage || "Er is een fout opgetreden bij het uploaden."}</p>
                    {errors.length > 0 && (
                      <div className="mt-3">
                        <p className="font-semibold mb-2">Fouten gevonden:</p>
                        <ul className="list-disc list-inside space-y-1 text-sm max-h-40 overflow-y-auto">
                          {errors.slice(0, 10).map((error, i) => (
                            <li key={i}>{error}</li>
                          ))}
                          {errors.length > 10 && (
                            <li className="text-muted-foreground">
                              ... en {errors.length - 10} meer fouten
                            </li>
                          )}
                        </ul>
                        <p className="text-xs mt-2 text-muted-foreground">
                          💡 Tip: Controleer of je Excel bestand de juiste kolomnamen heeft (datum, grootboeknummer, omschrijving, debet/credit)
                        </p>
                      </div>
                    )}
                  </AlertDescription>
                </Alert>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => {
                  setUploadType(null)
                  setUploadStatus("idle")
                  setErrors([])
                  setWarnings([])
                  setUploadMessage("")
                  setRecordsProcessed(0)
                  if (fileInputRef.current) {
                    fileInputRef.current.value = ""
                  }
                }}>
                  Annuleren
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Template Downloads */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Template Bestanden</CardTitle>
            <CardDescription>
              Download voorbeeldbestanden met de juiste structuur. Vul deze in en upload ze terug.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="border-2 border-dashed hover:border-primary transition-colors">
                <CardContent className="p-6">
                  <div className="flex flex-col items-center text-center space-y-3">
                    <div className="p-3 rounded-lg bg-primary/10">
                      <FileSpreadsheet className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-1">Grootboek Template</h3>
                      <p className="text-xs text-muted-foreground mb-3">
                        Voorbeeldbestand voor grootboekrekeningen
                      </p>
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => {
                          try {
                            downloadTemplate("grootboek")
                            toast.success("Template gedownload", {
                              description: "Grootboek template.xlsx is gedownload. Open het bestand en vul het in.",
                            })
                          } catch (error: any) {
                            toast.error("Fout bij downloaden", {
                              description: error.message || "Kon template niet downloaden.",
                            })
                          }
                        }}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download Template
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2 border-dashed hover:border-primary transition-colors">
                <CardContent className="p-6">
                  <div className="flex flex-col items-center text-center space-y-3">
                    <div className="p-3 rounded-lg bg-primary/10">
                      <FileSpreadsheet className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-1">Boekingsregels Template</h3>
                      <p className="text-xs text-muted-foreground mb-3">
                        Voorbeeldbestand voor transacties
                      </p>
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => {
                          try {
                            downloadTemplate("boekingsregels")
                            toast.success("Template gedownload", {
                              description: "Boekingsregels template.xlsx is gedownload. Open het bestand en vul het in.",
                            })
                          } catch (error: any) {
                            toast.error("Fout bij downloaden", {
                              description: error.message || "Kon template niet downloaden.",
                            })
                          }
                        }}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download Template
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Hoe werkt het?</AlertTitle>
              <AlertDescription>
                <ol className="list-decimal list-inside space-y-1 mt-2">
                  <li>Download een template (klik op de button hierboven)</li>
                  <li>Open het Excel bestand en vul het in met je eigen data</li>
                  <li>Upload het ingevulde bestand via de upload functie hierboven</li>
                  <li>Het systeem importeert automatisch alle regels</li>
                </ol>
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </main>
    </div>
  )

  async function handleFileUpload(file: File) {
    if (!uploadType) return

    setFileName(file.name)
    setFileSize(file.size)
    setUploadStatus("uploading")
    setErrors([])
    setWarnings([])
    setUploadMessage("")
    setRecordsProcessed(0)
    setUploadProgress(0)
    setCurrentStep("Bestand wordt geladen...")
    setShowSuccess(false)

    // Simulate progress
    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval)
          return 90
        }
        return prev + 10
      })
    }, 200)

    try {
      if (uploadType === "grootboek") {
        setUploadProgress(30)
        const result = await parseGrootboekExcel(file)

        if (!result.success) {
          clearInterval(progressInterval)
          setUploadProgress(0)
          setUploadStatus("error")
          setErrors(result.errors)
          setWarnings(result.warnings)
          setUploadMessage("Er zijn fouten gevonden in het bestand. Controleer de foutmeldingen hierboven.")
          toast.error("Upload mislukt", {
            description: "Er zijn fouten gevonden in het bestand.",
          })
          return
        }

        setUploadProgress(60)
        setCurrentStep("Data wordt gevalideerd...")
        // Import to database
        const importResult = await importGrootboekFromCSV(clientId, result.data)

        if (importResult.error) {
          clearInterval(progressInterval)
          setUploadProgress(0)
          setUploadStatus("error")
          setErrors([importResult.error])
          setUploadMessage("Fout bij importeren in database.")
          toast.error("Import mislukt", {
            description: importResult.error,
          })
          return
        }

        clearInterval(progressInterval)
        setUploadProgress(100)
        setCurrentStep("Import voltooid!")
        setUploadStatus("success")
        setRecordsProcessed(result.data.length)
        setWarnings(result.warnings)
        setUploadMessage(`${result.data.length} grootboekrekeningen zijn succesvol geïmporteerd.`)
        setShowSuccess(true)
        
        toast.success("Upload geslaagd!", {
          description: `${result.data.length} grootboekrekeningen geïmporteerd.`,
        })

        // Redirect after 2 seconds
        setTimeout(() => {
          router.push(`/dashboard/clients/${clientId}/grootboek`)
        }, 2000)
      } else if (uploadType === "boekingsregels") {
        setUploadProgress(30)
        setCurrentStep("Excel bestand wordt gelezen...")
        const result = await parseBoekingsregelsExcel(file)

        if (!result.success) {
          clearInterval(progressInterval)
          setUploadProgress(0)
          setUploadStatus("error")
          setErrors(result.errors)
          setWarnings(result.warnings)
          setUploadMessage("Er zijn fouten gevonden in het bestand. Controleer de foutmeldingen hierboven.")
          toast.error("Upload mislukt", {
            description: "Er zijn fouten gevonden in het bestand.",
          })
          return
        }

        setUploadProgress(60)
        setCurrentStep("Data wordt gevalideerd...")
        // Import to database
        const importResult = await importBoekingsregelsFromCSV(clientId, result.data)

        if (importResult.error) {
          clearInterval(progressInterval)
          setUploadProgress(0)
          setUploadStatus("error")
          setErrors([importResult.error])
          setUploadMessage("Fout bij importeren in database.")
          toast.error("Import mislukt", {
            description: importResult.error,
          })
          return
        }

        clearInterval(progressInterval)
        setUploadProgress(100)
        setCurrentStep("Import voltooid!")
        setUploadStatus("success")
        setRecordsProcessed(result.data.length)
        setWarnings(result.warnings)
        setUploadMessage(`${result.data.length} boekingsregels zijn succesvol geïmporteerd.`)
        setShowSuccess(true)
        
        toast.success("Upload geslaagd!", {
          description: `${result.data.length} boekingsregels geïmporteerd.`,
        })

        // Redirect after 2 seconds
        setTimeout(() => {
          router.push(`/dashboard/clients/${clientId}/boekingsregels`)
        }, 2000)
      } else if (uploadType === "facturen") {
        setUploadProgress(30)
        setCurrentStep("Factuur wordt gescand (OCR)...")
        
        try {
          // Check if we're in browser (client-side only)
          if (typeof window === 'undefined') {
            throw new Error('OCR werkt alleen in de browser. Upload facturen via de web interface.')
          }

          // Import OCR functions dynamically (client-side only)
          let processInvoiceFile, convertInvoiceToBoekingsregels
          try {
            const ocrModule = await import("@/lib/utils/invoice-ocr")
            processInvoiceFile = ocrModule.processInvoiceFile
            convertInvoiceToBoekingsregels = ocrModule.convertInvoiceToBoekingsregels
          } catch (importError: any) {
            throw new Error(`OCR module kon niet worden geladen: ${importError.message || 'Onbekende fout'}. Probeer de pagina te verversen.`)
          }
          
          setUploadProgress(50)
          setCurrentStep("Data wordt geëxtraheerd...")
          
          // Process invoice with timeout
          const extractedData = await Promise.race([
            processInvoiceFile(file),
            new Promise<never>((_, reject) => 
              setTimeout(() => reject(new Error('OCR duurde te lang. Probeer een kleinere of duidelijkere afbeelding.')), 60000)
            )
          ])
          
          setUploadProgress(70)
          setCurrentStep("Boekingsregels worden aangemaakt...")
          
          // Show extracted data in warnings for user feedback
          const extractionWarnings: string[] = []
          if (!extractedData.invoiceNumber) extractionWarnings.push("⚠️ Factuurnummer niet gevonden")
          if (!extractedData.date) extractionWarnings.push("⚠️ Datum niet gevonden - wordt vandaag gebruikt")
          if (!extractedData.totalAmount) extractionWarnings.push("⚠️ Totaalbedrag niet gevonden")
          if (!extractedData.vatAmount) extractionWarnings.push("⚠️ BTW bedrag niet gevonden")
          if (!extractedData.supplierName) extractionWarnings.push("⚠️ Leverancier naam niet gevonden")
          
          // Convert to boekingsregels
          const regels = convertInvoiceToBoekingsregels(extractedData, clientId)
          
          if (regels.length === 0) {
            clearInterval(progressInterval)
            setUploadProgress(0)
            setUploadStatus("error")
            const errorMessages = [
              "Kon geen factuurgegevens extraheren uit de afbeelding.",
              "Zorg ervoor dat de factuur duidelijk leesbaar is en probeer het opnieuw.",
            ]
            if (extractedData.rawText && extractedData.rawText.length < 50) {
              errorMessages.push("OCR kon weinig tekst extraheren. Probeer een scherpere afbeelding.")
            }
            setErrors(errorMessages)
            setWarnings(extractionWarnings)
            setUploadMessage("OCR kon geen bruikbare data extraheren.")
            toast.error("Extractie mislukt", {
              description: "Kon geen factuurgegevens extraheren. Probeer een duidelijkere afbeelding.",
            })
            return
          }
          
          setUploadProgress(85)
          setCurrentStep("Data wordt geïmporteerd...")
          
          // Import to database
          const importResult = await importBoekingsregelsFromCSV(clientId, regels as any)
          
          if (importResult.error) {
            clearInterval(progressInterval)
            setUploadProgress(0)
            setUploadStatus("error")
            setErrors([importResult.error])
            setUploadMessage("Fout bij importeren in database.")
            toast.error("Import mislukt", {
              description: importResult.error,
            })
            return
          }
          
          clearInterval(progressInterval)
          setUploadProgress(100)
          setCurrentStep("Import voltooid!")
          setUploadStatus("success")
          setRecordsProcessed(regels.length)
          const successWarnings: string[] = []
          if (extractedData.invoiceNumber) successWarnings.push(`✅ Factuurnummer: ${extractedData.invoiceNumber}`)
          if (extractedData.date) successWarnings.push(`✅ Datum: ${extractedData.date}`)
          if (extractedData.totalAmount) successWarnings.push(`✅ Totaal: €${extractedData.totalAmount.toFixed(2)}`)
          if (extractedData.vatAmount) successWarnings.push(`✅ BTW: €${extractedData.vatAmount.toFixed(2)} (${extractedData.vatRate || '?'}%)`)
          if (extractedData.supplierName) successWarnings.push(`✅ Leverancier: ${extractedData.supplierName}`)
          // Add any missing data warnings
          successWarnings.push(...extractionWarnings)
          setWarnings(successWarnings)
          setUploadMessage(`${regels.length} boekingsregels zijn succesvol aangemaakt van factuur.`)
          setShowSuccess(true)
          
          toast.success("Factuur verwerkt!", {
            description: `${regels.length} boekingsregels aangemaakt van factuur.`,
          })
          
          // Redirect after 2 seconds
          setTimeout(() => {
            router.push(`/dashboard/clients/${clientId}/boekingsregels`)
          }, 2000)
        } catch (error: any) {
          clearInterval(progressInterval)
          setUploadProgress(0)
          setUploadStatus("error")
          setErrors([
            error.message || "Fout bij verwerken van factuur",
            "Zorg ervoor dat de afbeelding duidelijk is en probeer het opnieuw.",
          ])
          setUploadMessage("Er is een fout opgetreden bij het verwerken van de factuur.")
          toast.error("Fout opgetreden", {
            description: error.message || "Onbekende fout bij verwerken van factuur",
          })
        }
        return
      }
    } catch (error: any) {
      clearInterval(progressInterval)
      setUploadProgress(0)
      setUploadStatus("error")
      setErrors([error.message || "Onbekende fout bij verwerken van bestand"])
      setUploadMessage("Er is een fout opgetreden bij het lezen van het bestand.")
      toast.error("Fout opgetreden", {
        description: error.message || "Onbekende fout bij verwerken van bestand",
      })
    }
  }
}
