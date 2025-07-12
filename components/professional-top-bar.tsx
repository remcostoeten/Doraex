"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Search, Plus, LogOut, Database } from "lucide-react"
import { signOut } from "next-auth/react"

interface ProfessionalTopBarProps {
  onAddTab: (tab: { id: string; title: string; type: string }) => void
  user: {
    id: string
    name?: string | null
    email?: string | null
    username?: string
  }
}

export function ProfessionalTopBar({ onAddTab, user }: ProfessionalTopBarProps) {
  const handleConnectDatabase = () => {
    onAddTab({
      id: `connect-${Date.now()}`,
      title: "Connect Database",
      type: "connect",
    })
  }

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/" })
  }

  const getUserInitials = () => {
    if (user.name) {
      return user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    }
    if (user.username) {
      return user.username.slice(0, 2).toUpperCase()
    }
    if (user.email) {
      return user.email.slice(0, 2).toUpperCase()
    }
    return "U"
  }

  const getDisplayName = () => {
    return user.name || user.username || user.email || "User"
  }

  return (
    <div className="h-12 bg-white border-b border-gray-200 flex items-center justify-between px-4">
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center">
            <div className="w-3 h-3 bg-white rounded-sm"></div>
          </div>
          <span className="font-semibold text-gray-900">Outerbase</span>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input placeholder="Search tables, queries..." className="pl-10 w-64 h-8 text-sm" />
        </div>
      </div>

      <div className="flex items-center space-x-3">
        <Button
          size="sm"
          onClick={handleConnectDatabase}
          className="bg-blue-600 hover:bg-blue-700 text-white h-8 px-3 text-sm"
        >
          <Database className="h-4 w-4 mr-1" />
          Connect Database
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() =>
            onAddTab({
              id: `query-${Date.now()}`,
              title: "New Query",
              type: "query",
            })
          }
          className="h-8 px-3 text-sm"
        >
          <Plus className="h-4 w-4 mr-1" />
          New Query
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarImage src="/placeholder.svg" alt={getDisplayName()} />
                <AvatarFallback className="text-xs">{getUserInitials()}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <div className="flex items-center justify-start gap-2 p-2">
              <div className="flex flex-col space-y-1 leading-none">
                <p className="font-medium text-sm">{getDisplayName()}</p>
                {user.email && <p className="text-xs text-muted-foreground">{user.email}</p>}
                {user.username && user.username !== user.name && (
                  <p className="text-xs text-muted-foreground">@{user.username}</p>
                )}
              </div>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Sign out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
