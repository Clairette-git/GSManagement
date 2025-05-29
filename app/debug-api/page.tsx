"use client"

import { useState } from "react"

export default function DebugAPI() {
  const [results, setResults] = useState<any>({})

  const testAPI = async (endpoint: string) => {
    try {
      console.log(`Testing ${endpoint}...`)
      const response = await fetch(endpoint)
      const data = await response.json()
      setResults((prev: any) => ({
        ...prev,
        [endpoint]: {
          status: response.status,
          ok: response.ok,
          data: data,
        },
      }))
    } catch (error) {
      setResults((prev: any) => ({
        ...prev,
        [endpoint]: {
          error: error instanceof Error ? error.message : "Unknown error",
        },
      }))
    }
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">API Debug Page</h1>

      <div className="space-y-4">
        <button onClick={() => testAPI("/api/hello")} className="bg-blue-500 text-white px-4 py-2 rounded mr-2">
          Test /api/hello
        </button>

        <button onClick={() => testAPI("/api/reports")} className="bg-green-500 text-white px-4 py-2 rounded mr-2">
          Test /api/reports
        </button>

        <button
          onClick={() => testAPI("/api/reports/cylinders")}
          className="bg-purple-500 text-white px-4 py-2 rounded mr-2"
        >
          Test /api/reports/cylinders
        </button>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">Results:</h2>
        <pre className="bg-gray-100 p-4 rounded overflow-auto">{JSON.stringify(results, null, 2)}</pre>
      </div>
    </div>
  )
}
