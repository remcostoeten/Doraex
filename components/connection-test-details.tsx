"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { CheckCircle, AlertCircle, Clock, Database, Shield, Zap } from "lucide-react"

interface ConnectionTestDetailsProps {
  testResult: {
    success: boolean
    message: string
    details?: {
      serverVersion?: string
      connectionTime?: string
      tablesFound?: number
      encoding?: string
      timezone?: string
      sslStatus?: string
      sslCipher?: string
      performance?: {
        latency: number
        throughput: string
      }
    }
  }
  isLoading?: boolean
}

export function ConnectionTestDetails({ testResult, isLoading = false }: ConnectionTestDetailsProps) {
  if (isLoading) {
    return (
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-blue-800">
            <Clock className="h-5 w-5 animate-pulse" />
            Testing Connection
          </CardTitle>
          <CardDescription className="text-blue-700">
            Validating database connection and gathering server information...
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span>Establishing connection...</span>
              <span className="text-blue-600">●</span>
            </div>
            <Progress value={33} className="h-2" />
            <div className="flex items-center justify-between text-sm">
              <span>Authenticating...</span>
              <span className="text-muted-foreground">○</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span>Gathering server info...</span>
              <span className="text-muted-foreground">○</span>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={testResult.success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
      <CardHeader className="pb-3">
        <CardTitle className={`flex items-center gap-2 ${testResult.success ? "text-green-800" : "text-red-800"}`}>
          {testResult.success ? <CheckCircle className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
          {testResult.success ? "Connection Successful" : "Connection Failed"}
        </CardTitle>
        <CardDescription className={testResult.success ? "text-green-700" : "text-red-700"}>
          {testResult.message}
        </CardDescription>
      </CardHeader>

      {testResult.success && testResult.details && (
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Server Information */}
            <div className="space-y-3">
              <h4 className="font-medium text-green-800 flex items-center gap-2">
                <Database className="h-4 w-4" />
                Server Information
              </h4>
              <div className="space-y-2 text-sm">
                {testResult.details.serverVersion && (
                  <div className="flex justify-between">
                    <span className="text-green-700">Version:</span>
                    <Badge variant="outline" className="text-green-800 border-green-300">
                      {testResult.details.serverVersion}
                    </Badge>
                  </div>
                )}
                {testResult.details.encoding && (
                  <div className="flex justify-between">
                    <span className="text-green-700">Encoding:</span>
                    <span className="font-mono text-green-800">{testResult.details.encoding}</span>
                  </div>
                )}
                {testResult.details.timezone && (
                  <div className="flex justify-between">
                    <span className="text-green-700">Timezone:</span>
                    <span className="font-mono text-green-800">{testResult.details.timezone}</span>
                  </div>
                )}
                {testResult.details.tablesFound !== undefined && (
                  <div className="flex justify-between">
                    <span className="text-green-700">Tables Found:</span>
                    <Badge variant="secondary" className="text-green-800">
                      {testResult.details.tablesFound}
                    </Badge>
                  </div>
                )}
              </div>
            </div>

            {/* Performance & Security */}
            <div className="space-y-3">
              <h4 className="font-medium text-green-800 flex items-center gap-2">
                <Zap className="h-4 w-4" />
                Performance & Security
              </h4>
              <div className="space-y-2 text-sm">
                {testResult.details.connectionTime && (
                  <div className="flex justify-between">
                    <span className="text-green-700">Connection Time:</span>
                    <Badge
                      variant="outline"
                      className={`${
                        Number.parseInt(testResult.details.connectionTime) < 200
                          ? "text-green-800 border-green-300"
                          : "text-yellow-800 border-yellow-300"
                      }`}
                    >
                      {testResult.details.connectionTime}
                    </Badge>
                  </div>
                )}
                {testResult.details.performance && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-green-700">Latency:</span>
                      <span className="font-mono text-green-800">{testResult.details.performance.latency}ms</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-green-700">Throughput:</span>
                      <span className="font-mono text-green-800">{testResult.details.performance.throughput}</span>
                    </div>
                  </>
                )}
                {testResult.details.sslStatus && (
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-green-700">
                      <Shield className="h-4 w-4" />
                      <span className="font-medium">{testResult.details.sslStatus}</span>
                    </div>
                    {testResult.details.sslCipher && (
                      <div className="text-xs text-green-600 font-mono pl-6">{testResult.details.sslCipher}</div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Connection Quality Indicator */}
          <div className="mt-4 pt-4 border-t border-green-200">
            <div className="flex items-center justify-between text-sm">
              <span className="text-green-700 font-medium">Connection Quality:</span>
              <div className="flex items-center gap-2">
                {testResult.details.connectionTime && Number.parseInt(testResult.details.connectionTime) < 200 ? (
                  <>
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    </div>
                    <span className="text-green-800 font-medium">Excellent</span>
                  </>
                ) : (
                  <>
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                      <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                      <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                      <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                      <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                    </div>
                    <span className="text-yellow-800 font-medium">Good</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      )}

      {!testResult.success && (
        <CardContent>
          <div className="space-y-3">
            <h4 className="font-medium text-red-800">Common Solutions:</h4>
            <ul className="text-sm text-red-700 space-y-1 list-disc list-inside">
              <li>Check your network connection and firewall settings</li>
              <li>Verify the database server is running and accessible</li>
              <li>Confirm your credentials are correct</li>
              <li>Ensure the database name exists</li>
              <li>Check if SSL/TLS configuration is required</li>
            </ul>
          </div>
        </CardContent>
      )}
    </Card>
  )
}
