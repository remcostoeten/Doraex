"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { CheckCircle, Clock, Database, Shield, Zap, AlertCircle } from "lucide-react"

interface TestStep {
  id: string
  label: string
  icon: React.ReactNode
  status: "pending" | "running" | "completed" | "failed"
  duration?: number
}

interface ConnectionTestProgressProps {
  isActive: boolean
  onComplete: (success: boolean, details?: any) => void
}

export function ConnectionTestProgress({ isActive, onComplete }: ConnectionTestProgressProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [progress, setProgress] = useState(0)
  const [steps, setSteps] = useState<TestStep[]>([
    {
      id: "connect",
      label: "Establishing connection",
      icon: <Database className="h-4 w-4" />,
      status: "pending",
    },
    {
      id: "auth",
      label: "Authenticating credentials",
      icon: <Shield className="h-4 w-4" />,
      status: "pending",
    },
    {
      id: "ssl",
      label: "Verifying SSL/TLS",
      icon: <Shield className="h-4 w-4" />,
      status: "pending",
    },
    {
      id: "query",
      label: "Testing query execution",
      icon: <Zap className="h-4 w-4" />,
      status: "pending",
    },
    {
      id: "metadata",
      label: "Gathering database info",
      icon: <Database className="h-4 w-4" />,
      status: "pending",
    },
  ])

  useEffect(() => {
    if (!isActive) {
      // Reset state when not active
      setCurrentStep(0)
      setProgress(0)
      setSteps(steps.map((step) => ({ ...step, status: "pending" })))
      return
    }

    const runTest = async () => {
      const stepDuration = 400 // ms per step
      const totalSteps = steps.length

      for (let i = 0; i < totalSteps; i++) {
        // Update current step to running
        setSteps((prev) =>
          prev.map((step, index) => ({
            ...step,
            status: index === i ? "running" : index < i ? "completed" : "pending",
          })),
        )
        setCurrentStep(i)

        // Simulate step progress
        const stepProgress = ((i + 1) / totalSteps) * 100

        // Animate progress for current step
        for (let p = (i / totalSteps) * 100; p <= stepProgress; p += 2) {
          setProgress(p)
          await new Promise((resolve) => setTimeout(resolve, stepDuration / 50))
        }

        // Small chance of failure for demo purposes
        if (Math.random() < 0.1 && i > 0) {
          setSteps((prev) =>
            prev.map((step, index) => ({
              ...step,
              status: index === i ? "failed" : index < i ? "completed" : "pending",
            })),
          )
          onComplete(false)
          return
        }

        // Mark step as completed
        setSteps((prev) =>
          prev.map((step, index) => ({
            ...step,
            status: index === i ? "completed" : step.status,
          })),
        )

        await new Promise((resolve) => setTimeout(resolve, stepDuration))
      }

      // All steps completed successfully
      setProgress(100)
      onComplete(true, {
        serverVersion: "PostgreSQL 15.4",
        connectionTime: `${Math.floor(Math.random() * 300 + 100)}ms`,
        tablesFound: Math.floor(Math.random() * 20 + 5),
        encoding: "UTF8",
        timezone: "UTC",
        sslStatus: "SSL connection established",
        sslCipher: "ECDHE-RSA-AES256-GCM-SHA384",
        performance: {
          latency: Math.floor(Math.random() * 50 + 20),
          throughput: `${Math.floor(Math.random() * 100 + 50)} MB/s`,
        },
      })
    }

    runTest()
  }, [isActive, onComplete])

  if (!isActive) return null

  return (
    <Card className="border-blue-200 bg-blue-50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-blue-800">
          <Clock className="h-5 w-5 animate-pulse" />
          Testing Database Connection
        </CardTitle>
        <CardDescription className="text-blue-700">
          Validating connection parameters and gathering server information...
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Overall Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-blue-700">
            <span>Overall Progress</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Step Details */}
        <div className="space-y-3">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center gap-3">
              <div
                className={`flex items-center justify-center w-6 h-6 rounded-full border-2 ${
                  step.status === "completed"
                    ? "bg-green-100 border-green-500 text-green-600"
                    : step.status === "running"
                      ? "bg-blue-100 border-blue-500 text-blue-600 animate-pulse"
                      : step.status === "failed"
                        ? "bg-red-100 border-red-500 text-red-600"
                        : "bg-gray-100 border-gray-300 text-gray-400"
                }`}
              >
                {step.status === "completed" ? (
                  <CheckCircle className="h-4 w-4" />
                ) : step.status === "failed" ? (
                  <AlertCircle className="h-4 w-4" />
                ) : (
                  step.icon
                )}
              </div>
              <span
                className={`text-sm ${
                  step.status === "completed"
                    ? "text-green-700 font-medium"
                    : step.status === "running"
                      ? "text-blue-700 font-medium"
                      : step.status === "failed"
                        ? "text-red-700 font-medium"
                        : "text-gray-600"
                }`}
              >
                {step.label}
                {step.status === "running" && <span className="ml-2 text-blue-600">●</span>}
                {step.status === "completed" && step.duration && (
                  <span className="ml-2 text-green-600 text-xs">({step.duration}ms)</span>
                )}
              </span>
            </div>
          ))}
        </div>

        {/* Current Step Details */}
        {currentStep < steps.length && (
          <div className="mt-4 p-3 bg-blue-100 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2 text-blue-800 text-sm">
              <Clock className="h-4 w-4" />
              <span className="font-medium">{steps[currentStep]?.label}...</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
