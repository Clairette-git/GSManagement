"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

interface User {
  id: number
  username: string
  email: string
  role: "admin" | "storekeeper" | "filler" | "technician"
}

interface RoleAccessControlProps {
  children: React.ReactNode
  allowedRoles?: ("admin" | "storekeeper" | "filler" | "technician")[]
  fallbackPath?: string
}

export default function RoleAccessControl({
  children,
  allowedRoles = [],
  fallbackPath = "/dashboard",
}: RoleAccessControlProps) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [hasAccess, setHasAccess] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const checkUserAccess = async () => {
      console.log("🔍 RoleAccessControl: Starting access check")
      console.log("🔍 Allowed roles:", allowedRoles)

      try {
        let userData: User | null = null

        // First try to get user from API
        try {
          const response = await fetch("/api/auth/me", {
            method: "GET",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
          })

          console.log("🔍 API response status:", response.status)

          if (response.ok) {
            const data = await response.json()
            console.log("🔍 API response data:", data)
            if (data && data.user) {
              userData = data.user
              console.log("🔍 User from API:", userData)
            }
          }
        } catch (apiError) {
          console.log("🔍 API call failed:", apiError)
        }

        // Fallback to localStorage if API failed
        if (!userData) {
          const userStr = localStorage.getItem("user")
          console.log("🔍 LocalStorage user string:", userStr)

          if (userStr) {
            try {
              userData = JSON.parse(userStr)
              console.log("🔍 User from localStorage:", userData)
            } catch (parseError) {
              console.error("🔍 Error parsing localStorage user:", parseError)
            }
          }
        }

        if (!userData) {
          console.log("🔍 No user found, redirecting to login")
          router.push("/login")
          return
        }

        setUser(userData)

        // Check role access
        if (allowedRoles && allowedRoles.length > 0) {
          const hasRoleAccess = allowedRoles.includes(userData.role)
          console.log("🔍 User role:", userData.role)
          console.log("🔍 Has role access:", hasRoleAccess)

          if (!hasRoleAccess) {
            console.log("🔍 Access denied, redirecting to:", fallbackPath)
            router.push(fallbackPath)
            return
          }
        }

        console.log("🔍 Access granted!")
        setHasAccess(true)
      } catch (error) {
        console.error("🔍 Error in access check:", error)
        router.push("/login")
      } finally {
        setLoading(false)
      }
    }

    checkUserAccess()
  }, [allowedRoles, fallbackPath, router])

  if (loading) {
    console.log("🔍 RoleAccessControl: Loading...")
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-teal-600"></div>
      </div>
    )
  }

  if (!user) {
    console.log("🔍 RoleAccessControl: No user, returning null")
    return null
  }

  if (!hasAccess) {
    console.log("🔍 RoleAccessControl: No access, returning null")
    return null
  }

  console.log("🔍 RoleAccessControl: Rendering children")
  return <>{children}</>
}

// Hook to get current user
export function useCurrentUser() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        let userData: User | null = null

        // First try API
        try {
          const response = await fetch("/api/auth/me", {
            method: "GET",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
          })

          if (response.ok) {
            const data = await response.json()
            if (data && data.user) {
              userData = data.user
            }
          }
        } catch (apiError) {
          console.log("useCurrentUser API error:", apiError)
        }

        // Fallback to localStorage
        if (!userData) {
          const userStr = localStorage.getItem("user")
          if (userStr) {
            try {
              userData = JSON.parse(userStr)
            } catch (parseError) {
              console.error("useCurrentUser parse error:", parseError)
            }
          }
        }

        setUser(userData)
      } catch (error) {
        console.error("useCurrentUser error:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [])

  return { user, loading }
}
