import type React from "react"
import type { Metadata } from "next"
import Sidebar from "@/components/layout/sidebar"
import Header from "@/components/layout/header"

export const metadata: Metadata = {
  title: "Gas Management System",
  description: "Medical gas supply and inventory management system",
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex flex-col flex-1">
        <Header />
        <main className="flex-1">{children}</main>
      </div>
    </div>
  )
}

