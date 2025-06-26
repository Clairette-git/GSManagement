"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"

export default function CheckExistingAPIs() {
  const [results, setResults] = useState<string[]>([])

  const testExistingAPI = async () => {
    try {
     
      const response = await fetch("/api/test-connection")
      const data = await response.json()
      setResults((prev) => [...prev, `✅ /api/test-connection: ${response.status} - ${JSON.stringify(data)}`])
    } catch (error) {
      setResults((prev) => [...prev, `❌ /api/test-connection: ${error}`])
    }

    try {

      const response = await fetch("/api/cylinders")
      const data = await response.json()
      setResults((prev) => [
        ...prev,
        `✅ /api/cylinders: ${response.status} - ${JSON.stringify(data).substring(0, 100)}...`,
      ])
    } catch (error) {
      setResults((prev) => [...prev, `❌ /api/cylinders: ${error}`])
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Check Existing APIs</h1>
      <Button onClick={testExistingAPI}>Test Existing APIs</Button>

      <div className="mt-4 space-y-2">
        {results.map((result, index) => (
          <div key={index} className="p-2 bg-gray-100 rounded">
            {result}
          </div>
        ))}
      </div>
    </div>
  )
}
