"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function TestApiPage() {
  const [results, setResults] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function testConnection() {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/test-connection")
      const data = await response.json()
      setResults(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>API Connection Test</CardTitle>
        </CardHeader>
        <CardContent>
          <Button onClick={testConnection} disabled={loading}>
            {loading ? "Testing..." : "Test Database Connection"}
          </Button>

          {error && (
            <div className="mt-4 p-4 bg-red-100 text-red-800 rounded">
              <h3 className="font-bold">Error:</h3>
              <p>{error}</p>
            </div>
          )}

          {results && (
            <div className="mt-4 p-4 bg-gray-100 rounded">
              <h3 className="font-bold">Results:</h3>
              <pre className="mt-2 whitespace-pre-wrap">{JSON.stringify(results, null, 2)}</pre>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
