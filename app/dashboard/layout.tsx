"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Sidebar from "@/components/layout/sidebar"
import DashboardHeader from "@/components/layout/dashboard-header"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem("auth_token")

    if (!token) {
      console.log("No token found, redirecting to login")
      router.push("/login")
      return
    }

    // Verify token with the server
    const verifyToken = async () => {
      try {
        const response = await fetch("/api/test-auth", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        const data = await response.json()

        if (data.authenticated) {
          setIsAuthenticated(true)
        } else {
          console.log("Token invalid, redirecting to login")
          router.push("/login")
        }
      } catch (error) {
        console.error("Error verifying token:", error)
        router.push("/login")
      } finally {
        setIsLoading(false)
      }
    }

    verifyToken()
  }, [router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-12 w-12 bg-blue-500 rounded-full mb-4"></div>
          <div className="h-4 w-32 bg-gray-700 rounded mb-2"></div>
          <div className="h-3 w-24 bg-gray-700 rounded"></div>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null // Will redirect in the useEffect
  }

  return (
    <div className="flex min-h-screen bg-gray-900 text-white">
      <Sidebar className="border-r border-gray-800" />
      <div className="flex flex-col flex-1">
        <DashboardHeader />
        <main className="flex-1 p-4 md:p-6 overflow-auto">{children}</main>
      </div>
    </div>
  )
}
