"use client"

import { useState, useEffect } from "react"
import { Bell, Search, User, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Image from "next/image"

export default function DashboardHeader() {
  const [user, setUser] = useState<{ username: string; role: string } | null>(null)
  const [completionRate, setCompletionRate] = useState<number>(0)

  useEffect(() => {
    // Get user from localStorage
    const userStr = localStorage.getItem("user")
    if (userStr) {
      try {
        const userData = JSON.parse(userStr)
        setUser(userData)
      } catch (error) {
        console.error("Error parsing user data:", error)
      }
    }

    // Simulate loading completion rate
    const randomRate = Math.floor(Math.random() * 30) + 70 // Random between 70-100%
    setCompletionRate(randomRate)
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

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-gray-800 bg-gray-900 px-4 md:px-6">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Image src="/DPMMK.png" alt="Kalisimbi Gas" width={32} height={32} className="rounded-md" />
          <span className="font-semibold text-lg hidden md:inline-block">Kalisimbi Gas</span>
        </div>
      </div>

      <div className="flex-1 mx-8">
        <div className="relative max-w-md mx-auto md:mx-0">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <input
            type="search"
            placeholder="Search..."
            className="w-full bg-gray-800 border border-gray-700 rounded-md py-2 pl-8 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden md:block text-sm">
          <span className="text-gray-400 mr-2">Completion rate:</span>
          <span className="font-medium text-blue-400">{completionRate}%</span>
        </div>

        <Button variant="ghost" size="icon" className="relative text-gray-400 hover:text-white">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-blue-500"></span>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full h-8 w-8 bg-gray-800">
              <User className="h-5 w-5 text-gray-400" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 bg-gray-800 border-gray-700 text-gray-200">
            <DropdownMenuLabel>
              {user ? (
                <div>
                  <p className="font-medium">{user.username}</p>
                  <p className="text-xs text-gray-400 capitalize">{user.role}</p>
                </div>
              ) : (
                "My Account"
              )}
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-gray-700" />
            <DropdownMenuItem className="hover:bg-gray-700 cursor-pointer">
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="hover:bg-gray-700 cursor-pointer">
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-gray-700" />
            <DropdownMenuItem onClick={handleLogout} className="hover:bg-gray-700 cursor-pointer text-red-400">
              <span>Logout</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
