"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { format, startOfWeek, startOfMonth, startOfYear } from "date-fns"
import { Loader2, TrendingUp, TrendingDown, ExternalLink } from "lucide-react"

interface MetricCardProps {
  title: string
  value: string | number
  description: string
  icon: string
  color: string
  trend?: number
  endpoint: string
  detailsColumns: { key: string; label: string }[]
  valueFormatter?: (value: any) => string
  dateField?: string
  period: string
}

const iconMap: Record<string, React.ElementType> = {
  package: () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m7.5 4.27 9 5.15" />
      <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
      <path d="m3.3 7 8.7 5 8.7-5" />
      <path d="M12 22V12" />
    </svg>
  ),
  truck: () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M10 17h4V5H2v12h3" />
      <path d="M20 17h2v-3.34a4 4 0 0 0-1.17-2.83L19 9h-5v8h1" />
      <circle cx="7.5" cy="17.5" r="2.5" />
      <circle cx="17.5" cy="17.5" r="2.5" />
    </svg>
  ),
  "rotate-ccw": () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
    </svg>
  ),
  building: () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="16" height="20" x="4" y="2" rx="2" ry="2" />
      <path d="M9 22v-4h6v4" />
      <path d="M8 6h.01" />
      <path d="M16 6h.01" />
      <path d="M12 6h.01" />
      <path d="M12 10h.01" />
      <path d="M12 14h.01" />
      <path d="M16 10h.01" />
      <path d="M16 14h.01" />
      <path d="M8 10h.01" />
      <path d="M8 14h.01" />
    </svg>
  ),
  wallet: () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
      <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
      <path d="M18 12a2 2 0 0 0 0 4h4v-4Z" />
    </svg>
  ),
  "file-text": () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" x2="8" y1="13" y2="13" />
      <line x1="16" x2="8" y1="17" y2="17" />
      <line x1="10" x2="8" y1="9" y2="9" />
    </svg>
  ),
}

const colorMap: Record<string, string> = {
  blue: "text-blue-400",
  emerald: "text-emerald-400",
  amber: "text-amber-400",
  purple: "text-purple-400",
  indigo: "text-indigo-400",
}

export function EnhancedMetricCard({
  title,
  value,
  description,
  icon,
  color,
  trend,
  endpoint,
  detailsColumns,
  valueFormatter,
  dateField = "created_at",
  period,
}: MetricCardProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [data, setData] = useState<any[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isHovered, setIsHovered] = useState(false)

  const IconComponent = iconMap[icon] || iconMap.package

  const fetchData = async (currentPeriod: string) => {
    setIsLoading(true)
    setError(null)

    try {
      const today = new Date()
      let startDate: Date

      switch (currentPeriod) {
        case "week":
          startDate = startOfWeek(today)
          break
        case "month":
          startDate = startOfMonth(today)
          break
        case "year":
          startDate = startOfYear(today)
          break
        case "day":
        default:
          startDate = new Date(today)
          startDate.setHours(0, 0, 0, 0)
          break
      }

      const formattedStartDate = format(startDate, "yyyy-MM-dd")
      const formattedEndDate = format(today, "yyyy-MM-dd")
      const limit = typeof value === "number" ? value : Number.parseInt(value.toString().replace(/[^0-9]/g, "")) || 10

      const url = `${endpoint}?period=${currentPeriod}&startDate=${formattedStartDate}&endDate=${formattedEndDate}&limit=${limit}`
      console.log(`🔄 Fetching data from: ${url}`)

      const response = await fetch(url)
      console.log(`📡 Response status: ${response.status}`)

      if (!response.ok) {
        const errorText = await response.text()
        console.error(`❌ API Error: ${response.status} - ${errorText}`)
        throw new Error(`API error: ${response.status} - ${errorText}`)
      }

      const result = await response.json()
      console.log("✅ API response:", result)

      if (result.success && Array.isArray(result.data)) {
        setData(result.data)
        console.log(`📊 Loaded ${result.data.length} records`)
      } else {
        console.warn("⚠️ Unexpected response format:", result)
        setData([])
      }
    } catch (err) {
      console.error("💥 Error fetching data:", err)
      setError(err instanceof Error ? err.message : "Failed to load data")
      setData([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleOpenDialog = () => {
    setIsDialogOpen(true)
    fetchData(period)
  }

  const formatValue = (val: any, column: string) => {
    if (val === null || val === undefined) return "N/A"

    // Format date fields
    if (column === dateField || column.includes("date") || column.includes("time")) {
      try {
        return format(new Date(val), "MMM d, yyyy HH:mm")
      } catch (e) {
        return val.toString()
      }
    }

    // Use custom formatter if provided
    if (valueFormatter) {
      return valueFormatter(val)
    }

    // Default formatting
    if (typeof val === "number") {
      return val.toLocaleString()
    }

    return val.toString()
  }

  return (
    <>
      <Card
        className={`w-full cursor-pointer transition-all duration-200 ${
          isHovered ? "bg-teal-700/20 border-2 border-teal-300 shadow-lg" : "border-2 border-transparent"
        }`}
        onClick={handleOpenDialog}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <CardContent className="p-6">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <p className="text-sm font-medium text-teal-100">{title}</p>
            <div className={`${colorMap[color] || "text-blue-400"}`}>
              <IconComponent />
            </div>
          </div>
          <div className="text-2xl font-bold text-white">{value}</div>
          <div className="flex items-center justify-between text-xs text-teal-100">
            <span>{description}</span>
            <div className="flex items-center gap-2">
              {trend !== undefined && (
                <div className={`flex items-center ${trend > 0 ? "text-emerald-400" : "text-red-400"}`}>
                  {trend > 0 ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                  <span>{Math.abs(trend)}%</span>
                </div>
              )}
              {isHovered && <ExternalLink className="h-3 w-3 text-teal-300" />}
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[800px] bg-white text-black">
          <DialogHeader>
            <DialogTitle className="text-gray-900 text-xl font-semibold">{title} Details</DialogTitle>
            <DialogDescription className="text-gray-600">
              Detailed information for the selected period
            </DialogDescription>
          </DialogHeader>

          <div className="max-h-[500px] overflow-y-auto border rounded-md">
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-teal-500" />
                <span className="ml-2 text-gray-600">Loading data...</span>
              </div>
            ) : error ? (
              <div className="p-4 bg-red-50 border border-red-200 rounded-md text-red-700 m-4">
                <p className="font-medium">Error loading data:</p>
                <p className="text-sm mt-1">{error}</p>
                <button
                  onClick={() => fetchData(period)}
                  className="mt-2 px-3 py-1 bg-red-100 hover:bg-red-200 rounded-md text-sm transition-colors"
                >
                  Try Again
                </button>
              </div>
            ) : data.length === 0 ? (
              <p className="text-center py-8 text-gray-500">No data available for this time period</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    {detailsColumns.map((column) => (
                      <TableHead key={column.key} className="font-semibold text-gray-700">
                        {column.label}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.map((item, index) => (
                    <TableRow key={index} className="hover:bg-gray-50">
                      {detailsColumns.map((column) => (
                        <TableCell key={`${index}-${column.key}`} className="text-gray-900">
                          {formatValue(item[column.key], column.key)}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>

          {data.length > 0 && <div className="text-sm text-gray-500 mt-2">Showing {data.length} records</div>}
        </DialogContent>
      </Dialog>
    </>
  )
}
