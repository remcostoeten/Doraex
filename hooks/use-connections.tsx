"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

export interface DatabaseConnection {
  id: string
  name: string
  type: "postgresql" | "mysql" | "sqlite" | "turso"
  dialect: string
  host?: string
  port?: number
  database?: string
  username?: string
  password?: string
  url?: string
  authToken?: string
  fileName?: string // For SQLite
  filePath?: string // For SQLite
  file?: File | null // For client-side only
  ssl?: boolean | object
  isActive: boolean
  connected: boolean
  createdAt: string
  lastConnected?: string
  tables?: DatabaseTable[]
}

export interface DatabaseTable {
  name: string
  type: "table" | "view"
  rowCount?: number
  columns?: DatabaseColumn[]
}

export interface DatabaseColumn {
  name: string
  type: string
  nullable: boolean
  primary: boolean
  default?: string
}

interface ConnectionsContextType {
  connections: DatabaseConnection[]
  activeConnection: DatabaseConnection | null
  addConnection: (connection: Omit<DatabaseConnection, "id" | "createdAt" | "isActive" | "connected">) => Promise<void>
  removeConnection: (id: string) => void
  setActiveConnection: (id: string) => Promise<void>
  updateConnection: (id: string, updates: Partial<DatabaseConnection>) => void
  testConnection: (config: any) => Promise<{ success: boolean; message: string; details?: any }>
  refreshTables: (connectionId: string) => Promise<void>
  isLoading: boolean
}

const ConnectionsContext = createContext<ConnectionsContextType | undefined>(undefined)

