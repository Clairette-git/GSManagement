"use client"

import { useEffect, useState } from "react"

export default function TestSimplePage() {
  const [user, setUser] = useState<any>(null)
  const [logs, setLogs] = useState<string[]>([])

  const addLog = (message: string) => {
    console.log(message)
    setLogs((prev) => [...prev, `${new Date().toLocaleTimeString()}: ${message}`])
  }

  useEffect(() => {
    addLog("Page loaded")

    // Check localStorage
    const userStr = localStorage.getItem("user")
    addLog(`LocalStorage user: ${userStr}`)

    if (userStr) {
      try {
        const userData = JSON.parse(userStr)
        setUser(userData)
        addLog(`Parsed user: ${JSON.stringify(userData)}`)
        addLog(`User role: ${userData.role}`)

        // Check if technician role is exactly "technician"
        const allowedRoles = ["admin", "storekeeper", "technician"]
        const hasAccess = allowedRoles.includes(userData.role)
        addLog(`Allowed roles: ${allowedRoles.join(", ")}`)
        addLog(`Has access: ${hasAccess}`)
      } catch (error) {
        addLog(`Error parsing user: ${error}`)
      }
    }
  }, [])

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Simple Test Page</h1>

      <div className="bg-gray-100 p-4 rounded">
        <h2 className="font-bold mb-2">User Info:</h2>
        <pre>{JSON.stringify(user, null, 2)}</pre>
      </div>

      <div className="bg-blue-100 p-4 rounded">
        <h2 className="font-bold mb-2">Debug Logs:</h2>
        {logs.map((log, index) => (
          <div key={index} className="text-sm font-mono">
            {log}
          </div>
        ))}
      </div>

      <div className="bg-green-100 p-4 rounded">
        <h2 className="font-bold mb-2">Role Test:</h2>
        {user && (
          <div>
            <p>Role: "{user.role}"</p>
            <p>Role type: {typeof user.role}</p>
            <p>Role length: {user.role?.length}</p>
            <p>Is technician: {user.role === "technician" ? "YES" : "NO"}</p>
            <p>Includes technician: {["admin", "storekeeper", "technician"].includes(user.role) ? "YES" : "NO"}</p>
          </div>
        )}
      </div>
    </div>
  )
}
