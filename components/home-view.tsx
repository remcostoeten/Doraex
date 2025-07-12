"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DatabaseCard } from "@/components/database-card"
import { Plus, Database, HomeIcon } from "lucide-react"
import { ConnectionCreationModal } from "@/components/connection-creation-modal"
import { useConnections } from "@/hooks/use-connections"

export function HomeView() {
  const { connections, removeConnection } = useConnections()
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)

  const handleAddDatabase = () => {
    setIsAddDialogOpen(true)
  }

  const handleRemoveDatabase = (id: string) => removeConnection(id)

  const handleEditDatabase = (id: string) => {
    // TODO: Implement edit functionality
    console.log("Edit database:", id)
  }

  return (
    <div className="h-full p-6 bg-background">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3 text-foreground">
              <HomeIcon className="h-8 w-8" />
              Welcome to Outerbase
            </h1>
            <p className="text-muted-foreground mt-2">Connect to your databases and start exploring your data</p>
          </div>

          <Button
            size="lg"
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
            onClick={() => setIsAddDialogOpen(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Database
          </Button>
        </div>

        {/* Quick Stats */}
        {connections.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-card border-border">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-card-foreground">Connected Databases</CardTitle>
                <Database className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-card-foreground">{connections.length}</div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-card-foreground">Database Types</CardTitle>
                <Database className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-card-foreground">
                  {new Set(connections.map((db) => db.type)).size}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-card-foreground">Active Connections</CardTitle>
                <Database className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-card-foreground">
                  {connections.filter((db) => db.connected).length}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Database Connections */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-foreground">Your Databases</h2>
          </div>

          {connections.length === 0 ? (
            <Card className="border-dashed border-2 border-muted bg-card">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <div className="relative mb-6">
                  <Database className="h-16 w-16 text-muted-foreground" />
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                    <Plus className="h-4 w-4 text-primary-foreground" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold mb-2 text-card-foreground">No databases connected</h3>
                <p className="text-muted-foreground text-center mb-6 max-w-md">
                  Get started by connecting to your first database. We support PostgreSQL, Turso, and SQLite with smart
                  clipboard parsing.
                </p>
                <Button
                  size="lg"
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                  onClick={() => setIsAddDialogOpen(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Database
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {connections.map((database) => (
                <DatabaseCard
                  key={database.id}
                  database={database}
                  onEdit={handleEditDatabase}
                  onDelete={handleRemoveDatabase}
                />
              ))}
            </div>
          )}
        </div>

        {/* Getting Started */}
        {connections.length === 0 && (
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-card-foreground">Getting Started</CardTitle>
              <CardDescription>Learn how to make the most of Outerbase</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-6 rounded-lg bg-muted">
                  <Database className="h-10 w-10 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="font-semibold mb-2 text-foreground">Connect Database</h3>
                  <p className="text-sm text-muted-foreground">Add your first database connection to get started</p>
                </div>
                <div className="text-center p-6 rounded-lg bg-muted">
                  <Database className="h-10 w-10 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="font-semibold mb-2 text-foreground">Browse Data</h3>
                  <p className="text-sm text-muted-foreground">
                    Explore your tables and edit data with our intuitive interface
                  </p>
                </div>
                <div className="text-center p-6 rounded-lg bg-muted">
                  <Database className="h-10 w-10 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="font-semibold mb-2 text-foreground">Run Queries</h3>
                  <p className="text-sm text-muted-foreground">
                    Write and execute SQL queries with our powerful editor
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
      <ConnectionCreationModal open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen} />
    </div>
  )
}
