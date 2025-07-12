"use client"

import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

export default function ModuleDemo() {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Module Component Showcase</h1>
          <p className="text-muted-foreground text-lg">
            Demonstrating various UI components with enhanced styling
          </p>
        </div>

        {/* Checkbox Section */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold mb-4">Checkbox</h2>
          <div className="flex gap-4">
            <div className="flex items-center space-x-2">
              <Checkbox id="checkbox1" />
              <Label htmlFor="checkbox1">Option 1</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="checkbox2" />
              <Label htmlFor="checkbox2">Option 2</Label>
            </div>
          </div>
        </div>

        {/* Radio Group Section */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold mb-4">Radio Group</h2>
          <RadioGroup defaultValue="option1">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="option1" id="radio1"/>
              <Label htmlFor="radio1">Option 1</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="option2" id="radio2"/>
              <Label htmlFor="radio2">Option 2</Label>
            </div>
          </RadioGroup>
        </div>

        {/* Progress Section */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold mb-4">Progress Bar</h2>
          <Progress value={50} className="w-full"/>
        </div>

        
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold mb-4">Cards</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="card-glass card-hover">
              <CardHeader>
                <CardTitle>Standard Card</CardTitle>
                <CardDescription>This is a card with glass effect</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Some descriptive content within the card.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Buttons Section */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold mb-4">Buttons</h2>
          <div className="flex flex-wrap gap-4">
            <Button variant="default">Default Button</Button>
            <Button variant="secondary">Secondary Button</Button>
            <Button variant="destructive">Destructive Button</Button>
            <Button variant="outline">Outline Button</Button>
            <Button variant="ghost">Ghost Button</Button>
            <Button variant="link">Link Button</Button>
          </div>
        </div>

        {/* Form Elements */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold mb-4">Form Elements</h2>
          <div>
            <label className="block text-sm font-medium mb-2">Input Field</label>
            <Input placeholder="Type something..." />
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium mb-2">Select Field</label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select an option" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="option1">Option 1</SelectItem>
                <SelectItem value="option2">Option 2</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Badges Section */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold mb-4">Badges</h2>
          <div className="flex flex-wrap gap-2">
            <Badge variant="default">Default Badge</Badge>
            <Badge variant="secondary">Secondary Badge</Badge>
            <Badge variant="destructive">Destructive Badge</Badge>
            <Badge variant="outline">Outline Badge</Badge>
          </div>
        </div>
      </div>
    </div>
  );
}

