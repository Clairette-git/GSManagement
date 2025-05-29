"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function DebugLoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [debugInfo, setDebugInfo] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const debugLogin = async () => {
    setLoading(true)
    try {
      // First check what's in the database
      const dbResponse = await fetch(`/api/debug/user-check?email=${email}`)
      const dbData = await dbResponse.json()

      // Then try the actual login
      const loginResponse = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })
      const loginData = await loginResponse.json()

      setDebugInfo({
        databaseUser: dbData,
        loginResponse: loginData,
        timestamp: new Date().toISOString(),
      })
    } catch (error) {
      setDebugInfo({
        error: error instanceof Error ? error.message : String(error),
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Debug Login Issue</h1>

      <div className="space-y-4 mb-6">
        <Input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <Input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <Button onClick={debugLogin} disabled={loading}>
          {loading ? "Debugging..." : "Debug Login"}
        </Button>
      </div>

      {debugInfo && (
        <div className="bg-gray-100 p-4 rounded">
          <h3 className="font-bold mb-2">Debug Information:</h3>
          <pre className="text-sm overflow-auto">{JSON.stringify(debugInfo, null, 2)}</pre>
        </div>
      )}
    </div>
  )
}
