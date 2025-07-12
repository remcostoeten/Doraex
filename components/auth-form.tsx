"use client"

import type React from "react"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AnimatedCard, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/animated-card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, LogIn, UserPlus, Database, AlertCircle, CheckCircle } from "lucide-react"
import { OAuthButtons } from "@/components/oauth-buttons"
import { SignIn } from "@/components/ui/sign-in"

type TSignInWrapperProps = {
  onError?: (error: string) => void;
  onSuccess?: () => void;
};

function SignInWrapper({ onError, onSuccess }: TSignInWrapperProps) {
  return (
    <div className="signin-wrapper">
      <style jsx global>{`
        .signin-wrapper > div {
          min-height: auto !important;
          background: transparent !important;
        }
        .signin-wrapper > div > div {
          max-width: 100% !important;
          padding: 0 !important;
        }
        .signin-wrapper > div > div > div {
          grid-template-columns: 1fr !important;
        }
        .signin-wrapper > div > div > div > div:last-child {
          display: none !important;
        }
        .signin-wrapper > div > div > div > div > div:first-child {
          display: none !important;
        }
        .signin-wrapper > div > div > div > div > div:last-child {
          background: transparent !important;
          backdrop-filter: none !important;
          padding: 0 !important;
          border: none !important;
          box-shadow: none !important;
        }
      `}</style>
      <SignIn callbackUrl="/" />
    </div>
  );
}

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
        <AnimatedCard className="border-dashed" delay={0}>
          <CardHeader className="text-center pb-3">
            <CardTitle className="text-lg flex items-center justify-center gap-2">
              <Database className="h-5 w-5" />
              Database Setup
            </CardTitle>
            <CardDescription className="text-sm">Initialize the user database before creating accounts</CardDescription>
          </CardHeader>
          <CardContent>
            <motion.div
            >
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
            </motion.div>
          </CardContent>
        </AnimatedCard>

        {/* Auth form */}
        <AnimatedCard
          delay={0.1}
          variants={{
            initial: { opacity: 0, y: 20 },
            animate: { opacity: 1, y: 0 },
            exit: { opacity: 0, y: 20 }
          }}
        >
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Welcome to Outerbase</CardTitle>
            <CardDescription>Sign in to manage your databases</CardDescription>
          </CardHeader>
          <CardContent>
            <OAuthButtons disabled={isLoading || isInitializingDb} />
            
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or continue with
                </span>
              </div>
            </div>
            
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Sign In</TabsTrigger>
                <TabsTrigger value="register">Register</TabsTrigger>
              </TabsList>

              <TabsContent value="login" className="space-y-4 mt-4">
                <SignInWrapper />
              </TabsContent>

              <TabsContent value="register" className="space-y-4 mt-4">
                <AnimatePresence mode="wait">
                  <motion.div
                    key="register"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <form onSubmit={handleRegister} className="space-y-4">
                      <div>
                        <Label htmlFor="reg-username">Username</Label>
                        <motion.div
                          whileFocus={{ scale: 1.02 }}
                          transition={{ type: "spring", stiffness: 300 }}
                        >
                          <Input
                            id="reg-username"
                            type="text"
                            placeholder="Choose a username"
                            value={registerForm.username}
                            onChange={(e) => setRegisterForm((prev) => ({ ...prev, username: e.target.value }))}
                            required
                          />
                        </motion.div>
                        <p className="text-xs text-muted-foreground mt-1">
                          3-20 characters, letters, numbers, and underscores only
                        </p>
                      </div>
                      <div>
                        <Label htmlFor="reg-email">Email</Label>
                        <motion.div
                          whileFocus={{ scale: 1.02 }}
                          transition={{ type: "spring", stiffness: 300 }}
                        >
                          <Input
                            id="reg-email"
                            type="email"
                            placeholder="Enter your email"
                            value={registerForm.email}
                            onChange={(e) => setRegisterForm((prev) => ({ ...prev, email: e.target.value }))}
                            required
                          />
                        </motion.div>
                      </div>
                      <div>
                        <Label htmlFor="reg-name">Full Name</Label>
                        <motion.div
                          whileFocus={{ scale: 1.02 }}
                          transition={{ type: "spring", stiffness: 300 }}
                        >
                          <Input
                            id="reg-name"
                            type="text"
                            placeholder="Enter your full name"
                            value={registerForm.name}
                            onChange={(e) => setRegisterForm((prev) => ({ ...prev, name: e.target.value }))}
                            required
                          />
                        </motion.div>
                      </div>
                      <div>
                        <Label htmlFor="reg-password">Password</Label>
                        <motion.div
                          whileFocus={{ scale: 1.02 }}
                          transition={{ type: "spring", stiffness: 300 }}
                        >
                          <Input
                            id="reg-password"
                            type="password"
                            placeholder="Create a password"
                            value={registerForm.password}
                            onChange={(e) => setRegisterForm((prev) => ({ ...prev, password: e.target.value }))}
                            required
                          />
                        </motion.div>
                        <p className="text-xs text-muted-foreground mt-1">At least 6 characters</p>
                      </div>
                      <div>
                        <Label htmlFor="reg-confirm-password">Confirm Password</Label>
                        <motion.div
                          whileFocus={{ scale: 1.02 }}
                          transition={{ type: "spring", stiffness: 300 }}
                        >
                          <Input
                            id="reg-confirm-password"
                            type="password"
                            placeholder="Confirm your password"
                            value={registerForm.confirmPassword}
                            onChange={(e) => setRegisterForm((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                            required
                          />
                        </motion.div>
                      </div>
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
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
                      </motion.div>
                    </form>
                  </motion.div>
                </AnimatePresence>
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
        </AnimatedCard>
      </div>
    </div>
  )
}
