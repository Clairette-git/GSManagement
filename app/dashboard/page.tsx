import type { Metadata } from "next"

import RecentSupplies from "@/components/dashboard/recent-supplies"
import {CylinderStatusChart} from "@/components/dashboard/cylinder-status-chart"
import { OptimizeWorkflow } from "@/components/dashboard/optimize-workflow"
import { GasTypeChart } from "@/components/dashboard/gas-type-pie-chart"
import DashboardStats from "@/components/dashboard/dashboard-stats"



export const metadata: Metadata = {
  title: "Dashboard | Gas Management System",
  description: "Overview of gas supply and inventory",
}

export default async function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
      <div className="text-black">
  <h1 className=""> </h1>
  <p></p>
  <p className="text-black font-medium"> 

  </p>
</div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <DashboardStats />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <CylinderStatusChart className="lg:col-span-2" />
        <GasTypeChart />
      </div>


      <div className="grid gap-6 md:grid-cols-3">
        <OptimizeWorkflow className="md:col-span-1" />
        <RecentSupplies className="md:col-span-2" />
      </div>
    </div>
  )
}
