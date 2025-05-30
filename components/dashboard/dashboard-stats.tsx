"use client"

import type React from "react"

import { Card, CardContent } from "@/components/ui/card"
import { useEffect, useState } from "react"
import { CylinderIcon, TruckIcon, RotateCcw, Building, Wallet } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { format } from "date-fns"

// Define the same interface as in the API
interface ReturnedCylinder {
  hospital_name: string
  count: number
}

interface DailyStats {
  filledToday: number
  deliveredToday: number
  returnedToday: number
  suppliesCreated: number
  revenue: number
  hospitalsSupplied: number
  returnedByHospital: ReturnedCylinder[]
}

type ModalType = "filled" | "delivered" | "hospitals" | "revenue" | "returned" | null

export default function DashboardStats() {
  const [stats, setStats] = useState<DailyStats & { isLoading: boolean }>({
    filledToday: 0,
    deliveredToday: 0,
    returnedToday: 0,
    suppliesCreated: 0,
    revenue: 0,
    hospitalsSupplied: 0,
    returnedByHospital: [], // Initialize as empty array
    isLoading: true,
  })
  const [error, setError] = useState<string | null>(null)
  const [activeModal, setActiveModal] = useState<ModalType>(null)
  const [filledCylinders, setFilledCylinders] = useState<any[]>([])
  const [deliveredCylinders, setDeliveredCylinders] = useState<any[]>([])
  const [hospitalSupplies, setHospitalSupplies] = useState<any[]>([])
  const [revenueDetails, setRevenueDetails] = useState<any[]>([])
  const [isLoadingDetails, setIsLoadingDetails] = useState(false)
  const [detailsError, setDetailsError] = useState<string | null>(null)
  const [returnedCylinders, setReturnedCylinders] = useState<any[]>([])

  const today = format(new Date(), "MMMM d, yyyy")

  const fetchStats = async () => {
    try {
      setStats((prev) => ({ ...prev, isLoading: true }))
      setError(null)

      const res = await fetch("/api/dashboard/daily-stats")

      if (!res.ok) {
        throw new Error(`API error: ${res.status}`)
      }

      const data = await res.json()

      // Ensure returnedByHospital is always an array
      const returnedByHospital = Array.isArray(data.returnedByHospital) ? data.returnedByHospital : []

      setStats({
        filledToday: Number(data.filledToday) || 0,
        deliveredToday: Number(data.deliveredToday) || 0,
        returnedToday: Number(data.returnedToday) || 0,
        suppliesCreated: Number(data.suppliesCreated) || 0,
        revenue: Number(data.revenue) || 0,
        hospitalsSupplied: Number(data.hospitalsSupplied) || 0,
        returnedByHospital,
        isLoading: false,
      })
    } catch (err) {
      console.error("Error fetching dashboard stats:", err)
      setError(err instanceof Error ? err.message : "Failed to load dashboard stats")
      setStats((prev) => ({ ...prev, isLoading: false }))
    }
  }

  const fetchCylindersByStatus = async (status: string, skipDateFilter = false) => {
    setIsLoadingDetails(true)
    setDetailsError(null)
    try {
      const url = skipDateFilter
        ? `/api/cylinders?status=${status}&skipDateFilter=true`
        : `/api/cylinders?status=${status}`

      const res = await fetch(url)
      if (!res.ok) {
        const errorText = await res.text()
        console.error(`Error response from cylinders API: ${errorText}`)
        throw new Error(`Failed to fetch ${status} cylinders (Status: ${res.status})`)
      }

      const data = await res.json()

      if (data.status === "error") {
        throw new Error(data.message || `Failed to fetch ${status} cylinders`)
      }

      return data.data || []
    } catch (error) {
      console.error(`Error fetching ${status} cylinders:`, error)
      setDetailsError(error instanceof Error ? error.message : `Failed to fetch ${status} cylinders`)
      return []
    } finally {
      setIsLoadingDetails(false)
    }
  }

  const fetchHospitalSupplies = async () => {
    setIsLoadingDetails(true)
    setDetailsError(null)
    try {
      const todayFormatted = format(new Date(), "yyyy-MM-dd")
      const res = await fetch(`/api/supplies/by-hospital?date=${todayFormatted}`)
      if (!res.ok) {
        const errorText = await res.text()
        console.error(`Error response from supplies API: ${errorText}`)
        throw new Error(`Failed to fetch hospital supplies (Status: ${res.status})`)
      }

      const data = await res.json()

      if (!data.success) {
        throw new Error(data.message || "Failed to fetch hospital supplies")
      }

      return data.data || []
    } catch (error) {
      console.error("Error fetching hospital supplies:", error)
      setDetailsError(error instanceof Error ? error.message : "Failed to fetch hospital supplies")
      return []
    } finally {
      setIsLoadingDetails(false)
    }
  }

  const fetchRevenueDetails = async () => {
    setIsLoadingDetails(true)
    setDetailsError(null)
    try {
      const todayFormatted = format(new Date(), "yyyy-MM-dd")
      const res = await fetch(`/api/supplies/revenue?date=${todayFormatted}`)
      if (!res.ok) {
        const errorText = await res.text()
        console.error(`Error response from revenue API: ${errorText}`)
        throw new Error(`Failed to fetch revenue details (Status: ${res.status})`)
      }

      const data = await res.json()

      if (data.status === "error") {
        throw new Error(data.message || "Failed to fetch revenue details")
      }

      return data.data || []
    } catch (error) {
      console.error("Error fetching revenue details:", error)
      setDetailsError(error instanceof Error ? error.message : "Failed to fetch revenue details")
      return []
    } finally {
      setIsLoadingDetails(false)
    }
  }

  const handleOpenModal = async (type: ModalType) => {
    setActiveModal(type)
    setDetailsError(null)

    try {
      if (type === "filled") {
        // For filled cylinders, don't skip date filtering to show only today's
        const cylinders = await fetchCylindersByStatus("filled", false)
        setFilledCylinders(cylinders)
      } else if (type === "delivered") {
        // For delivered cylinders, don't skip date filtering to show only today's
        const cylinders = await fetchCylindersByStatus("delivered", false)
        setDeliveredCylinders(cylinders)
      } else if (type === "hospitals") {
        const supplies = await fetchHospitalSupplies()
        setHospitalSupplies(supplies)
      } else if (type === "revenue") {
        const details = await fetchRevenueDetails()
        setRevenueDetails(details)
      } else if (type === "returned") {
        // For returned cylinders, don't skip date filtering to show only today's
        const cylinders = await fetchCylindersByStatus("returned", false)
        setReturnedCylinders(cylinders)
      }
    } catch (err) {
      console.error(`Error fetching details for ${type}:`, err)
      setDetailsError(`Failed to load ${type} details`)
    }
  }

  useEffect(() => {
    fetchStats()

    // Set up auto-refresh every minute
    const intervalId = setInterval(fetchStats, 60000)

    return () => clearInterval(intervalId)
  }, [])

  if (stats.isLoading) {
    return (
      <>
        {[1, 2, 3, 4, 5].map((i) => (
          <Card key={i} className="bg-teal-600 border-teal-600 animate-pulse">
            <CardContent className="p-6">
              <div className="h-10 bg-teal-800 text-white rounded-md mb-2"></div>
              <div className="h-6 bg-teal-600 rounded-md w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </>
    )
  }

  return (
    <>
      {error && (
        <div className="col-span-full mb-4 p-4 bg-red-50 border border-red-200 rounded-md text-red-700">
          <p className="font-medium">Error loading dashboard stats</p>
          <p className="text-sm">{error}</p>
          <button
            onClick={fetchStats}
            className="mt-2 px-3 py-1 bg-red-100 hover:bg-red-200 rounded-md text-sm transition-colors"
          >
            Try Again
          </button>
        </div>
      )}

      <StatCard
        title="Cylinders Filled"
        value={stats.filledToday}
        description="Click to see filled cylinders"
        icon={<CylinderIcon className="h-5 w-5" />}
        color="blue"
        onClick={() => handleOpenModal("filled")}
      />
      <StatCard
        title="Cylinders Delivered"
        value={stats.deliveredToday}
        description="Click to see delivered cylinders"
        icon={<TruckIcon className="h-5 w-5" />}
        color="green"
        onClick={() => handleOpenModal("delivered")}
      />
      <StatCard
        title="Hospitals Supplied Today"
        value={stats.hospitalsSupplied}
        description="Click to see hospital details"
        icon={<Building className="h-5 w-5" />}
        color="purple"
        onClick={() => handleOpenModal("hospitals")}
      />
      <StatCard
        title="Revenue Generated Today"
        value={`RWF ${Number(stats.revenue).toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`}
        description="Click to see revenue details"
        icon={<Wallet className="h-5 w-5" />}
        color="amber"
        onClick={() => handleOpenModal("revenue")}
      />
      <StatCard
        title="Cylinders Returned"
        value={stats.returnedToday}
        description="Click to see return locations"
        icon={<RotateCcw className="h-5 w-5" />}
        color="blue"
        onClick={() => handleOpenModal("returned")}
      />

      {/* Filled Cylinders Modal */}
      <Dialog open={activeModal === "filled"} onOpenChange={(open) => !open && setActiveModal(null)}>
        <DialogContent className="sm:max-w-[800px] bg-white text-black">
          <DialogHeader>
            <DialogTitle>Filled Cylinders Today ({stats.filledToday})</DialogTitle>
            <DialogDescription className="text-gray-500">Showing cylinders filled today ({today})</DialogDescription>
          </DialogHeader>

          <div className="max-h-[500px] overflow-y-auto">
            {detailsError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-700">
                <p>{detailsError}</p>
                <button
                  onClick={() => handleOpenModal("filled")}
                  className="mt-2 px-3 py-1 bg-red-100 hover:bg-red-200 rounded-md text-sm transition-colors"
                >
                  Try Again
                </button>
              </div>
            )}

            {isLoadingDetails ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin h-8 w-8 border-2 border-blue-500 border-t-transparent rounded-full"></div>
              </div>
            ) : filledCylinders.length === 0 ? (
              <p className="text-center py-4 text-gray-500">No filled cylinders found for today</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cylinder Code</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead>Gas Type</TableHead>
                    <TableHead>Filling End Time</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filledCylinders.map((cylinder) => (
                    <TableRow key={cylinder.id}>
                      <TableCell className="font-medium">{cylinder.code}</TableCell>
                      <TableCell>{cylinder.size}</TableCell>
                      <TableCell>{cylinder.gas_type || "Unknown"}</TableCell>
                      <TableCell>
                        {cylinder.filling_end_time
                          ? format(new Date(cylinder.filling_end_time), "MMM d, yyyy HH:mm")
                          : "Not recorded"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Delivered Cylinders Modal */}
      <Dialog open={activeModal === "delivered"} onOpenChange={(open) => !open && setActiveModal(null)}>
        <DialogContent className="sm:max-w-[800px] bg-white text-black">
          <DialogHeader>
            <DialogTitle>Delivered Cylinders Today ({stats.deliveredToday})</DialogTitle>
            <DialogDescription className="text-gray-500">Showing cylinders delivered today ({today})</DialogDescription>
          </DialogHeader>

          <div className="max-h-[500px] overflow-y-auto">
            {detailsError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-700">
                <p>{detailsError}</p>
                <button
                  onClick={() => handleOpenModal("delivered")}
                  className="mt-2 px-3 py-1 bg-red-100 hover:bg-red-200 rounded-md text-sm transition-colors"
                >
                  Try Again
                </button>
              </div>
            )}

            {isLoadingDetails ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin h-8 w-8 border-2 border-green-500 border-t-transparent rounded-full"></div>
              </div>
            ) : deliveredCylinders.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-gray-500 mb-2">No cylinders delivered today</p>
                <p className="text-sm text-gray-400">
                  This shows only cylinders that were marked as delivered today, not all delivered cylinders.
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cylinder Code</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead>Gas Type</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {deliveredCylinders.map((cylinder) => (
                    <TableRow key={cylinder.id}>
                      <TableCell className="font-medium">{cylinder.code}</TableCell>
                      <TableCell>{cylinder.size}</TableCell>
                      <TableCell>{cylinder.gas_type || "Unknown"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Hospitals Supplied Modal */}
      <Dialog open={activeModal === "hospitals"} onOpenChange={(open) => !open && setActiveModal(null)}>
        <DialogContent className="sm:max-w-[800px] bg-white text-black">
          <DialogHeader>
            <DialogTitle>Hospitals Supplied Today ({stats.hospitalsSupplied})</DialogTitle>
            <DialogDescription className="text-gray-500">
              Showing all hospitals that received supplies today ({today})
            </DialogDescription>
          </DialogHeader>

          <div className="max-h-[500px] overflow-y-auto">
            {detailsError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-700">
                <p>{detailsError}</p>
                <button
                  onClick={() => handleOpenModal("hospitals")}
                  className="mt-2 px-3 py-1 bg-red-100 hover:bg-red-200 rounded-md text-sm transition-colors"
                >
                  Try Again
                </button>
              </div>
            )}

            {isLoadingDetails ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin h-8 w-8 border-2 border-purple-500 border-t-transparent rounded-full"></div>
              </div>
            ) : hospitalSupplies.length === 0 ? (
              <p className="text-center py-4 text-gray-500">No hospitals supplied today</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Hospital Name</TableHead>
                    <TableHead className="text-right">Cylinders Delivered</TableHead>
                    <TableHead className="text-right">Total Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {hospitalSupplies.map((supply, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{supply.hospital_name}</TableCell>
                      <TableCell className="text-right">{supply.cylinder_count}</TableCell>
                      <TableCell className="text-right">RWF {Number(supply.total_amount).toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Revenue Details Modal */}
      <Dialog open={activeModal === "revenue"} onOpenChange={(open) => !open && setActiveModal(null)}>
        <DialogContent className="sm:max-w-[800px] bg-white text-black">
          <DialogHeader>
            <DialogTitle>Revenue Details for Today</DialogTitle>
            <DialogDescription className="text-gray-500">
              Breakdown of revenue generated today ({today})
            </DialogDescription>
          </DialogHeader>

          <div className="max-h-[500px] overflow-y-auto">
            {detailsError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-700">
                <p>{detailsError}</p>
                <button
                  onClick={() => handleOpenModal("revenue")}
                  className="mt-2 px-3 py-1 bg-red-100 hover:bg-red-200 rounded-md text-sm transition-colors"
                >
                  Try Again
                </button>
              </div>
            )}

            {isLoadingDetails ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin h-8 w-8 border-2 border-amber-500 border-t-transparent rounded-full"></div>
              </div>
            ) : revenueDetails.length === 0 ? (
              <p className="text-center py-4 text-gray-500">No revenue details available for today</p>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Supply ID</TableHead>
                      <TableHead>Hospital</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead className="text-right">Cylinders</TableHead>
                      <TableHead>Time</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {revenueDetails.map((detail) => (
                      <TableRow key={detail.id}>
                        <TableCell className="font-medium">{detail.id}</TableCell>
                        <TableCell>{detail.hospital_name}</TableCell>
                        <TableCell className="text-right">RWF {Number(detail.total_price).toLocaleString()}</TableCell>
                        <TableCell className="text-right">{detail.cylinder_count}</TableCell>
                        <TableCell>{format(new Date(detail.date), "HH:mm")}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-md">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-amber-800">Total Revenue Today:</span>
                    <span className="font-bold text-amber-800">
                      RWF{" "}
                      {Number(stats.revenue).toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Returned Cylinders Modal */}
      <Dialog open={activeModal === "returned"} onOpenChange={(open) => !open && setActiveModal(null)}>
        <DialogContent className="sm:max-w-[800px] bg-white text-black">
          <DialogHeader>
            <DialogTitle>Returned Cylinders Today ({stats.returnedToday})</DialogTitle>
            <DialogDescription className="text-gray-500">Showing cylinders returned today ({today})</DialogDescription>
          </DialogHeader>

          <div className="max-h-[500px] overflow-y-auto">
            {detailsError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-700">
                <p>{detailsError}</p>
                <button
                  onClick={() => handleOpenModal("returned")}
                  className="mt-2 px-3 py-1 bg-red-100 hover:bg-red-200 rounded-md text-sm transition-colors"
                >
                  Try Again
                </button>
              </div>
            )}

            {isLoadingDetails ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin h-8 w-8 border-2 border-blue-500 border-t-transparent rounded-full"></div>
              </div>
            ) : returnedCylinders.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-gray-500 mb-2">No cylinders returned today</p>
                <p className="text-sm text-gray-400">
                  This shows only cylinders that were marked as returned today, not all returned cylinders.
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cylinder Code</TableHead>
                    <TableHead>Size</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {returnedCylinders.map((cylinder) => (
                    <TableRow key={cylinder.id}>
                      <TableCell className="font-medium">{cylinder.code}</TableCell>
                      <TableCell>{cylinder.size}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

interface StatCardProps {
  title: string
  value: number | string
  description: string
  icon: React.ReactNode
  color: "blue" | "green" | "purple" | "amber"
  onClick?: () => void
}

function StatCard({ title, value, description, icon, color, onClick }: StatCardProps) {
  const colorClasses = {
    blue: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    green: "bg-green-500/10 text-green-500 border-green-500/20",
    purple: "bg-purple-500/10 text-purple-500 border-purple-500/20",
    amber: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  }

  return (
    <Card
      className={`bg-teal-600 border-teal-600 ${onClick ? "cursor-pointer hover:bg-teal-700 transition-colors" : ""}`}
      onClick={onClick}
    >
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-teal-100">{title}</h3>
          <div className={`p-2 rounded-md ${colorClasses[color]}`}>{icon}</div>
        </div>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-teal-200 mt-1">{description}</p>
      </CardContent>
    </Card>
  )
}