export function ConnectionsProvider({ children }: { children: ReactNode }) {
  const [connections, setConnections] = useState<DatabaseConnection[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Load connections from localStorage on mount
  useEffect(() => {
    const savedConnections = localStorage.getItem("outerbase-connections")
    if (savedConnections) {
      try {
        const parsed = JSON.parse(savedConnections)
        // Reconstruct File objects if needed (though for now, we just store name/size)
        const reconstructedConnections = parsed.map((conn: DatabaseConnection) => {
          if (conn.type === "sqlite" && conn.file && typeof conn.file === "object" && "name" in conn.file) {
            // This is a placeholder. A real File object cannot be serialized/deserialized this way.
            // For actual use, you'd need to re-upload or use client-side storage.
            return { ...conn, file: null } // Clear file for now, as it's not truly persisted
          }
          return conn
        })
        setConnections(reconstructedConnections)
      } catch (error) {
        console.error("Failed to parse saved connections:", error)
      }
    }
    setIsLoading(false)
  }, [])

  // Save connections to localStorage whenever they change
  useEffect(() => {
    if (!isLoading) {
      // When saving, don't store the actual File object, just its metadata if needed
      const serializableConnections = connections.map((conn) => {
        if (conn.type === "sqlite" && conn.file) {
          return { ...conn, file: { name: conn.file.name, size: conn.file.size, type: conn.file.type } }
        }
        return conn
      })
      localStorage.setItem("outerbase-connections", JSON.stringify(serializableConnections))
    }
  }, [connections, isLoading])

  const testConnection = async (config: any): Promise<{ success: boolean; message: string; details?: any }> => {
    if (config.type === "sqlite") {
      // Simulate SQLite test connection
      await new Promise((resolve) => setTimeout(resolve, 200)) // Very fast for local file
      return {
        success: true,
        message: "SQLite file detected. Connection simulated successfully.",
        details: {
          fileName: config.file?.name || "N/A",
          fileSize: config.file ? `${(config.file.size / 1024 / 1024).toFixed(2)} MB` : "N/A",
          connectionTime: "0ms",
          tablesFound: "Simulated",
          provider: "Local SQLite",
        },
      }
    }

    try {
      const response = await fetch("/api/connections/test", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: config.type || "postgresql",
          config,
        }),
      })

      const result = await response.json()
      return result
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : "Connection test failed",
      }
    }
  }

  const fetchTables = async (connection: DatabaseConnection): Promise<DatabaseTable[]> => {
    if (connection.type === "sqlite") {
      try {
        console.log("Fetching tables for SQLite connection:", connection.name)

        const response = await fetch(`/api/connections/${connection.id}/tables`, {
          headers: {
            "x-connection-config": JSON.stringify({
              type: connection.type,
              filePath: connection.filePath,
              fileName: connection.fileName,
            }),
          },
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || "Failed to fetch SQLite tables")
        }

        const data = await response.json()
        console.log("Fetched SQLite tables:", data.tables)
        return data.tables || []
      } catch (error) {
        console.error("Error fetching SQLite tables:", error)
        throw error
      }
    }

    try {
      console.log("Fetching tables for connection:", connection.name)

      const response = await fetch(`/api/connections/${connection.id}/tables`, {
        headers: {
          "x-connection-config": JSON.stringify({
            type: connection.type,
            host: connection.host,
            port: connection.port,
            database: connection.database,
            username: connection.username,
            password: connection.password,
            url: connection.url,
            ssl: connection.ssl,
          }),
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to fetch tables")
      }

      const data = await response.json()
      console.log("Fetched tables:", data.tables)
      return data.tables || []
    } catch (error) {
      console.error("Error fetching tables:", error)
      throw error
    }
  }

  const addConnection = async (
    connectionData: Omit<DatabaseConnection, "id" | "createdAt" | "isActive" | "connected">,
  ) => {
    const newConnection: DatabaseConnection = {
      ...connectionData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      isActive: connections.length === 0, // First connection is active by default
      connected: false,
      tables: [],
    }

    setConnections((prev) => {
      // If this is the first connection or we're setting it as active, deactivate others
      const updated = newConnection.isActive ? prev.map((conn) => ({ ...conn, isActive: false })) : prev
      return [...updated, newConnection]
    })

    // Fetch tables for the new connection
    if (newConnection.isActive) {
      await refreshTables(newConnection.id)
    }
  }

  const removeConnection = (id: string) => {
    setConnections((prev) => {
      const filtered = prev.filter((conn) => conn.id !== id)
      // If we removed the active connection, make the first remaining one active
      if (prev.find((conn) => conn.id === id)?.isActive && filtered.length > 0) {
        filtered[0].isActive = true
        // Fetch tables for the new active connection
        refreshTables(filtered[0].id)
      }
      return filtered
    })
  }

  const setActiveConnection = async (id: string) => {
    setConnections((prev) =>
      prev.map((conn) => ({
        ...conn,
        isActive: conn.id === id,
        lastConnected: conn.id === id ? new Date().toISOString() : conn.lastConnected,
      })),
    )

    // Fetch tables for the newly active connection
    await refreshTables(id)
  }

  const updateConnection = (id: string, updates: Partial<DatabaseConnection>) => {
    setConnections((prev) => prev.map((conn) => (conn.id === id ? { ...conn, ...updates } : conn)))
  }

  const refreshTables = async (connectionId: string) => {
    const connection = connections.find((conn) => conn.id === connectionId)
    if (!connection) return

    try {
      console.log("Refreshing tables for connection:", connection.name)

      // Mark as connecting
      setConnections((prev) => prev.map((conn) => (conn.id === connectionId ? { ...conn, connected: false } : conn)))

      const tables = await fetchTables(connection)

      setConnections((prev) =>
        prev.map((conn) =>
          conn.id === connectionId
            ? { ...conn, tables, connected: true, lastConnected: new Date().toISOString() }
            : conn,
        ),
      )

      console.log("Successfully refreshed tables:", tables.length, "tables found")
    } catch (error) {
      console.error("Error refreshing tables:", error)
      setConnections((prev) =>
        prev.map((conn) => (conn.id === connectionId ? { ...conn, connected: false, tables: [] } : conn)),
      )
    }
  }

  const activeConnection = connections.find((conn) => conn.isActive) || null

  return (
    <ConnectionsContext.Provider
      value={{
        connections,
        activeConnection,
        addConnection,
        removeConnection,
        setActiveConnection,
        updateConnection,
        testConnection,
        refreshTables,
        isLoading,
      }}
    >
      {children}
    </ConnectionsContext.Provider>
  )
}

export function useConnections() {
  const context = useContext(ConnectionsContext)
  if (context === undefined) {
    throw new Error("useConnections must be used within a ConnectionsProvider")
  }
  return context
}
