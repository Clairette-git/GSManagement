"use client"

import type React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  BarChart3,
  Cylinder,
  FileText,
  Home,
  Package,
  Settings,
  Truck,
  Users,
  Calendar,
  Clock,
  LogOut,
  ChevronRight,
  MessageSquare,
  Bell,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {}

export default function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname()
  const [user, setUser] = useState<{ username?: string; role?: string } | null>(null)
  const [collapsed, setCollapsed] = useState(false)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        // Try to get user from API
        const response = await fetch("/api/auth/me")
        if (response.ok) {
          const data = await response.json()
          setUser(data.user)
        } else {
          // Fallback to localStorage
          const userStr = localStorage.getItem("user")
          if (userStr) {
            try {
              const userData = JSON.parse(userStr)
              setUser(userData)
            } catch (error) {
              console.error("Error parsing user data:", error)
            }
          }
        }
      } catch (error) {
        console.error("Error fetching user:", error)

        // Fallback to localStorage
        const userStr = localStorage.getItem("user")
        if (userStr) {
          try {
            const userData = JSON.parse(userStr)
            setUser(userData)
          } catch (error) {
            console.error("Error parsing user data:", error)
          }
        }
      }
    }

    fetchUser()
  }, [])

  const handleLogout = async () => {
    try {
      // Clear localStorage
      localStorage.removeItem("auth_token")
      localStorage.removeItem("user")

      // Call logout API
      await fetch("/api/auth/logout", {
        method: "POST",
      })

      // Redirect to login
      window.location.href = "/login"
    } catch (error) {
      console.error("Logout error:", error)
      // Force redirect even if API fails
      window.location.href = "/login"
    }
  }

  // Determine which menu items to show based on user role
  const showInventoryMenu = user?.role !== "technician"
  const showCylindersMenu = user?.role !== "technician"
  const showReportsMenu = user?.role === "admin"
  const showPlanningMenu = user?.role === "admin"
  const showAdminMenu = user?.role === "admin"

  return (
    <div
      className={cn(
        "flex flex-col bg-[#1a1f36] border-r border-[#2a2f45] transition-all duration-300 ease-in-out",
        collapsed ? "w-20" : "w-64",
        className,
      )}
    >
      {/* Logo and collapse button */}
      <div className="flex items-center justify-between p-4 border-b border-[#2a2f45]">
        <div className="flex items-center gap-2">
          <div className="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-md flex items-center justify-center">
            <span className="text-white font-bold">K</span>
          </div>
          {!collapsed && <span className="font-semibold text-white">Kalisimbi Gas</span>}
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="text-gray-400 hover:text-white hover:bg-[#2a2f45]"
          onClick={() => setCollapsed(!collapsed)}
        >
          <ChevronRight className={`h-5 w-5 transition-transform ${collapsed ? "rotate-180" : ""}`} />
        </Button>
      </div>

      {/* Navigation */}
      <div className="flex-1 py-4 px-3 space-y-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-800">
        <div className="mb-6">
          {!collapsed && <h3 className="text-xs font-semibold text-gray-500 uppercase px-3 mb-2">Main</h3>}

          {user?.role !== "technician" && (
            <NavItem
              href="/dashboard"
              icon={Home}
              label="Dashboard"
              isActive={pathname === "/dashboard"}
              collapsed={collapsed}
              notifications={0}
            />
          )}

          {showInventoryMenu && (
            <NavItem
              href="/inventory"
              icon={Package}
              label="Inventory"
              isActive={pathname.startsWith("/inventory")}
              collapsed={collapsed}
              notifications={0}
            />
          )}

          {showCylindersMenu && (
            <NavItem
              href="/cylinders"
              icon={Cylinder}
              label="Cylinders"
              isActive={pathname.startsWith("/cylinders")}
              collapsed={collapsed}
              notifications={0}
            />
          )}

          <NavItem
            href="/supplies"
            icon={Truck}
            label="Supplies"
            isActive={pathname.startsWith("/supplies")}
            collapsed={collapsed}
            notifications={3}
          />
        </div>

        {showReportsMenu && (
          <div className="mb-6">
            {!collapsed && <h3 className="text-xs font-semibold text-gray-500 uppercase px-3 mb-2">Reports</h3>}
            <NavItem
              href="/invoices"
              icon={FileText}
              label="Invoices"
              isActive={pathname.startsWith("/invoices")}
              collapsed={collapsed}
              notifications={0}
            />
            <NavItem
              href="/reports"
              icon={BarChart3}
              label="Analytics"
              isActive={pathname.startsWith("/reports")}
              collapsed={collapsed}
              notifications={0}
            />
          </div>
        )}

        {showPlanningMenu && (
          <div className="mb-6">
            {!collapsed && <h3 className="text-xs font-semibold text-gray-500 uppercase px-3 mb-2">Planning</h3>}
            <NavItem
              href="/calendar"
              icon={Calendar}
              label="Calendar"
              isActive={pathname.startsWith("/calendar")}
              collapsed={collapsed}
              notifications={0}
            />
            <NavItem
              href="/activity"
              icon={Clock}
              label="Activity"
              isActive={pathname.startsWith("/activity")}
              collapsed={collapsed}
              notifications={0}
            />
            <NavItem
              href="/messages"
              icon={MessageSquare}
              label="Messages"
              isActive={pathname.startsWith("/messages")}
              collapsed={collapsed}
              notifications={5}
            />
            <NavItem
              href="/notifications"
              icon={Bell}
              label="Notifications"
              isActive={pathname.startsWith("/notifications")}
              collapsed={collapsed}
              notifications={2}
            />
          </div>
        )}

        {showAdminMenu && (
          <div className="mb-6">
            {!collapsed && <h3 className="text-xs font-semibold text-gray-500 uppercase px-3 mb-2">Admin</h3>}
            <NavItem
              href="/users"
              icon={Users}
              label="Users"
              isActive={pathname.startsWith("/users")}
              collapsed={collapsed}
              notifications={0}
            />
            <NavItem
              href="/settings"
              icon={Settings}
              label="Settings"
              isActive={pathname.startsWith("/settings")}
              collapsed={collapsed}
              notifications={0}
            />
          </div>
        )}
      </div>

      {/* User profile */}
      <div className="p-4 border-t border-[#2a2f45] mt-auto">
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
            <span className="text-white font-medium text-sm">
              {user?.username ? user.username.charAt(0).toUpperCase() : "U"}
            </span>
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user?.username || "User"}</p>
              <p className="text-xs text-gray-400 capitalize">{user?.role || "User"}</p>
            </div>
          )}
          {!collapsed && (
            <Button
              variant="ghost"
              size="icon"
              className="text-gray-400 hover:text-white hover:bg-[#2a2f45]"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

interface NavItemProps {
  href: string
  icon: React.ElementType
  label: string
  isActive: boolean
  collapsed: boolean
  notifications: number
}

function NavItem({ href, icon: Icon, label, isActive, collapsed, notifications }: NavItemProps) {
  return (
    <Link href={href} className="block">
      <div
        className={cn(
          "flex items-center h-10 px-3 rounded-lg transition-all duration-200 group relative",
          isActive ? "bg-blue-600 text-white" : "text-gray-400 hover:text-white hover:bg-[#2a2f45]",
        )}
      >
        <Icon className="h-5 w-5 flex-shrink-0" />

        {!collapsed && <span className="ml-3 text-sm font-medium">{label}</span>}

        {notifications > 0 && (
          <div
            className={cn(
              "flex items-center justify-center rounded-full bg-red-500 text-white text-xs font-medium",
              collapsed ? "absolute top-1 right-1 w-4 h-4" : "ml-auto w-5 h-5",
            )}
          >
            {notifications}
          </div>
        )}
      </div>
    </Link>
  )
}
