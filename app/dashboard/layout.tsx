"use client"

import type React from "react"

import { useEffect, useState } from "react"
import Sidebar from "@/components/layout/sidebar"
import Header from "@/components/layout/header"
import { useRouter } from "next/navigation"

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
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg">Loading...</p>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null // Will redirect in the useEffect
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex flex-col flex-1">
        <Header />
        <main className="flex-1">{children}</main>
      </div>
    </div>
  )
}

