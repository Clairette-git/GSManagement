"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"

// Role-based access paths
const roleBasedPaths = {
  admin: ["/dashboard", "/inventory", "/cylinders", "/supplies", "/users", "/settings", "/reports", "/invoices"],
  storekeeper: ["/dashboard", "/inventory", "/cylinders", "/supplies"],
  technician: ["/supplies"],
}

export default function RoleAccessControl({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

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

          // Check if user has access to the current path
          const basePath = `/${pathname.split("/")[1]}`

          if (data.user.role && data.user.role !== "admin") {
            const allowedPaths = roleBasedPaths[data.user.role as keyof typeof roleBasedPaths] || []

            // Check if the user has access to this path
            if (!allowedPaths.some((path) => basePath === path)) {
              console.log(`User with role ${data.user.role} does not have access to ${basePath}`)

              // Redirect to the first allowed path for their role
              if (allowedPaths.length > 0) {
                router.push(allowedPaths[0])
              } else {
                router.push("/login")
              }
            }
          }
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
  }, [router, pathname])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-12 w-12 bg-blue-600 rounded-full mb-4"></div>
          <div className="h-4 w-32 bg-gray-300 rounded mb-2"></div>
          <div className="h-3 w-24 bg-gray-300 rounded"></div>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null // Will redirect in the useEffect
  }

  return <>{children}</>
}
