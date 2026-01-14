"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { DashboardHeader } from "@/components/dashboard-header"
import { Breadcrumbs } from "@/components/breadcrumbs"
import { Upload, FileSpreadsheet, CheckCircle2, AlertCircle, Loader2, ArrowLeft } from "lucide-react"
import { parseClientImportExcel } from "@/lib/utils/client-import-parser"
import { bulkImportClients } from "@/lib/actions/clients"
import { toast } from "sonner"
import Link from "next/link"

export default function ImportClientsPage() {
  const router = useRouter()
  const [file, setFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [progress, setProgress] = useState(0)
  const [preview, setPreview] = useState<{
    totalRows: number
    validRows: number
    errors: string[]
    warnings: string[]
    data: Array<{ name: string; email: string | null }>
  } | null>(null)
  const [importResult, setImportResult] = useState<{
    imported: number
    errors?: number
    errorsList?: string[]
  } | null>(null)

  const handleFileSelect = async (selectedFile: File) => {
    if (!selectedFile.name.endsWith('.xlsx') && !selectedFile.name.endsWith('.xls')) {
      toast.error("Ongeldig bestandstype", {
        description: "Alleen Excel bestanden (.xlsx, .xls) worden ondersteund.",
      })
      return
    }

    setFile(selectedFile)
    setPreview(null)
    setImportResult(null)
    setIsProcessing(true)
    setProgress(0)

    try {
      setProgress(30)
      const result = await parseClientImportExcel(selectedFile)
      setProgress(100)

      if (result.errors.length > 0 && result.data.length === 0) {
        toast.error("Fout bij verwerken", {
          description: result.errors[0],
        })
        setPreview(null)
      } else {
        setPreview({
          totalRows: result.totalRows,
          validRows: result.validRows,
          errors: result.errors,
          warnings: result.warnings,
          data: result.data.slice(0, 10), // Show first 10 for preview
        })

        if (result.warnings.length > 0) {
          toast.warning("Waarschuwingen gevonden", {
            description: `${result.warnings.length} waarschuwing(en) tijdens verwerking.`,
          })
        }

        if (result.data.length > 0) {
          toast.success("Bestand verwerkt", {
            description: `${result.validRows} geldige klanten gevonden.`,
          })
        }
      }
    } catch (error: any) {
      toast.error("Fout bij verwerken", {
        description: error.message || "Er is een fout opgetreden bij het verwerken van het bestand.",
      })
      setPreview(null)
    } finally {
      setIsProcessing(false)
      setProgress(0)
    }
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      handleFileSelect(selectedFile)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile) {
      handleFileSelect(droppedFile)
    }
  }

  const handleImport = async () => {
    if (!file || !preview) return

    setIsImporting(true)
    setProgress(0)

    try {
      setProgress(20)
      const parseResult = await parseClientImportExcel(file)
      
      if (parseResult.data.length === 0) {
        toast.error("Geen klanten om te importeren")
        return
      }

      setProgress(40)
      const result = await bulkImportClients(parseResult.data)
      setProgress(100)

      if (result.error) {
        toast.error("Fout bij importeren", {
          description: result.error,
        })
      } else {
        setImportResult({
          imported: (result as any).imported || 0,
          errors: (result as any).errors,
          errorsList: (result as any).errorsList,
        })

        toast.success("Import voltooid!", {
          description: `${(result as any).imported || 0} klanten succesvol geïmporteerd.`,
        })

        // Redirect after 2 seconds
        setTimeout(() => {
          router.push("/dashboard")
          router.refresh()
        }, 2000)
      }
    } catch (error: any) {
      toast.error("Fout bij importeren", {
        description: error.message || "Er is een fout opgetreden bij het importeren.",
      })
    } finally {
      setIsImporting(false)
      setProgress(0)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />

      <main className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <Breadcrumbs
          items={[
            { label: "Klanten", href: "/dashboard" },
            { label: "Import" },
          ]}
        />

        <div className="max-w-4xl mx-auto space-y-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">Klanten Importeren</h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Importeer klanten uit een Excel bestand (Naam KVK en E-mail kolommen)
            </p>
          </div>

          <Link href="/dashboard">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Terug naar Dashboard
            </Button>
          </Link>

          {/* File Upload */}
          <Card>
            <CardHeader>
              <CardTitle>Excel Bestand Uploaden</CardTitle>
              <CardDescription>
                Upload een Excel bestand met kolommen "Naam KVK" en "E-mail"
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  isDragging
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                }`}
              >
                <FileSpreadsheet className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-sm font-medium text-foreground mb-2">
                  Sleep een Excel bestand hierheen of klik om te selecteren
                </p>
                <p className="text-xs text-muted-foreground mb-4">
                  Ondersteunde formaten: .xlsx, .xls
                </p>
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileInput}
                  className="hidden"
                  id="file-upload"
                  disabled={isProcessing || isImporting}
                />
                <label htmlFor="file-upload">
                  <Button
                    type="button"
                    variant="outline"
                    disabled={isProcessing || isImporting}
                    className="cursor-pointer"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Bestand Selecteren
                  </Button>
                </label>
              </div>

              {file && (
                <div className="mt-4 p-3 bg-muted rounded-lg">
                  <p className="text-sm font-medium text-foreground">
                    Geselecteerd: {file.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {(file.size / 1024).toFixed(2)} KB
                  </p>
                </div>
              )}

              {isProcessing && (
                <div className="mt-4 space-y-2">
                  <Progress value={progress} />
                  <p className="text-xs text-center text-muted-foreground">
                    Bestand verwerken...
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Preview */}
          {preview && (
            <Card>
              <CardHeader>
                <CardTitle>Preview</CardTitle>
                <CardDescription>
                  {preview.validRows} geldige klanten gevonden van {preview.totalRows} rijen
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {preview.errors.length > 0 && (
                  <Alert variant="destructive">
                    <AlertCircle className="w-4 h-4" />
                    <AlertTitle>Fouten</AlertTitle>
                    <AlertDescription>
                      <ul className="list-disc list-inside mt-2 space-y-1">
                        {preview.errors.map((error, i) => (
                          <li key={i} className="text-sm">{error}</li>
                        ))}
                      </ul>
                    </AlertDescription>
                  </Alert>
                )}

                {preview.warnings.length > 0 && (
                  <Alert className="border-yellow-500 bg-yellow-50 dark:bg-yellow-950">
                    <AlertCircle className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                    <AlertTitle className="text-yellow-800 dark:text-yellow-200">Waarschuwingen</AlertTitle>
                    <AlertDescription className="text-yellow-700 dark:text-yellow-300">
                      <ul className="list-disc list-inside mt-2 space-y-1">
                        {preview.warnings.slice(0, 5).map((warning, i) => (
                          <li key={i} className="text-sm">{warning}</li>
                        ))}
                        {preview.warnings.length > 5 && (
                          <li className="text-sm">... en {preview.warnings.length - 5} meer</li>
                        )}
                      </ul>
                    </AlertDescription>
                  </Alert>
                )}

                {preview.data.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium text-foreground">
                      Eerste {Math.min(10, preview.data.length)} klanten:
                    </h3>
                    <div className="border rounded-lg overflow-hidden">
                      <div className="max-h-64 overflow-y-auto">
                        <table className="w-full text-sm">
                          <thead className="bg-muted sticky top-0">
                            <tr>
                              <th className="px-4 py-2 text-left font-medium text-foreground">Naam</th>
                              <th className="px-4 py-2 text-left font-medium text-foreground">E-mail</th>
                            </tr>
                          </thead>
                          <tbody>
                            {preview.data.map((client, i) => (
                              <tr key={i} className="border-t border-border">
                                <td className="px-4 py-2 text-foreground">{client.name}</td>
                                <td className="px-4 py-2 text-muted-foreground">
                                  {client.email || "-"}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}

                <Button
                  onClick={handleImport}
                  disabled={isImporting || preview.validRows === 0}
                  className="w-full"
                  size="lg"
                >
                  {isImporting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Importeren...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      {preview.validRows} Klanten Importeren
                    </>
                  )}
                </Button>

                {isImporting && (
                  <div className="space-y-2">
                    <Progress value={progress} />
                    <p className="text-xs text-center text-muted-foreground">
                      Klanten importeren...
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Import Result */}
          {importResult && (
            <Card>
              <CardHeader>
                <CardTitle>Import Resultaat</CardTitle>
              </CardHeader>
              <CardContent>
                <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
                  <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400" />
                  <AlertTitle className="text-green-800 dark:text-green-200">
                    Import Voltooid!
                  </AlertTitle>
                  <AlertDescription className="text-green-700 dark:text-green-300">
                    <p className="font-semibold">{importResult.imported} klanten succesvol geïmporteerd.</p>
                    {importResult.errors && importResult.errors > 0 && (
                      <p className="mt-2">
                        {importResult.errors} fouten opgetreden. Controleer de details hieronder.
                      </p>
                    )}
                  </AlertDescription>
                </Alert>

                {importResult.errorsList && importResult.errorsList.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-foreground mb-2">Fouten:</h4>
                    <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                      {importResult.errorsList.slice(0, 10).map((error, i) => (
                        <li key={i}>{error}</li>
                      ))}
                      {importResult.errorsList.length > 10 && (
                        <li>... en {importResult.errorsList.length - 10} meer</li>
                      )}
                    </ul>
                  </div>
                )}

                <div className="mt-4">
                  <Link href="/dashboard">
                    <Button className="w-full">Terug naar Dashboard</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}

