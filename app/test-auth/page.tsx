"use client"

import { useEffect, useState } from "react"

export default function TestAuthPage() {
  const [authStatus, setAuthStatus] = useState<{
    authenticated: boolean
    message: string
    user?: any
  } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Get token from localStorage
        const token = localStorage.getItem("auth_token")

        const response = await fetch("/api/test-auth", {
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        })

        const data = await response.json()
        setAuthStatus(data)
      } catch (error) {
        console.error("Error checking auth:", error)
        setAuthStatus({
          authenticated: false,
          message: "Error checking authentication",
        })
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        <h1 className="text-2xl font-bold mb-6 text-center">Authentication Test</h1>

        {loading ? (
          <p className="text-center">Checking authentication...</p>
        ) : (
          <div className="space-y-4">
            <div className={`p-4 rounded-md ${authStatus?.authenticated ? "bg-green-100" : "bg-red-100"}`}>
              <p className="font-bold">Status: {authStatus?.authenticated ? "Authenticated" : "Not Authenticated"}</p>
              <p>{authStatus?.message}</p>
            </div>

            {authStatus?.authenticated && authStatus.user && (
              <div className="border p-4 rounded-md">
                <h2 className="font-bold mb-2">User Information:</h2>
                <pre className="bg-gray-100 p-2 rounded overflow-auto">{JSON.stringify(authStatus.user, null, 2)}</pre>
              </div>
            )}

            <div className="flex justify-between">
              <button onClick={() => (window.location.href = "/login")} className="px-4 py-2 bg-gray-200 rounded-md">
                Go to Login
              </button>
              <button
                onClick={() => (window.location.href = "/dashboard")}
                className="px-4 py-2 bg-blue-500 text-white rounded-md"
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

