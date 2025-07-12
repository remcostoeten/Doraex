"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  Database,
  Zap,
  HardDrive,
  AlertCircle,
  Loader2,
  Clipboard,
  Shield,
  CheckCircle,
  Info,
  Copy,
  FileText,
} from "lucide-react"
import { useConnections } from "@/hooks/use-connections"
import { Switch } from "@/components/ui/switch"

interface ConnectionCreationModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ConnectionCreationModal({ open, onOpenChange }: ConnectionCreationModalProps) {
  const { addConnection, testConnection } = useConnections()
  const [activeTab, setActiveTab] = useState("postgresql")
  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError] = useState("")
  const [isDevelopmentMode, setIsDevelopmentMode] = useState(false) // This seems unused, consider removing if not needed

  const [isTestingConnection, setIsTestingConnection] = useState(false)
  const [testResult, setTestResult] = useState<{
    success: boolean
    message: string
    details?: any
  } | null>(null)

  // Form states
  const [postgresForm, setPostgresForm] = useState({
    name: "",
    url: "",
    useIndividualFields: false, // This seems unused, consider removing if not needed
    host: "localhost", // This seems unused, consider removing if not needed
    port: "5432", // This seems unused, consider removing if not needed
    database: "", // This seems unused, consider removing if not needed
    username: "", // This seems unused, consider removing if not needed
    password: "", // This seems unused, consider removing if not needed
    sslEnabled: false,
  })

  const [tursoForm, setTursoForm] = useState({
    name: "",
    url: "",
    authToken: "",
  })

  const [sqliteForm, setSqliteForm] = useState({
    name: "",
    file: null as File | null,
  })

  // Auto-detect provider and set name
  useEffect(() => {
    if (postgresForm.url && !postgresForm.name) {
      let suggestedName = ""
      if (postgresForm.url.includes("neon.tech")) {
        suggestedName = "Neon Database"
      } else if (postgresForm.url.includes("supabase")) {
        suggestedName = "Supabase Database"
      } else if (postgresForm.url.includes("railway")) {
        suggestedName = "Railway Database"
      } else if (postgresForm.url.includes("render.com")) {
        suggestedName = "Render Database"
      } else if (postgresForm.url.includes("localhost")) {
        suggestedName = "Local Database"
      } else {
        suggestedName = "PostgreSQL Database"
      }
      setPostgresForm((prev) => ({ ...prev, name: suggestedName }))
    }
  }, [postgresForm.url])

  const handleManualPaste = async (type: "postgres" | "turso") => {
    try {
      const text = await navigator.clipboard.readText()
      if (type === "postgres") {
        const cleanUrl = text.trim()
        setPostgresForm((prev) => ({
          ...prev,
          url: cleanUrl,
          sslEnabled:
            cleanUrl.includes("sslmode=require") || cleanUrl.includes("neon.tech") || cleanUrl.includes("supabase"),
        }))
      } else if (type === "turso") {
        setTursoForm((prev) => ({ ...prev, url: text.trim() }))
      }
    } catch (err) {
      setError("Failed to read clipboard contents")
    }
  }

  const validatePostgreSQLUrl = (url: string): { isValid: boolean; error?: string; cleaned?: string } => {
    try {
      // Clean the URL by removing unsupported parameters
      let cleanedUrl = url.trim()

      // Remove channel_binding parameter which is not supported by pg library
      if (cleanedUrl.includes("channel_binding=")) {
        const urlObj = new URL(cleanedUrl)
        urlObj.searchParams.delete("channel_binding")
        cleanedUrl = urlObj.toString()
      }

      const parsed = new URL(cleanedUrl)

      if (!parsed.protocol.startsWith("postgres")) {
        return { isValid: false, error: "URL must start with 'postgresql://' or 'postgres://'" }
      }

      if (!parsed.hostname) {
        return { isValid: false, error: "Hostname is required" }
      }

      if (!parsed.pathname || parsed.pathname === "/") {
        return { isValid: false, error: "Database name is required" }
      }

      if (!parsed.username) {
        return { isValid: false, error: "Username is required" }
      }

      if (!parsed.password) {
        return { isValid: false, error: "Password is required" }
      }

      return { isValid: true, cleaned: cleanedUrl }
    } catch (e) {
      return { isValid: false, error: "Invalid URL format" }
    }
  }

  const handleTestConnection = async () => {
    setIsTestingConnection(true)
    setTestResult(null)
    setError("")

    try {
      let connectionConfig
      if (activeTab === "postgresql") {
        if (!postgresForm.url) {
          throw new Error("Please enter a database URL")
        }

        const validation = validatePostgreSQLUrl(postgresForm.url)
        if (!validation.isValid) {
          throw new Error(validation.error || "Invalid URL")
        }

        connectionConfig = {
          type: "postgresql",
          url: validation.cleaned || postgresForm.url,
          ssl: postgresForm.sslEnabled,
        }
      } else if (activeTab === "turso") {
        if (!tursoForm.name || !tursoForm.url || !tursoForm.authToken) {
          throw new Error("Please fill in all required fields for Turso connection")
        }
        connectionConfig = {
          type: "turso",
          name: tursoForm.name,
          url: tursoForm.url,
          authToken: tursoForm.authToken,
        }
      } else if (activeTab === "sqlite") {
        if (!sqliteForm.name || !sqliteForm.file) {
          throw new Error("Please provide a connection name and upload a SQLite file")
        }

        // Upload the file first for testing
        const formData = new FormData()
        formData.append("file", sqliteForm.file)

        const uploadResponse = await fetch("/api/upload/sqlite", {
          method: "POST",
          body: formData,
        })

        if (!uploadResponse.ok) {
          const uploadError = await uploadResponse.json()
          throw new Error(uploadError.error || "Failed to upload SQLite file")
        }

        const uploadResult = await uploadResponse.json()

        connectionConfig = {
          type: "sqlite",
          filePath: uploadResult.filePath,
          fileName: uploadResult.originalName,
        }
      } else {
        throw new Error("Unsupported database type selected")
      }

      console.log("Testing connection with config:", { ...connectionConfig, password: "***" })

      // Use the real API to test the connection for PostgreSQL/Turso
      const result = await testConnection(connectionConfig)
      setTestResult(result)

      if (result.success) {
        setError("")
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Connection test failed"
      setTestResult({
        success: false,
        message: errorMessage,
      })
      setError(errorMessage)
    } finally {
      setIsTestingConnection(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Require successful connection test before saving, unless it's SQLite (which is simulated)
    if (!testResult?.success && activeTab !== "sqlite") {
      setError("Please test the connection successfully before saving.")
      return
    }
    // For SQLite, if a file is selected, consider it "tested"
    if (activeTab === "sqlite" && !sqliteForm.file) {
      setError("Please upload a SQLite file.")
      return
    }
    if (activeTab === "sqlite" && !sqliteForm.name) {
      setError("Please enter a connection name for your SQLite database.")
      return
    }

    setIsConnecting(true)
    setError("")

    try {
      await new Promise((resolve) => setTimeout(resolve, 500))

      let connectionData
      if (activeTab === "postgresql") {
        if (!postgresForm.name) {
          throw new Error("Please enter a connection name")
        }

        const validation = validatePostgreSQLUrl(postgresForm.url)
        if (!validation.isValid) {
          throw new Error(validation.error || "Invalid URL")
        }

        const url = new URL(validation.cleaned || postgresForm.url)
        connectionData = {
          type: "postgresql" as const,
          name: postgresForm.name,
          dialect: "PostgreSQL",
          url: validation.cleaned || postgresForm.url,
          host: url.hostname,
          database: url.pathname.slice(1),
          username: url.username,
          ssl: postgresForm.sslEnabled || url.searchParams.get("sslmode") === "require",
        }
      } else if (activeTab === "turso") {
        if (!tursoForm.name || !tursoForm.url || !tursoForm.authToken) {
          throw new Error("Please fill in all required fields for Turso connection")
        }
        connectionData = {
          type: "turso" as const,
          name: tursoForm.name,
          dialect: "Turso",
          url: tursoForm.url,
          authToken: tursoForm.authToken,
          host: new URL(tursoForm.url).hostname,
        }
      } else if (activeTab === "sqlite") {
        if (!sqliteForm.name || !sqliteForm.file) {
          throw new Error("Please provide a connection name and upload a SQLite file")
        }

        // Upload the SQLite file first
        const formData = new FormData()
        formData.append("file", sqliteForm.file)

        const uploadResponse = await fetch("/api/upload/sqlite", {
          method: "POST",
          body: formData,
        })

        if (!uploadResponse.ok) {
          const uploadError = await uploadResponse.json()
          throw new Error(uploadError.error || "Failed to upload SQLite file")
        }

        const uploadResult = await uploadResponse.json()

        connectionData = {
          type: "sqlite" as const,
          name: sqliteForm.name,
          dialect: "SQLite",
          fileName: uploadResult.originalName,
          filePath: uploadResult.filePath,
          size: uploadResult.size,
        }
      } else {
        throw new Error("Unsupported database type selected")
      }

      if (connectionData) {
        await addConnection(connectionData)
        onOpenChange(false)
        // Reset forms and test results
        setPostgresForm({
          name: "",
          url: "",
          useIndividualFields: false,
          host: "localhost",
          port: "5432",
          database: "",
          username: "",
          password: "",
          sslEnabled: false,
        })
        setTursoForm({ name: "", url: "", authToken: "" })
        setSqliteForm({ name: "", file: null })
        setTestResult(null)
        setIsDevelopmentMode(false) // Reset this too
        setError("")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save connection")
    } finally {
      setIsConnecting(false)
    }
  }

  // Auto-detect cloud providers
  const isNeon = postgresForm.url.includes("neon.tech")
  const isSupabase = postgresForm.url.includes("supabase")
  const isRailway = postgresForm.url.includes("railway")
  const isCloudProvider = isNeon || isSupabase || isRailway

  const copyCleanedUrl = () => {
    const validation = validatePostgreSQLUrl(postgresForm.url)
    if (validation.isValid && validation.cleaned) {
      navigator.clipboard.writeText(validation.cleaned)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Database Connection</DialogTitle>
          <DialogDescription>Connect to your database to start exploring your data</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="postgresql" className="flex items-center gap-2">
                <Database className="h-4 w-4" />
                PostgreSQL
              </TabsTrigger>
              <TabsTrigger value="turso" className="flex items-center gap-2">
                <Zap className="h-4 w-4" />
                Turso
              </TabsTrigger>
              <TabsTrigger value="sqlite" className="flex items-center gap-2">
                <HardDrive className="h-4 w-4" />
                SQLite
              </TabsTrigger>
            </TabsList>

            <TabsContent value="postgresql" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="h-5 w-5" />
                    PostgreSQL Connection
                  </CardTitle>
                  <CardDescription>Connect to your PostgreSQL database using a connection URL</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Provider-specific alerts */}
                  {isNeon && (
                    <Alert>
                      <Info className="h-4 w-4" />
                      <AlertDescription>
                        <strong>Neon detected!</strong> SSL will be automatically enabled. Unsupported parameters like
                        `channel_binding` will be removed.
                      </AlertDescription>
                    </Alert>
                  )}

                  {isSupabase && (
                    <Alert>
                      <Info className="h-4 w-4" />
                      <AlertDescription>
                        <strong>Supabase detected!</strong> SSL will be automatically enabled for secure connection.
                      </AlertDescription>
                    </Alert>
                  )}

                  <div>
                    <Label htmlFor="pg-name">Connection Name *</Label>
                    <Input
                      id="pg-name"
                      placeholder="My PostgreSQL Database"
                      value={postgresForm.name}
                      onChange={(e) => setPostgresForm((prev) => ({ ...prev, name: e.target.value }))}
                      required
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="postgres-url">Database URL *</Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleManualPaste("postgres")}
                        className="h-8"
                      >
                        <Clipboard className="h-4 w-4 mr-2" />
                        Paste from Clipboard
                      </Button>
                    </div>
                    <Input
                      id="postgres-url"
                      placeholder="postgresql://username:password@host:port/database"
                      value={postgresForm.url}
                      onChange={(e) => {
                        const url = e.target.value
                        setPostgresForm((prev) => ({
                          ...prev,
                          url,
                          sslEnabled:
                            url.includes("sslmode=require") || url.includes("neon.tech") || url.includes("supabase"),
                        }))
                      }}
                      required
                      className="font-mono text-sm"
                    />

                    {/* URL Validation */}
                    {postgresForm.url && (
                      <div className="mt-2">
                        {(() => {
                          const validation = validatePostgreSQLUrl(postgresForm.url)
                          if (!validation.isValid) {
                            return (
                              <div className="text-xs text-red-600 flex items-center gap-1">
                                <AlertCircle className="h-3 w-3" />
                                {validation.error}
                              </div>
                            )
                          } else if (validation.cleaned !== postgresForm.url) {
                            return (
                              <div className="text-xs text-blue-600 flex items-center gap-2">
                                <Info className="h-3 w-3" />
                                <span>URL will be cleaned (removing unsupported parameters)</span>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={copyCleanedUrl}
                                  className="h-5 px-2 text-xs"
                                >
                                  <Copy className="h-3 w-3 mr-1" />
                                  Copy Clean URL
                                </Button>
                              </div>
                            )
                          } else {
                            return (
                              <div className="text-xs text-green-600 flex items-center gap-1">
                                <CheckCircle className="h-3 w-3" />
                                URL format is valid
                              </div>
                            )
                          }
                        })()}
                      </div>
                    )}

                    <div className="text-xs text-muted-foreground mt-2 space-y-1">
                      <p>
                        <strong>Supported formats:</strong>
                      </p>
                      <p>
                        • <code>postgresql://user:pass@host:port/db</code>
                      </p>
                      <p>
                        • <code>postgres://user:pass@host:port/db</code>
                      </p>
                      <p>• Works with Neon, Supabase, Railway, and other providers</p>
                      {isCloudProvider && (
                        <p className="text-blue-600">• Cloud provider detected - SSL will be enabled automatically</p>
                      )}
                    </div>
                  </div>

                  {/* SSL Configuration */}
                  <div className="flex items-center justify-between p-3 bg-muted/20 rounded-lg border">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-green-600" />
                      <div>
                        <div className="font-medium text-sm">SSL Configuration</div>
                        <div className="text-xs text-muted-foreground">
                          {isCloudProvider
                            ? "Required for cloud providers"
                            : "Secure your database connection with SSL/TLS encryption"}
                        </div>
                      </div>
                    </div>
                    <Switch
                      checked={postgresForm.sslEnabled}
                      onCheckedChange={(checked) => {
                        setPostgresForm((prev) => ({ ...prev, sslEnabled: checked }))
                      }}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="turso" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5" />
                    Turso Connection
                  </CardTitle>
                  <CardDescription>Connect to your Turso database</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="turso-name">Connection Name *</Label>
                    <Input
                      id="turso-name"
                      placeholder="My Turso Database"
                      value={tursoForm.name}
                      onChange={(e) => setTursoForm((prev) => ({ ...prev, name: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="turso-url">Database URL *</Label>
                    <Input
                      id="turso-url"
                      placeholder="libsql://your-database.turso.io"
                      value={tursoForm.url}
                      onChange={(e) => setTursoForm((prev) => ({ ...prev, url: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="turso-token">Auth Token *</Label>
                    <Input
                      id="turso-token"
                      placeholder="eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9..."
                      value={tursoForm.authToken}
                      onChange={(e) => setTursoForm((prev) => ({ ...prev, authToken: e.target.value }))}
                      required
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="sqlite" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <HardDrive className="h-5 w-5" />
                    SQLite Connection
                  </CardTitle>
                  <CardDescription>Upload a local SQLite database file</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="sqlite-name">Connection Name *</Label>
                    <Input
                      id="sqlite-name"
                      placeholder="My SQLite Database"
                      value={sqliteForm.name}
                      onChange={(e) => setSqliteForm((prev) => ({ ...prev, name: e.target.value }))}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="sqlite-file">SQLite File *</Label>
                    <div className="mt-1">
                      <Input
                        id="sqlite-file"
                        type="file"
                        accept=".db,.sqlite,.sqlite3"
                        onChange={(e) => {
                          const file = e.target.files?.[0] || null
                          setSqliteForm((prev) => ({ ...prev, file }))
                          // Clear test result if file changes
                          setTestResult(null)
                        }}
                        required
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Supported formats: .db, .sqlite, .sqlite3</p>
                  </div>

                  {sqliteForm.file && (
                    <div className="p-3 bg-muted/50 rounded-lg border border-border">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">{sqliteForm.file.name}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Size: {(sqliteForm.file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Connection Test Results */}
          {testResult && (
            <Alert className={testResult.success ? "border-green-200 bg-green-50/30" : "border-red-200 bg-red-50/30"}>
              <div
                className={`rounded-full p-1 ${testResult.success ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"}`}
              >
                {testResult.success ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
              </div>
              <div className="space-y-2">
                <div className="font-medium">{testResult.success ? "Connection Successful" : "Connection Failed"}</div>
                <div className="text-sm text-muted-foreground">{testResult.message}</div>

                {testResult.success && testResult.details && (
                  <div className="grid grid-cols-2 gap-2 text-xs mt-3">
                    {testResult.details.serverVersion && (
                      <div className="flex justify-between p-2 bg-muted/50 rounded">
                        <span>Version:</span>
                        <code className="font-mono">{testResult.details.serverVersion}</code>
                      </div>
                    )}
                    {testResult.details.connectionTime && (
                      <div className="flex justify-between p-2 bg-muted/50 rounded">
                        <span>Response:</span>
                        <code className="font-mono">{testResult.details.connectionTime}</code>
                      </div>
                    )}
                    {testResult.details.tablesFound !== undefined && (
                      <div className="flex justify-between p-2 bg-muted/50 rounded">
                        <span>Tables:</span>
                        <code className="font-mono">{testResult.details.tablesFound}</code>
                      </div>
                    )}
                    {testResult.details.sslStatus && (
                      <div className="flex justify-between p-2 bg-muted/50 rounded">
                        <span>SSL:</span>
                        <code className="font-mono text-green-600">✓</code>
                      </div>
                    )}
                    {testResult.details.provider && (
                      <div className="flex justify-between p-2 bg-muted/50 rounded">
                        <span>Provider:</span>
                        <code className="font-mono">{testResult.details.provider}</code>
                      </div>
                    )}
                    {testResult.details.fileName && (
                      <div className="flex justify-between p-2 bg-muted/50 rounded">
                        <span>File:</span>
                        <code className="font-mono">{testResult.details.fileName}</code>
                      </div>
                    )}
                    {testResult.details.fileSize && (
                      <div className="flex justify-between p-2 bg-muted/50 rounded">
                        <span>Size:</span>
                        <code className="font-mono">{testResult.details.fileSize}</code>
                      </div>
                    )}
                  </div>
                )}

                {!testResult.success && (
                  <div className="text-xs text-muted-foreground mt-2">
                    <p>• Check network connection and credentials</p>
                    <p>• Verify database server is accessible</p>
                    <p>• For Neon: Make sure the database is not paused</p>
                    <p>• Try removing unsupported URL parameters</p>
                  </div>
                )}
              </div>
            </Alert>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleTestConnection}
              disabled={
                isTestingConnection ||
                isConnecting ||
                (activeTab === "postgresql" && !postgresForm.url) ||
                (activeTab === "turso" && (!tursoForm.url || !tursoForm.authToken)) ||
                (activeTab === "sqlite" && (!sqliteForm.name || !sqliteForm.file))
              }
              className="flex-1 bg-transparent"
            >
              {isTestingConnection ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Testing Connection...
                </>
              ) : (
                <>
                  <Database className="h-4 w-4 mr-2" />
                  Test Connection
                </>
              )}
            </Button>
            <Button
              type="submit"
              disabled={isConnecting || isTestingConnection || (!testResult?.success && activeTab !== "sqlite")}
              className="flex-1"
            >
              {isConnecting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Connecting...
                </>
              ) : (
                "Save Connection"
              )}
            </Button>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
