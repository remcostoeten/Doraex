"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Database, Settings, User } from "lucide-react"

export default function DarkThemeDemo() {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Dark Theme Component Showcase</h1>
          <p className="text-muted-foreground text-lg">Enhanced components with glass morphism and accessibility</p>
        </div>

        {/* Cards Section */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold mb-4">Cards with Glass Effects</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="card-glass card-hover">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-muted-glass rounded-lg">
                    <Database className="h-5 w-5" />
                  </div>
                  <CardTitle>Standard Card</CardTitle>
                </div>
                <CardDescription>This card has glass morphism effects</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Hover over this card to see the enhanced hover state with subtle glow effects.
                </p>
              </CardContent>
            </Card>

            <Card className="glass">
              <CardHeader>
                <CardTitle>Glass Card</CardTitle>
                <CardDescription>Using the .glass utility class</CardDescription>
              </CardHeader>
              <CardContent>
                <Badge className="mb-2">Active</Badge>
                <p className="text-sm text-muted-foreground">
                  This card uses the glass utility for a more translucent effect.
                </p>
              </CardContent>
            </Card>

            <Card className="glass-lg">
              <CardHeader>
                <CardTitle>Heavy Glass</CardTitle>
                <CardDescription>Maximum blur effect</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Badge variant="secondary">Tag 1</Badge>
                  <Badge variant="outline">Tag 2</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Buttons Section */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold mb-4">Button Variants</h2>
          <Card className="card-glass">
            <CardContent className="pt-6">
              <div className="flex flex-wrap gap-4">
                <Button variant="default">Default Button</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="destructive">Destructive</Button>
                <Button variant="link">Link Style</Button>
              </div>
              <p className="text-sm text-muted-foreground mt-4">
                All buttons have enhanced focus states with proper contrast ratios
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Form Elements */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold mb-4">Form Elements</h2>
          <Card className="card-glass">
            <CardContent className="pt-6 space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Input Field</label>
                <Input placeholder="Type something..." />
                <p className="text-xs text-muted-foreground mt-1">Glass effect input with enhanced focus state</p>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Select Field</label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an option" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="option1">Option 1</SelectItem>
                    <SelectItem value="option2">Option 2</SelectItem>
                    <SelectItem value="option3">Option 3</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">Dropdown with glass morphism backdrop</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Focus States Demo */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold mb-4">Accessibility Focus States</h2>
          <Card className="card-glass">
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground mb-4">
                Tab through these elements to see the enhanced focus rings:
              </p>
              <div className="flex gap-4 items-center">
                <Button className="focus-ring">Tab to me</Button>
                <Input className="max-w-xs" placeholder="Focus me" />
                <Select>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Focus this" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="test">Test</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Contrast Demo */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold mb-4">Contrast & Readability</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-muted-glass">
              <CardHeader>
                <CardTitle>Muted Glass Background</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-foreground mb-2">Primary text color</p>
                <p className="text-muted-foreground">Muted foreground text with proper contrast</p>
                <div className="mt-4 p-3 bg-background/50 rounded">
                  <p className="text-sm">Nested translucent container</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-primary/20 dark:shadow-glow">
              <CardHeader>
                <CardTitle>Glow Effect Card</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  This card has a subtle glow effect in dark mode
                </p>
                <div className="flex gap-2 mt-4">
                  <Badge className="bg-primary/20 text-primary border-primary/30">Custom Badge</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
