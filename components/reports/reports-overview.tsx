"use client"

import { useState, useEffect } from "react"
import { CylinderStatusChart } from "./cylinder-status-chart"
import { RevenueChart } from "./revenue-chart"
import { TopHospitalsChart } from "./top-hospitals-chart"
import { Button } from "@/components/ui/button"
import { RefreshCw, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { ClickableRevenueCard } from "./clickable-revenue-card"
import { ClickableHospitalsCard } from "./clickable-hospitals-card"
import { ClickableInvoicesCard } from "./clickable-invoices-card"
import { ClickableFilledCard } from "./clickable-filled-card"
import { ClickableDeliveredCard } from "./clickable-delivered-card"
import { ClickableReturnedCard } from "./clickable-returned-card"

export default function ReportsOverview() {
  const [reportData, setReportData] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [period, setPeriod] = useState("week")

  const fetchReportData = async () => {
    try {
      setLoading(true)
      setError(null)

      console.log(`Fetching report data for period: ${period}`)
      const response = await fetch(`/api/reports-cylinders?period=${period}`)

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Failed to fetch: ${response.status} - ${errorText}`)
      }

      const data = await response.json()
      console.log("Report data:", data)

      if (data.success) {
        setReportData(data.data)
      } else {
        throw new Error(data.message || "Failed to load data")
      }
    } catch (error) {
      console.error("❌ Error:", error)
      setError(error instanceof Error ? error.message : "Failed to load data")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReportData()
  }, [period])

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="flex items-center space-x-2">
          <RefreshCw className="h-5 w-5 animate-spin" />
          <span className="text-lg">Loading reports...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <div className="text-red-600 text-lg mb-4">Error loading report data</div>
        <div className="text-gray-600 mb-4">{error}</div>
        <Button onClick={fetchReportData} className="flex items-center space-x-2">
          <RefreshCw className="h-4 w-4" />
          <span>Retry</span>
        </Button>
      </div>
    )
  }

  if (!reportData) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-lg">No data available</div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6 bg-teal-600 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between text-white">
        <div className="flex items-center gap-2">
          <Link href="/dashboard">
            <Button variant="ghost" size="icon" className="h-8 w-8 text-white hover:bg-teal-700">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-white">Reports & Analytics</h1>
            <p className="text-white mt-1">Comprehensive overview of cylinder operations and performance</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex bg-teal-700 rounded-lg p-1 shadow-sm border border-teal-500">
            {["day", "week", "month", "year"].map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  period === p ? "bg-white text-teal-600 shadow-sm" : "text-white hover:text-white hover:bg-teal-800"
                }`}
              >
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </button>
            ))}
          </div>
          <Button
            onClick={fetchReportData}
            variant="outline"
            size="sm"
            className="bg-white text-teal-600 hover:bg-gray-100"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <ClickableFilledCard value={reportData.filled || 0} period={period} />
        <ClickableDeliveredCard value={reportData.delivered || 0} period={period} />
        <ClickableReturnedCard value={reportData.returned || 0} period={period} />
        <ClickableHospitalsCard value={reportData.hospitals || 0} period={period} />
        <ClickableRevenueCard value={reportData.revenue || 0} period={period} />
        <ClickableInvoicesCard value={reportData.invoices || 0} period={period} />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CylinderStatusChart data={reportData.statusDistribution || []} />
        <RevenueChart data={reportData.revenueByDay || []} />
      </div>

      <div className="grid grid-cols-1">
        <TopHospitalsChart data={reportData.topHospitals || []} />
      </div>
    </div>
  )
}
