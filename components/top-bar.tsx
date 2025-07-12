"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Search, Plus, Download, Upload, Settings, Database, User, LogOut, Sun, Moon, Smartphone } from "lucide-react"
import { ConnectionCreationModal } from "@/components/connection-creation-modal"

type Theme = "light" | "dark" | "oled"

export function TopBar() {
  const [theme, setTheme] = useState<Theme>("light")
  const [isConnectionModalOpen, setIsConnectionModalOpen] = useState(false)

  useEffect(() => {
    // Check for saved theme preference or default to light
    const savedTheme = localStorage.getItem("theme") as Theme | null
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches

    const initialTheme = savedTheme || (prefersDark ? "dark" : "light")
    setTheme(initialTheme)
    applyTheme(initialTheme)
  }, [])

  const applyTheme = (newTheme: Theme) => {
    // Remove all theme classes
    document.documentElement.classList.remove("dark", "oled")

    // Apply the new theme class
    if (newTheme !== "light") {
      document.documentElement.classList.add(newTheme)
    }
  }

  const cycleTheme = () => {
    const themeOrder: Theme[] = ["light", "dark", "oled"]
    const currentIndex = themeOrder.indexOf(theme)
    const nextIndex = (currentIndex + 1) % themeOrder.length
    const newTheme = themeOrder[nextIndex]

    setTheme(newTheme)
    localStorage.setItem("theme", newTheme)
    applyTheme(newTheme)
  }

  const getThemeIcon = () => {
    switch (theme) {
      case "light":
        return <Sun className="h-4 w-4" />
      case "dark":
        return <Moon className="h-4 w-4" />
      case "oled":
        return <Smartphone className="h-4 w-4" />
      default:
        return <Sun className="h-4 w-4" />
    }
  }

  const getThemeLabel = () => {
    switch (theme) {
      case "light":
        return "Light"
      case "dark":
        return "Dark"
      case "oled":
        return "OLED"
      default:
        return "Light"
    }
  }

  return (
    <div className="h-14 border-b bg-background flex items-center justify-between px-4">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Database className="h-6 w-6 text-primary" />
          <span className="font-semibold text-lg">Outerbase</span>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search tables, columns..." className="pl-10 w-80" />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm">
          <Upload className="h-4 w-4 mr-2" />
          Import
        </Button>
        <Button variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
        <Button size="sm" onClick={() => setIsConnectionModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Table
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={cycleTheme}
          className="ml-2 flex items-center gap-2"
          title={`Current: ${getThemeLabel()} (click to cycle)`}
        >
          {getThemeIcon()}
          <span className="text-xs hidden sm:inline">{getThemeLabel()}</span>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="ml-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src="/placeholder-user.jpg" />
                <AvatarFallback>JD</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>
              <User className="h-4 w-4 mr-2" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <ConnectionCreationModal open={isConnectionModalOpen} onOpenChange={setIsConnectionModalOpen} />
    </div>
  )
}
