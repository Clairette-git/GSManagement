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
  PlusCircle,
  Calendar,
  Clock,
} from "lucide-react"
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
    <div className={cn("w-16 md:w-64 flex flex-col bg-gray-900", className)}>
      <div className="p-4 flex justify-center md:justify-start">
        <Button variant="outline" size="icon" className="rounded-full bg-blue-600 border-0 hover:bg-blue-700">
          <PlusCircle className="h-5 w-5" />
        </Button>
      </div>

      <div className="flex-1 py-8 flex flex-col gap-1">
        <NavItem href="/dashboard" icon={Home} label="Dashboard" isActive={pathname === "/dashboard"} />
        <NavItem href="/inventory" icon={Package} label="Inventory" isActive={pathname.startsWith("/inventory")} />
        <NavItem href="/cylinders" icon={Cylinder} label="Cylinders" isActive={pathname.startsWith("/cylinders")} />
        <NavItem href="/supplies" icon={Truck} label="Supplies" isActive={pathname.startsWith("/supplies")} />
        <NavItem href="/invoices" icon={FileText} label="Invoices" isActive={pathname.startsWith("/invoices")} />
        <NavItem href="/reports" icon={BarChart3} label="Reports" isActive={pathname.startsWith("/reports")} />
        <NavItem href="/calendar" icon={Calendar} label="Calendar" isActive={pathname.startsWith("/calendar")} />
        <NavItem href="/activity" icon={Clock} label="Activity" isActive={pathname.startsWith("/activity")} />

        {user?.role === "admin" && (
          <NavItem href="/users" icon={Users} label="Users" isActive={pathname.startsWith("/users")} />
        )}

        <div className="mt-auto">
          <NavItem href="/settings" icon={Settings} label="Settings" isActive={pathname.startsWith("/settings")} />
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
}

function NavItem({ href, icon: Icon, label, isActive }: NavItemProps) {
  return (
    <Link href={href} className="block">
      <div
        className={cn(
          "flex items-center h-10 px-3 mx-2 rounded-md transition-colors",
          isActive ? "bg-gray-800 text-white" : "text-gray-400 hover:text-white hover:bg-gray-800",
        )}
      >
        <Icon className="h-5 w-5 min-w-5" />
        <span className="ml-3 text-sm font-medium hidden md:block">{label}</span>
        {isActive && <div className="w-1 h-5 bg-blue-500 rounded-full ml-auto hidden md:block" />}
      </div>
    </Link>
  )
}
