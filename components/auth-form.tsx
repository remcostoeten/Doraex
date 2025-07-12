"use client"

import type React from "react"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, LogIn, UserPlus, Database, AlertCircle, CheckCircle } from "lucide-react"

export function AuthForm() {
  const [activeTab, setActiveTab] = useState("login")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [isInitializingDb, setIsInitializingDb] = useState(false)

  // Login form state
  const [loginForm, setLoginForm] = useState({
    identifier: "",
    password: "",
  })

  // Registration form state
  const [registerForm, setRegisterForm] = useState({
    username: "",
    email: "",
    name: "",
    password: "",
    confirmPassword: "",
  })

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    const result = await signIn("credentials", {
      identifier: loginForm.identifier,
      password: loginForm.password,
      redirect: false,
    })

    setIsLoading(false)

    if (result?.error) {
      setError("Invalid email/username or password")
    } else {
      window.location.reload()
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setSuccess("")

    // Validate passwords match
    if (registerForm.password !== registerForm.confirmPassword) {
      setError("Passwords do not match")
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: registerForm.username,
          email: registerForm.email,
          name: registerForm.name,
          password: registerForm.password,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Registration failed")
      }

      setSuccess("Account created successfully! You can now sign in.")
      setActiveTab("login")
      setLoginForm({ identifier: registerForm.email, password: "" })
      setRegisterForm({
        username: "",
        email: "",
        name: "",
        password: "",
        confirmPassword: "",
      })
    } catch (err: any) {
      setError(err.message || "Registration failed")
    } finally {
      setIsLoading(false)
    }
  }

  const initializeDatabase = async () => {
    setIsInitializingDb(true)
    setError("")
    setSuccess("")

    try {
      const response = await fetch("/api/auth/init-db", {
        method: "POST",
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Database initialization failed")
      }

      setSuccess("Database initialized successfully! You can now register an account.")
    } catch (err: any) {
      setError(err.message || "Database initialization failed")
    } finally {
      setIsInitializingDb(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <div className="w-full max-w-md space-y-4">
        {/* Database initialization */}
        <Card className="border-dashed">
          <CardHeader className="text-center pb-3">
            <CardTitle className="text-lg flex items-center justify-center gap-2">
              <Database className="h-5 w-5" />
              Database Setup
            </CardTitle>
            <CardDescription className="text-sm">Initialize the user database before creating accounts</CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={initializeDatabase}
              disabled={isInitializingDb}
              className="w-full bg-transparent"
              variant="outline"
            >
              {isInitializingDb ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Initializing...
                </>
              ) : (
                <>
                  <Database className="mr-2 h-4 w-4" />
                  Initialize Database
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Auth form */}
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Welcome to Outerbase</CardTitle>
            <CardDescription>Sign in to manage your databases</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Sign In</TabsTrigger>
                <TabsTrigger value="register">Register</TabsTrigger>
              </TabsList>

              <TabsContent value="login" className="space-y-4 mt-4">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <Label htmlFor="identifier">Email or Username</Label>
                    <Input
                      id="identifier"
                      type="text"
                      placeholder="Enter your email or username"
                      value={loginForm.identifier}
                      onChange={(e) => setLoginForm((prev) => ({ ...prev, identifier: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Enter your password"
                      value={loginForm.password}
                      onChange={(e) => setLoginForm((prev) => ({ ...prev, password: e.target.value }))}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Signing In...
                      </>
                    ) : (
                      <>
                        <LogIn className="mr-2 h-4 w-4" />
                        Sign In
                      </>
                    )}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="register" className="space-y-4 mt-4">
                <form onSubmit={handleRegister} className="space-y-4">
                  <div>
                    <Label htmlFor="reg-username">Username</Label>
                    <Input
                      id="reg-username"
                      type="text"
                      placeholder="Choose a username"
                      value={registerForm.username}
                      onChange={(e) => setRegisterForm((prev) => ({ ...prev, username: e.target.value }))}
                      required
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      3-20 characters, letters, numbers, and underscores only
                    </p>
                  </div>
                  <div>
                    <Label htmlFor="reg-email">Email</Label>
                    <Input
                      id="reg-email"
                      type="email"
                      placeholder="Enter your email"
                      value={registerForm.email}
                      onChange={(e) => setRegisterForm((prev) => ({ ...prev, email: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="reg-name">Full Name</Label>
                    <Input
                      id="reg-name"
                      type="text"
                      placeholder="Enter your full name"
                      value={registerForm.name}
                      onChange={(e) => setRegisterForm((prev) => ({ ...prev, name: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="reg-password">Password</Label>
                    <Input
                      id="reg-password"
                      type="password"
                      placeholder="Create a password"
                      value={registerForm.password}
                      onChange={(e) => setRegisterForm((prev) => ({ ...prev, password: e.target.value }))}
                      required
                    />
                    <p className="text-xs text-muted-foreground mt-1">At least 6 characters</p>
                  </div>
                  <div>
                    <Label htmlFor="reg-confirm-password">Confirm Password</Label>
                    <Input
                      id="reg-confirm-password"
                      type="password"
                      placeholder="Confirm your password"
                      value={registerForm.confirmPassword}
                      onChange={(e) => setRegisterForm((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating Account...
                      </>
                    ) : (
                      <>
                        <UserPlus className="mr-2 h-4 w-4" />
                        Create Account
                      </>
                    )}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            {error && (
              <Alert variant="destructive" className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="mt-4 border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">{success}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
