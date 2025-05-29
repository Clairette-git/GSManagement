"use client"

import { useEffect, useState } from "react"

export default function DebugUserPage() {
  const [debugInfo, setDebugInfo] = useState<any>({})

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check localStorage
        const localUser = localStorage.getItem("user")

        // Check API
        const apiResponse = await fetch("/api/auth/me")
        const apiData = apiResponse.ok ? await apiResponse.json() : null

        // Check cookies
        const cookies = document.cookie

        setDebugInfo({
          localStorage: localUser,
          localUserParsed: localUser ? JSON.parse(localUser) : null,
          apiResponse: apiData,
          apiStatus: apiResponse.status,
          cookies: cookies,
          timestamp: new Date().toISOString(),
        })
      } catch (error) {
        setDebugInfo({
          error: error instanceof Error ? error.message : String(error),
          timestamp: new Date().toISOString(),
        })
      }
    }

    checkAuth()
  }, [])

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">User Authentication Debug</h1>
      <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">{JSON.stringify(debugInfo, null, 2)}</pre>

      <div className="mt-4">
        <h2 className="text-lg font-semibold mb-2">Quick Tests:</h2>
        <button
          onClick={() => (window.location.href = "/supplies")}
          className="bg-blue-500 text-white px-4 py-2 rounded mr-2"
        >
          Go to Supplies
        </button>
        <button
          onClick={() => (window.location.href = "/dashboard")}
          className="bg-green-500 text-white px-4 py-2 rounded"
        >
          Go to Dashboard
        </button>
      </div>
    </div>
  )
}
