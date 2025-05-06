"use client"

import type React from "react"
import Sidebar from "@/components/layout/sidebar"
import DashboardHeader from "@/components/layout/dashboard-header"
import RoleAccessControl from "@/components/auth/role-access-control"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <RoleAccessControl>
      <div className="flex min-h-screen bg-teal-100">
        <Sidebar />
        <div className="flex flex-col flex-1">
          <DashboardHeader />
          <main className="flex-1 overflow-auto">{children}</main>
        </div>
      </div>
    </RoleAccessControl>
  )
}