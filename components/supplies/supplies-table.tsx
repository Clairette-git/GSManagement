"use client"

import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { Supply } from "@/types"
import {
  Eye,
  FileText,
  Printer,
  Search,
  Calendar,
  Filter,
  Plus,
  Download,
  Upload,
  Truck,
  ArrowLeft,
} from "lucide-react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"

export default function SuppliesTable() {
  const [supplies, setSupplies] = useState<Supply[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [dateFilter, setDateFilter] = useState<string>("all")
  const router = useRouter()

  useEffect(() => {
    const fetchSupplies = async () => {
      try {
        const response = await fetch("/api/supplies")
        const data = await response.json()
        setSupplies(data.data)
        setIsLoading(false)
      } catch (error) {
        console.error("Error fetching supplies:", error)
        setIsLoading(false)
      }
    }

    fetchSupplies()
  }, [])

  const filteredSupplies = supplies.filter((supply) => {
    const matchesSearch =
      searchQuery === "" ||
      supply.hospital_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      supply.vehicle_plate.toLowerCase().includes(searchQuery.toLowerCase()) ||
      supply.driver_name.toLowerCase().includes(searchQuery.toLowerCase())

    let matchesDate = true
    const supplyDate = new Date(supply.date)
    const today = new Date()
    const lastWeek = new Date()
    lastWeek.setDate(today.getDate() - 7)
    const lastMonth = new Date()
    lastMonth.setMonth(today.getMonth() - 1)

    if (dateFilter === "today") {
      matchesDate = supplyDate.toDateString() === today.toDateString()
    } else if (dateFilter === "week") {
      matchesDate = supplyDate >= lastWeek
    } else if (dateFilter === "month") {
      matchesDate = supplyDate >= lastMonth
    }

    return matchesSearch && matchesDate
  })

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

    if (diffInHours < 1) return "Just now"
    if (diffInHours < 24) return `About ${diffInHours} hours ago`
    if (diffInHours < 48) return "1 day ago"
    if (diffInHours < 72) return "2 days ago"
    if (diffInHours < 168) return "3 days ago"

    return format(date, "MMM d, yyyy")
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-gray-200">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-gray-500 hover:text-gray-700"
                onClick={() => router.push("/dashboard")}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <h2 className="text-xl font-semibold text-gray-900">Gas Supplies</h2>
            </div>
            <p className="text-gray-500 mt-1">Manage gas deliveries to hospitals</p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/supplies/add">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white h-10 px-4 rounded-lg flex items-center gap-2">
                <Plus className="h-4 w-4" />
                <span>New Supply</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by hospital, vehicle, or driver..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2 h-10 w-full text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          <div className="flex flex-col md:flex-row gap-4">
            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger className="w-full md:w-[180px] h-10 border-gray-300 text-gray-700">
                <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                <SelectValue placeholder="Filter by date" />
              </SelectTrigger>
              <SelectContent className="bg-white border border-gray-200">
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">Last 7 Days</SelectItem>
                <SelectItem value="month">Last 30 Days</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon" className="h-10 w-10 border-gray-300">
              <Filter className="h-4 w-4 text-gray-500" />
            </Button>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        {isLoading ? (
          <div className="p-8 flex justify-center">
            <div className="animate-spin h-8 w-8 border-2 border-blue-500 border-t-transparent rounded-full"></div>
          </div>
        ) : filteredSupplies.length === 0 ? (
          <div className="text-center py-12">
            <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Truck className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">No supplies found</h3>
            <p className="text-gray-500 mb-6">Get started by creating a new supply</p>
            <Button onClick={() => router.push("/supplies/add")} className="bg-blue-600 hover:bg-blue-700 text-white">
              <Plus className="h-4 w-4 mr-2" />
              New Supply
            </Button>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50 border-b border-gray-200">
                <TableHead className="py-4 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  #
                </TableHead>
                <TableHead className="py-4 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Hospital
                </TableHead>
                <TableHead className="py-4 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vehicle
                </TableHead>
                <TableHead className="py-4 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Driver
                </TableHead>
                <TableHead className="py-4 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Price
                </TableHead>
                <TableHead className="py-4 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Interaction
                </TableHead>
                <TableHead className="py-4 px-6 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSupplies.map((supply, index) => (
                <TableRow
                  key={supply.id}
                  className={`border-b border-gray-200 hover:bg-gray-50 ${index % 2 === 0 ? "bg-white" : "bg-gray-50/50"}`}
                >
                  <TableCell className="py-4 px-6 text-sm font-medium text-gray-900">{index + 1}</TableCell>
                  <TableCell className="py-4 px-6">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-blue-100 text-blue-600 rounded-md flex items-center justify-center">
                        {supply.hospital_name.charAt(0).toUpperCase()}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{supply.hospital_name}</div>
                        <div className="text-sm text-gray-500">{format(new Date(supply.date), "MMM d, yyyy")}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="py-4 px-6 text-sm text-gray-700">{supply.vehicle_plate}</TableCell>
                  <TableCell className="py-4 px-6 text-sm text-gray-700">{supply.driver_name}</TableCell>
                  <TableCell className="py-4 px-6 text-sm font-medium text-blue-600">
                    RWF{Number(supply.total_price).toFixed(2)}
                  </TableCell>
                  <TableCell className="py-4 px-6 text-sm text-gray-500">{getTimeAgo(supply.date)}</TableCell>
                  <TableCell className="py-4 px-6 text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 px-3 text-gray-700 border-gray-300 hover:bg-gray-100"
                        onClick={() => router.push(`/supplies/${supply.id}`)}
                      >
                        <Eye className="h-3.5 w-3.5 mr-1" />
                        View
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 px-3 text-gray-700 border-gray-300 hover:bg-gray-100"
                        onClick={() => router.push(`/invoices/create/${supply.id}`)}
                      >
                        <FileText className="h-3.5 w-3.5 mr-1" />
                        Invoice
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 px-3 text-gray-700 border-gray-300 hover:bg-gray-100"
                        onClick={() => window.open(`/api/supplies/${supply.id}/print`, "_blank")}
                      >
                        <Printer className="h-3.5 w-3.5 mr-1" />
                        Print
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      <div className="p-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
        <div className="text-sm text-gray-500">Showing {filteredSupplies.length} supplies</div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="h-8 px-3 text-gray-700 border-gray-300">
            <Download className="h-3.5 w-3.5 mr-1" />
            Export
          </Button>
          <Button variant="outline" size="sm" className="h-8 px-3 text-gray-700 border-gray-300">
            <Upload className="h-3.5 w-3.5 mr-1" />
            Import
          </Button>
        </div>
      </div>
    </div>
  )
}
