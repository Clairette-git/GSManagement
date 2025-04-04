import type { Metadata } from "next"
import DashboardStats from "@/components/dashboard/dashboard-stats"
import RecentSupplies from "@/components/dashboard/recent-supplies"
import InventorySummary from "@/components/dashboard/inventory-summary"
import { GasTypeChart } from "@/components/dashboard/gas-type-chart"

export const metadata: Metadata = {
  title: "Dashboard | Gas Management System",
  description: "Overview of gas supply and inventory",
}

export default async function DashboardPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <DashboardStats />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <GasTypeChart className="lg:col-span-4" />
        <InventorySummary className="lg:col-span-3" />
      </div>
      <div className="grid gap-4 md:grid-cols-1">
        <RecentSupplies />
      </div>
    </div>
  )
}

