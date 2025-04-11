import type { Metadata } from "next"
import DashboardStats from "@/components/dashboard/dashboard-stats"
import RecentSupplies from "@/components/dashboard/recent-supplies"
import InventorySummary from "@/components/dashboard/inventory-summary"
import { GasTypeChart } from "@/components/dashboard/gas-type-chart"
import { TasksList } from "@/components/dashboard/tasks-list"
import { CompletionChart } from "@/components/dashboard/completion-chart"
import { OptimizeWorkflow } from "@/components/dashboard/optimize-workflow"

export const metadata: Metadata = {
  title: "Dashboard | Gas Management System",
  description: "Overview of gas supply and inventory",
}

export default async function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Welcome back!</h2>
          <p className="text-gray-400 mt-1">Monitor your gas supply and inventory at a glance</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <DashboardStats />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <GasTypeChart className="lg:col-span-2" />
        <InventorySummary />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <TasksList />
        <CompletionChart />
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <OptimizeWorkflow className="md:col-span-1" />
        <RecentSupplies className="md:col-span-2" />
      </div>
    </div>
  )
}
