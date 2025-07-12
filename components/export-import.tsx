"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Download, Upload, FileText, CheckCircle, AlertCircle } from "lucide-react"

interface ExportImportProps {
  tableName: string
}

export function ExportImport({ tableName }: ExportImportProps) {
  const [activeOperation, setActiveOperation] = useState<"export" | "import">("export")
  const [exportFormat, setExportFormat] = useState("csv")
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)

  const handleExport = async () => {
    setIsProcessing(true)
    setProgress(0)

    // Simulate export progress
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          setIsProcessing(false)
          return 100
        }
        return prev + 10
      })
    }, 200)
  }

  const handleImport = async () => {
    setIsProcessing(true)
    setProgress(0)

    // Simulate import progress
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          setIsProcessing(false)
          return 100
        }
        return prev + 15
      })
    }, 300)
  }

  return (
    <div className="h-full p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant={activeOperation === "export" ? "default" : "outline"}
            onClick={() => setActiveOperation("export")}
            className="flex-1"
          >
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </Button>
          <Button
            variant={activeOperation === "import" ? "default" : "outline"}
            onClick={() => setActiveOperation("import")}
            className="flex-1"
          >
            <Upload className="h-4 w-4 mr-2" />
            Import Data
          </Button>
        </div>

        {activeOperation === "export" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="h-5 w-5" />
                  Export Settings
                </CardTitle>
                <CardDescription>Configure your data export options</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Export Format</Label>
                  <RadioGroup value={exportFormat} onValueChange={setExportFormat} className="mt-2">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="csv" id="csv" />
                      <Label htmlFor="csv">CSV</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="json" id="json" />
                      <Label htmlFor="json">JSON</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="sql" id="sql" />
                      <Label htmlFor="sql">SQL</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="xlsx" id="xlsx" />
                      <Label htmlFor="xlsx">Excel (XLSX)</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div>
                  <Label>Row Limit</Label>
                  <Select defaultValue="all">
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All rows</SelectItem>
                      <SelectItem value="1000">First 1,000 rows</SelectItem>
                      <SelectItem value="10000">First 10,000 rows</SelectItem>
                      <SelectItem value="custom">Custom range</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Options</Label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="headers" defaultChecked />
                      <Label htmlFor="headers">Include column headers</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="compress" />
                      <Label htmlFor="compress">Compress file (ZIP)</Label>
                    </div>
                  </div>
                </div>

                <Button onClick={handleExport} disabled={isProcessing} className="w-full">
                  {isProcessing ? "Exporting..." : `Export ${tableName}`}
                </Button>

                {isProcessing && (
                  <div className="space-y-2">
                    <Progress value={progress} />
                    <p className="text-sm text-muted-foreground text-center">{progress}% complete</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Export Preview
                </CardTitle>
                <CardDescription>Preview of your export configuration</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Table:</span>
                    <span className="font-medium">{tableName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Format:</span>
                    <span className="font-medium uppercase">{exportFormat}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Estimated rows:</span>
                    <span className="font-medium">1,250</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Estimated size:</span>
                    <span className="font-medium">~2.1 MB</span>
                  </div>
                </div>

                {progress === 100 && (
                  <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-2 text-green-800">
                      <CheckCircle className="h-4 w-4" />
                      <span className="font-medium">Export completed!</span>
                    </div>
                    <p className="text-sm text-green-700 mt-1">Your file is ready for download.</p>
                    <Button size="sm" className="mt-2">
                      Download File
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {activeOperation === "import" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Import Data
                </CardTitle>
                <CardDescription>Upload and import data into {tableName}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="file">Select File</Label>
                  <Input id="file" type="file" accept=".csv,.json,.sql,.xlsx" className="mt-2" />
                  <p className="text-xs text-muted-foreground mt-1">Supported formats: CSV, JSON, SQL, Excel</p>
                </div>

                <div>
                  <Label>Import Mode</Label>
                  <RadioGroup defaultValue="append" className="mt-2">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="append" id="append" />
                      <Label htmlFor="append">Append to existing data</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="replace" id="replace" />
                      <Label htmlFor="replace">Replace existing data</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="update" id="update" />
                      <Label htmlFor="update">Update existing records</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="space-y-2">
                  <Label>Options</Label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="validate" defaultChecked />
                      <Label htmlFor="validate">Validate data before import</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="backup" defaultChecked />
                      <Label htmlFor="backup">Create backup before import</Label>
                    </div>
                  </div>
                </div>

                <Button onClick={handleImport} disabled={isProcessing} className="w-full">
                  {isProcessing ? "Importing..." : "Import Data"}
                </Button>

                {isProcessing && (
                  <div className="space-y-2">
                    <Progress value={progress} />
                    <p className="text-sm text-muted-foreground text-center">Processing... {progress}% complete</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" />
                  Import Guidelines
                </CardTitle>
                <CardDescription>Important information about data import</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div>
                  <h4 className="font-medium mb-2">File Requirements:</h4>
                  <ul className="space-y-1 text-muted-foreground ml-4">
                    <li>• Maximum file size: 100MB</li>
                    <li>• CSV files should have headers in first row</li>
                    <li>• JSON files should be array of objects</li>
                    <li>• Column names must match table schema</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Data Validation:</h4>
                  <ul className="space-y-1 text-muted-foreground ml-4">
                    <li>• Required fields cannot be empty</li>
                    <li>• Data types must match column types</li>
                    <li>• Unique constraints will be enforced</li>
                    <li>• Invalid rows will be skipped</li>
                  </ul>
                </div>

                {progress === 100 && (
                  <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-2 text-green-800">
                      <CheckCircle className="h-4 w-4" />
                      <span className="font-medium">Import completed!</span>
                    </div>
                    <p className="text-sm text-green-700 mt-1">Successfully imported 1,250 rows.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
