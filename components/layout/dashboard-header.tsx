"use client"

import { useState } from "react"
import { Bell, Menu, Search, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function DashboardHeader() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <header className="bg-teal-700 border-b border-teal-600">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <div className="flex-shrink-0 md:hidden">
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-teal-600"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                <Menu className="h-6 w-6" />
              </Button>
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-teal-300" aria-hidden="true" />
                  </div>
                  <input
                    type="text"
                    name="search"
                    id="search"
                    className="block w-full pl-10 pr-3 py-2 border border-teal-600 rounded-md leading-5 bg-teal-800 text-teal-100 placeholder-teal-400 focus:outline-none focus:bg-teal-900 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    placeholder="Search"
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="hidden md:block">
            <div className="ml-4 flex items-center md:ml-6">
              <Button variant="ghost" size="icon" className="text-white hover:bg-teal-600">
                <Bell className="h-6 w-6" />
              </Button>

              <div className="ml-3 relative">
                <Link href="/profile">
                  <div className="flex items-center max-w-xs bg-teal-800 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-teal-800 focus:ring-white p-1">
                    <span className="sr-only">Open user menu</span>
                    <User className="h-6 w-6 rounded-full text-teal-200" />
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu, show/hide based on menu state */}
      {isMobileMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-teal-700">
            <Link
              href="/dashboard"
              className="text-white hover:bg-teal-600 block px-3 py-2 rounded-md text-base font-medium"
            >
              Dashboard
            </Link>
            <Link
              href="/inventory"
              className="text-teal-100 hover:bg-teal-600 hover:text-white block px-3 py-2 rounded-md text-base font-medium"
            >
              Inventory
            </Link>
            <Link
              href="/cylinders"
              className="text-teal-100 hover:bg-teal-600 hover:text-white block px-3 py-2 rounded-md text-base font-medium"
            >
              Cylinders
            </Link>
            <Link
              href="/supplies"
              className="text-teal-100 hover:bg-teal-600 hover:text-white block px-3 py-2 rounded-md text-base font-medium"
            >
              Supplies
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
