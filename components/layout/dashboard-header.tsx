"use client"

import { useState, useEffect } from "react"
import { Search, User, Settings, Menu, ChevronDown, LogOut } from 'lucide-react'
import { Button } from "@/components/ui/button"
import {
DropdownMenu,
DropdownMenuContent,
DropdownMenuItem,
DropdownMenuLabel,
DropdownMenuSeparator,
DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { useCurrentUser } from "@/components/auth/role-access-control"

export default function DashboardHeader() {
const { user, loading } = useCurrentUser()
const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

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

// Role-based mobile menu items
const getMobileMenuItems = (userRole: string) => {
  const baseItems = [
    { name: "Dashboard", href: "/dashboard", roles: ["admin", "storekeeper"] },
    { name: "Inventory", href: "/inventory", roles: ["admin", "storekeeper"] },
    { name: "Cylinders", href: "/cylinders", roles: ["admin", "storekeeper", "filler"] },
    { name: "Assign Cylinders", href: "/cylinders/assign", roles: ["admin", "storekeeper"] },
    { name: "Supplies", href: "/supplies", roles: ["admin", "storekeeper"] },
    { name: "Supply Form", href: "/supplies/add", roles: ["technician"] },
    { name: "Invoices", href: "/invoices", roles: ["admin", "storekeeper"] },
    { name: "Reports", href: "/reports", roles: ["admin"] },
  ]
  
  return baseItems.filter(item => item.roles.includes(userRole as any))
}

if (loading) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-gray-200 bg-teal-600 px-4 md:px-6">
      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
    </header>
  )
}

return (
  <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-gray-200 bg-teal-600 px-4 md:px-6">
    <div className="flex items-center">
      <Link href="/dashboard" className="flex items-center mr-4">
        <span className="text-lg font-semibold text-white">GasTrack</span>
      </Link>

      <Button
        variant="ghost"
        size="icon"
        className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 md:hidden"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      >
        <Menu className="h-5 w-5" />
      </Button>
    </div>

    <div className="flex-1 max-w-md hidden md:block ml-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          type="search"
          placeholder="Search..."
          className="pl-9 pr-4 py-2 h-10 w-full text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
    </div>

    <div className="flex items-center gap-4">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="flex items-center gap-2 h-9 px-3 text-gray-700 hover:bg-teal-700"
          >
            <div className="w-7 h-7 rounded-full bg-teal-600 flex items-center justify-center">
              <span className="text-white font-medium text-sm">
                {user?.username ? user.username.charAt(0).toUpperCase() : "U"}
              </span>
            </div>
            <div className="hidden md:block text-left">
              <p className="text-sm text-white font-medium">{user?.username || "User"}</p>
              <p className="text-xs text-white capitalize">{user?.role || "User"}</p>
            </div>
            <ChevronDown className="h-4 w-4 text-gray-400 hidden md:block" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56 bg-teal-600 border-gray-200">
          <DropdownMenuLabel>
            <div>
              <p className="font-medium">{user?.username || "User"}</p>
              <p className="text-xs text-teal-500 capitalize">{user?.role || "User"}</p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator className="" />
          <DropdownMenuItem onClick={handleLogout} className="hover:bg-teal-500 cursor-pointer text-teal-300">
            <LogOut className="mr-2 h-4 w-4 text-teal-300" />
            <span>Logout</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>

    {/* Mobile menu with role-based items */}
    {isMobileMenuOpen && user && (
      <div className="md:hidden absolute top-16 left-0 right-0  border-b border-gray-200 shadow-lg z-50">
        <div className="px-2 pt-2 pb-3 space-y-1">
          {getMobileMenuItems(user.role).map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-900 hover:bg-gray-100"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {item.name}
            </Link>
          ))}
        </div>
      </div>
    )}
  </header>
)
}