"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { BarChart3, Cylinder, FileText, Package, Settings, Truck, Users, LayoutDashboard } from 'lucide-react'

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Inventory", href: "/inventory", icon: Package },
  { name: "Cylinders", href: "/cylinders", icon: Cylinder },
  { name: "Supplies", href: "/supplies", icon: Truck },
  { name: "Invoices", href: "/invoices", icon: FileText },
  { name: "Reports", href: "/reports", icon: BarChart3 },
  { name: "Users", href: "/users", icon: Users },
  { name: "Settings", href: "/settings", icon: Settings },
]

export default function Sidebar() {
  const pathname = usePathname() || ""

  return (
    <div className="flex min-h-screen h-full flex-col bg-teal-700 border-r border-teal-600 sticky top-0">
      <div className="flex flex-col flex-grow pt-5 pb-4 overflow-y-auto">
        <div className="flex items-center flex-shrink-0 px-4">
          <img className="h-8 w-auto" src="/DPMMK.png" alt="Gas Management" />
          <span className="ml-2 text-xl font-semibold text-white">GasTrack</span>
        </div>
        <nav className="mt-5 flex-1 px-2 space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  isActive ? "bg-teal-800 text-white" : "text-teal-100 hover:bg-teal-600 hover:text-white",
                  "group flex items-center px-2 py-2 text-sm font-medium rounded-md",
                )}
              >
                <item.icon
                  className={cn(
                    isActive ? "text-blue-400" : "text-teal-300 group-hover:text-teal-100",
                    "mr-3 flex-shrink-0 h-5 w-5",
                  )}
                  aria-hidden="true"
                />
                {item.name}
              </Link>
            )
          })}
        </nav>
      </div>
      <div className="flex-shrink-0 flex border-t border-teal-600 p-4">
        <div className="flex items-center">
          <div className="ml-3">
            <p className="text-sm font-medium text-white">Kalisimbi Gas</p>
            <p className="text-xs text-teal-200">© 2025</p>
          </div>
        </div>
      </div>
    </div>
  )
}