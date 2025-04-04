"use client"

import type React from "react"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { BarChart3, Cylinder, FileText, Home, Package, Settings, Truck, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {}

export default function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname()
  const [user, setUser] = useState<{ role: string } | null>(null)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch("/api/auth/me")
        if (response.ok) {
          const data = await response.json()
          setUser(data.user)
        }
      } catch (error) {
        console.error("Error fetching user:", error)
      }
    }

    fetchUser()
  }, [])

  return (
    <div className={cn("pb-12 hidden md:block", className)}>
      <div className="space-y-4 py-4">
        <div className="px-4 py-2">
          <Link href="/dashboard">
            <h2 className="mb-2 px-2 text-xl font-semibold tracking-tight">Kalisimbi Gas</h2>
          </Link>
          <div className="space-y-1">
            <Link href="/dashboard">
              <Button
                variant={pathname === "/dashboard" ? "default" : "ghost"}
                size="sm"
                className="w-full justify-start"
              >
                <Home className="mr-2 h-4 w-4" />
                Dashboard
              </Button>
            </Link>
            <Link href="/inventory">
              <Button
                variant={pathname.startsWith("/inventory") ? "default" : "ghost"}
                size="sm"
                className="w-full justify-start"
              >
                <Package className="mr-2 h-4 w-4" />
                Inventory
              </Button>
            </Link>
            <Link href="/cylinders">
              <Button
                variant={pathname.startsWith("/cylinders") ? "default" : "ghost"}
                size="sm"
                className="w-full justify-start"
              >
                <Cylinder className="mr-2 h-4 w-4" />
                Cylinders
              </Button>
            </Link>
            <Link href="/supplies">
              <Button
                variant={pathname.startsWith("/supplies") ? "default" : "ghost"}
                size="sm"
                className="w-full justify-start"
              >
                <Truck className="mr-2 h-4 w-4" />
                Supplies
              </Button>
            </Link>
            <Link href="/invoices">
              <Button
                variant={pathname.startsWith("/invoices") ? "default" : "ghost"}
                size="sm"
                className="w-full justify-start"
              >
                <FileText className="mr-2 h-4 w-4" />
                Invoices
              </Button>
            </Link>
            <Link href="/reports">
              <Button
                variant={pathname.startsWith("/reports") ? "default" : "ghost"}
                size="sm"
                className="w-full justify-start"
              >
                <BarChart3 className="mr-2 h-4 w-4" />
                Reports
              </Button>
            </Link>
            {user?.role === "admin" && (
              <Link href="/users">
                <Button
                  variant={pathname.startsWith("/users") ? "default" : "ghost"}
                  size="sm"
                  className="w-full justify-start"
                >
                  <Users className="mr-2 h-4 w-4" />
                  Users
                </Button>
              </Link>
            )}
            <Link href="/settings">
              <Button
                variant={pathname.startsWith("/settings") ? "default" : "ghost"}
                size="sm"
                className="w-full justify-start"
              >
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

