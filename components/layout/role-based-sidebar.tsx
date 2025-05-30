"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Home,
  Package,
  Cylinder,
  TruckIcon,
  FileText,
  BarChart3,
  Settings,
  LogOut,
  Users,
  ClipboardList,
} from "lucide-react"
import { useCurrentUser } from "@/components/auth/role-access-control"

interface NavItem {
  name: string
  href: string
  icon: any
  roles: ("admin" | "storekeeper" | "filler" | "technician")[]
}

const navItems: NavItem[] = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: Home,
    roles: ["admin", "storekeeper"],
  },
  {
    name: "Inventory",
    href: "/inventory",
    icon: Package,
    roles: ["admin", "storekeeper"],
  },
  {
    name: "Cylinders",
    href: "/cylinders",
    icon: Cylinder,
    roles: ["admin", "storekeeper", "filler"],
  },
  {
    name: "Assign Cylinders",
    href: "/cylinders/assign",
    icon: TruckIcon,
    roles: ["admin", "storekeeper"],
  },
  {
    name: "Supplies",
    href: "/supplies",
    icon: TruckIcon,
    roles: ["admin", "storekeeper"],
  },
  {
    name: "Supply Form",
    href: "/supplies/add",
    icon: ClipboardList,
    roles: ["technician"],
  },
  {
    name: "Invoices",
    href: "/invoices",
    icon: FileText,
    roles: ["admin", "storekeeper"],
  },
  {
    name: "Reports",
    href: "/reports",
    icon: BarChart3,
    roles: ["admin", "storekeeper"],
  },
  {
    name: "User Management",
    href: "/users",
    icon: Users,
    roles: ["admin"],
  },
]

export default function RoleBasedSidebar() {
  const pathname = usePathname()
  const { user, loading } = useCurrentUser()

  const isActive = (path: string) => {
    if (!pathname) return false
    return pathname === path || pathname.startsWith(`${path}/`)
  }

  if (loading) {
    return (
      <div className="h-full w-64 bg-teal-700 text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  // Filter nav items based on user role
  const allowedNavItems = navItems.filter((item) => item.roles.includes(user.role))

  return (
    <div className="h-full w-64 bg-teal-700 text-white flex flex-col">
      <div className="p-4 border-b border-teal-600">
        <h2 className="text-xl font-bold">Gas Management</h2>
        <p className="text-sm text-teal-200 capitalize">
          {user.role} - {user.username}
        </p>
      </div>

      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {allowedNavItems.map((item) => {
            const Icon = item.icon
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                    isActive(item.href) ? "bg-teal-600 text-white" : "text-teal-100 hover:bg-teal-600/50"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.name}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      <div className="p-4 border-t border-teal-600">
        <ul className="space-y-2">
          {user.role === "admin" && (
            <li>
              
            </li>
          )}
          <li>
            <Link
              href="/api/auth/logout"
              className="flex items-center gap-3 px-3 py-2 rounded-md text-teal-100 hover:bg-teal-600/50 transition-colors"
            >
              <LogOut className="h-5 w-5" />
              <span>Logout</span>
            </Link>
          </li>
        </ul>
      </div>
    </div>
  )
}
