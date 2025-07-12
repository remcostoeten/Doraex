"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Database, Upload, Zap, AlertCircle, Clipboard, CheckCircle } from "lucide-react"

interface DatabaseConnectionFormProps {
  onSubmit: (database: any) => void
}

export function DatabaseConnectionForm({ onSubmit }: DatabaseConnectionFormProps) {
  const [activeTab, setActiveTab] = useState("postgres")
  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError] = useState("")
  const [pasteSuccess, setPasteSuccess] = useState("")

  // Form states
  const [postgresForm, setPostgresForm] = useState({ name: "", url: "" })
  const [tursoForm, setTursoForm] = useState({ name: "", url: "", authToken: "" })
  const [sqliteForm, setSqliteForm] = useState({ name: "", file: null as File | null })

  const fileInputRef = useRef<HTMLInputElement>(null)

  // Enhanced clipboard parsing function
  const parseClipboardContent = (content: string, type: "postgres" | "turso") => {
    const lines = content
      .trim()
      .split("\n")
      .filter((line) => line.trim())

    const extractValue = (line: string): string => {
      let value = line.trim()

      // Remove environment variable prefixes
      const envPrefixes = ["DATABASE_URL=", "DB_URL=", "URL=", "DB="]
      for (const prefix of envPrefixes) {
        if (value.toUpperCase().startsWith(prefix.toUpperCase())) {
          value = value.substring(prefix.length).trim()
          break
        }
      }

      // Remove surrounding quotes (single or double)
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1).trim()
      }

      // Handle psql command wrapper
      if (value.toLowerCase().startsWith("psql ")) {
        value = value.substring(5).trim() // Remove "psql "

        // Remove quotes around the URL after psql
        if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
          value = value.slice(1, -1).trim()
        }
      }

      return value
    }

    const findUrlLine = (lines: string[]): string => {
      // First, try to find lines with environment variable patterns
      const urlPatterns = ["DATABASE_URL", "DB_URL", "URL", "DB"]
      for (const line of lines) {
        const upperLine = line.toUpperCase()
        for (const pattern of urlPatterns) {
          if (upperLine.includes(pattern + "=")) {
            return extractValue(line)
          }
        }
      }

      // If no env var pattern found, check if any line contains a PostgreSQL URL
      for (const line of lines) {
        const cleaned = extractValue(line)
        if (cleaned.includes("postgresql://") || cleaned.includes("postgres://")) {
          return cleaned
        }
      }

      // If still nothing found, try the first line that looks like a URL or command
      for (const line of lines) {
        const cleaned = extractValue(line)
        if (cleaned.includes("://") || cleaned.toLowerCase().startsWith("psql")) {
          return cleaned
        }
      }

      return ""
    }

    const findTokenLine = (lines: string[]): string => {
      const tokenPatterns = ["AUTH_TOKEN", "TOKEN", "SECRET", "API_KEY"]
      for (const line of lines) {
        const upperLine = line.toUpperCase()
        for (const pattern of tokenPatterns) {
          if (upperLine.includes(pattern + "=")) {
            return extractValue(line)
          }
        }
      }
      return ""
    }

    if (type === "postgres") {
      const url = findUrlLine(lines)
      if (url) {
        setPostgresForm((prev) => ({ ...prev, url }))
        setPasteSuccess("PostgreSQL URL pasted successfully!")
        setTimeout(() => setPasteSuccess(""), 3000)
      }
    } else if (type === "turso") {
      const url = findUrlLine(lines)
      const token = findTokenLine(lines)

      if (url || token) {
        setTursoForm((prev) => ({
          ...prev,
          ...(url && { url }),
          ...(token && { authToken: token }),
        }))
        setPasteSuccess(`Turso ${url && token ? "URL and token" : url ? "URL" : "token"} pasted successfully!`)
        setTimeout(() => setPasteSuccess(""), 3000)
      }
    }
  }

  // Global paste event listener
  useEffect(() => {
    const handleGlobalPaste = async (e: ClipboardEvent) => {
      // Only handle paste if the modal is open and we're not in an input field
      const target = e.target as HTMLElement
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") {
        return // Let the input handle its own paste
      }

      try {
        const text = e.clipboardData?.getData("text") || ""
        if (text.trim()) {
          // Check if the pasted content looks like a database connection
          const lowerText = text.toLowerCase()
          if (
            lowerText.includes("postgresql://") ||
            lowerText.includes("postgres://") ||
            lowerText.includes("libsql://") ||
            lowerText.includes("database_url") ||
            lowerText.includes("db_url") ||
            lowerText.includes("psql")
          ) {
            e.preventDefault()

            // Determine the appropriate tab based on content
            if (lowerText.includes("libsql://") || lowerText.includes("turso")) {
              setActiveTab("turso")
              parseClipboardContent(text, "turso")
            } else if (
              lowerText.includes("postgresql://") ||
              lowerText.includes("postgres://") ||
              lowerText.includes("psql")
            ) {
              setActiveTab("postgres")
              parseClipboardContent(text, "postgres")
            }
          }
        }
      } catch (err) {
        console.error("Failed to handle global paste:", err)
      }
    }

    // Add global paste listener
    document.addEventListener("paste", handleGlobalPaste)

    return () => {
      document.removeEventListener("paste", handleGlobalPaste)
    }
  }, [])

  const handleManualPaste = async (type: "postgres" | "turso") => {
    try {
      const text = await navigator.clipboard.readText()
      parseClipboardContent(text, type)
    } catch (err) {
      console.error("Failed to read clipboard:", err)
      setError("Failed to read clipboard. Please paste manually or check permissions.")
      setTimeout(() => setError(""), 3000)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsConnecting(true)
    setError("")

    try {
      // Simulate connection test
      await new Promise((resolve) => setTimeout(resolve, 1500))

      let database
      if (activeTab === "postgres") {
        if (!postgresForm.name || !postgresForm.url) {
          throw new Error("Please fill in all required fields")
        }
        database = {
          type: "postgres",
          name: postgresForm.name,
          url: postgresForm.url,
          host: new URL(postgresForm.url).hostname,
        }
      } else if (activeTab === "turso") {
        if (!tursoForm.name || !tursoForm.url || !tursoForm.authToken) {
          throw new Error("Please fill in all required fields")
        }
        database = {
          type: "turso",
          name: tursoForm.name,
          url: tursoForm.url,
          authToken: tursoForm.authToken,
          host: new URL(tursoForm.url).hostname,
        }
      } else if (activeTab === "sqlite") {
        if (!sqliteForm.name || !sqliteForm.file) {
          throw new Error("Please fill in all required fields")
        }
        database = {
          type: "sqlite",
          name: sqliteForm.name,
          file: sqliteForm.file.name,
          size: sqliteForm.file.size,
        }
      }

      onSubmit(database)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Connection failed")
    } finally {
      setIsConnecting(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Global paste success message */}
      {pasteSuccess && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">{pasteSuccess}</AlertDescription>
        </Alert>
      )}

      {/* Paste instruction */}
      <Alert>
        <Clipboard className="h-4 w-4" />
        <AlertDescription>
          <strong>Tip:</strong> You can paste database connection strings anywhere in this modal. We'll automatically
          detect and parse PostgreSQL URLs, even if wrapped in <code>psql</code> commands or environment variables.
        </AlertDescription>
      </Alert>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="postgres" className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              PostgreSQL
            </TabsTrigger>
            <TabsTrigger value="turso" className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Turso
            </TabsTrigger>
            <TabsTrigger value="sqlite" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              SQLite
            </TabsTrigger>
          </TabsList>

          <TabsContent value="postgres" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  PostgreSQL Connection
                </CardTitle>
                <CardDescription>
                  Connect to your PostgreSQL database using a connection URL. Supports Neon, Supabase, and other
                  PostgreSQL providers.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="postgres-name">Connection Name *</Label>
                  <Input
                    id="postgres-name"
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
                    onChange={(e) => setPostgresForm((prev) => ({ ...prev, url: e.target.value }))}
                    required
                  />
                  <div className="text-xs text-muted-foreground mt-2 space-y-1">
                    <p>
                      <strong>Supported formats:</strong>
                    </p>
                    <p>
                      • <code>postgresql://user:pass@host:port/db</code>
                    </p>
                    <p>
                      • <code>psql 'postgresql://...'</code>
                    </p>
                    <p>
                      • <code>DATABASE_URL="postgresql://..."</code>
                    </p>
                    <p>• Environment variables with any quotes or psql wrappers</p>
                  </div>
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
                <CardDescription>Connect to your Turso database using URL and auth token</CardDescription>
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
                  <div className="flex items-center justify-between">
                    <Label htmlFor="turso-url">Database URL *</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleManualPaste("turso")}
                      className="h-8"
                    >
                      <Clipboard className="h-4 w-4 mr-2" />
                      Paste from Clipboard
                    </Button>
                  </div>
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
                  <p className="text-xs text-muted-foreground mt-1">Get your auth token from the Turso dashboard</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sqlite" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  SQLite File Upload
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
                      ref={fileInputRef}
                      id="sqlite-file"
                      type="file"
                      accept=".db,.sqlite,.sqlite3"
                      onChange={(e) => {
                        const file = e.target.files?.[0] || null
                        setSqliteForm((prev) => ({ ...prev, file }))
                      }}
                      required
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Supported formats: .db, .sqlite, .sqlite3</p>
                </div>

                {sqliteForm.file && (
                  <div className="p-3 bg-muted rounded-lg">
                    <div className="flex items-center gap-2">
                      <Upload className="h-4 w-4" />
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

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="flex gap-3">
          <Button type="submit" disabled={isConnecting} className="flex-1">
            {isConnecting ? "Connecting..." : "Connect Database"}
          </Button>
          <Button type="button" variant="outline">
            Test Connection
          </Button>
        </div>
      </form>
    </div>
  )
}
