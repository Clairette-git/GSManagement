"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function APITestPage() {
  const [results, setResults] = useState<Record<string, any>>({})
  const [loading, setLoading] = useState<Record<string, boolean>>({})

  const testEndpoint = async (endpoint: string, name: string) => {
    setLoading((prev) => ({ ...prev, [name]: true }))

    try {
      console.log(`🧪 Testing ${endpoint}...`)
      const response = await fetch(endpoint)

      let data
      try {
        data = await response.json()
      } catch {
        data = await response.text()
      }

      const result = {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        url: response.url,
        data: data,
        timestamp: new Date().toISOString(),
      }

      console.log(`🧪 ${name} result:`, result)
      setResults((prev) => ({ ...prev, [name]: result }))
    } catch (error) {
      const result = {
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      }
      console.error(`🧪 ${name} error:`, result)
      setResults((prev) => ({ ...prev, [name]: result }))
    } finally {
      setLoading((prev) => ({ ...prev, [name]: false }))
    }
  }

  const endpoints = [
    { url: "/api/test", name: "Basic Test" },
    { url: "/api/reports", name: "Reports Root" },
    { url: "/api/reports/test", name: "Reports Test" },
    { url: "/api/reports/cylinders", name: "Reports Cylinders" },
    { url: "/api/test-connection", name: "Existing Test Connection" },
  ]

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>API Endpoint Testing</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {endpoints.map(({ url, name }) => (
              <Button
                key={name}
                onClick={() => testEndpoint(url, name)}
                disabled={loading[name]}
                variant="outline"
                className="h-auto p-4 flex flex-col items-center"
              >
                <span className="font-medium">{name}</span>
                <span className="text-xs text-gray-500">{url}</span>
                {loading[name] && <span className="text-xs">Testing...</span>}
              </Button>
            ))}
          </div>

          <div className="space-y-4">
            {Object.entries(results).map(([name, result]) => (
              <Card
                key={name}
                className={result.ok ? "border-green-200" : result.error ? "border-red-200" : "border-yellow-200"}
              >
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center justify-between">
                    <span>{name}</span>
                    <span
                      className={`text-xs px-2 py-1 rounded ${
                        result.ok
                          ? "bg-green-100 text-green-800"
                          : result.error
                            ? "bg-red-100 text-red-800"
                            : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {result.ok ? "✅ Success" : result.error ? "❌ Error" : `⚠️ ${result.status}`}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <pre className="text-xs bg-gray-50 p-2 rounded overflow-auto max-h-40">
                    {JSON.stringify(result, null, 2)}
                  </pre>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
