"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { Supply } from "@/types"
import { Eye, FileText, Printer, Search, Calendar } from "lucide-react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"

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

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader className="pb-3">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <CardTitle className="text-xl font-semibold">Gas Supplies</CardTitle>
            <CardDescription className="text-gray-400">Manage gas supplies to hospitals</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row gap-4 mb-6 bg-gray-900/50 p-4 rounded-lg border border-gray-700">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search by hospital, vehicle, or driver..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-gray-900 border-gray-700 focus:border-blue-500 w-full"
              />
            </div>
          </div>
          <div>
            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger className="w-full md:w-[180px] bg-gray-900 border-gray-700">
                <Calendar className="mr-2 h-4 w-4 text-gray-500" />
                <SelectValue placeholder="Filter by date" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700 text-white">
                <SelectItem value="all" className="focus:bg-gray-700 focus:text-white">
                  All Time
                </SelectItem>
                <SelectItem value="today" className="focus:bg-gray-700 focus:text-white">
                  Today
                </SelectItem>
                <SelectItem value="week" className="focus:bg-gray-700 focus:text-white">
                  Last 7 Days
                </SelectItem>
                <SelectItem value="month" className="focus:bg-gray-700 focus:text-white">
                  Last 30 Days
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="w-full h-10 bg-gray-700 animate-pulse rounded" />
            ))}
          </div>
        ) : filteredSupplies.length === 0 ? (
          <div className="text-center py-10 bg-gray-900/50 rounded-lg border border-gray-800">
            <p className="text-gray-400">No supplies found</p>
            <Button
              variant="outline"
              className="mt-4 border-gray-700 hover:bg-gray-800 hover:text-white"
              onClick={() => router.push("/supplies/add")}
            >
              Create your first supply
            </Button>
          </div>
        ) : (
          <div className="rounded-md border border-gray-700 overflow-hidden">
            <Table>
              <TableHeader className="bg-gray-900">
                <TableRow className="hover:bg-gray-900/80 border-gray-800">
                  <TableHead className="text-gray-400 font-medium">Date</TableHead>
                  <TableHead className="text-gray-400 font-medium">Hospital</TableHead>
                  <TableHead className="text-gray-400 font-medium">Vehicle</TableHead>
                  <TableHead className="text-gray-400 font-medium">Driver</TableHead>
                  <TableHead className="text-gray-400 font-medium">Total Price</TableHead>
                  <TableHead className="text-gray-400 font-medium text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSupplies.map((supply) => (
                  <TableRow key={supply.id} className="hover:bg-gray-800/50 border-gray-800">
                    <TableCell>
                      <Badge variant="outline" className="bg-gray-700/50 text-gray-300 border-gray-600">
                        {format(new Date(supply.date), "MMM dd, yyyy")}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium text-white">{supply.hospital_name}</TableCell>
                    <TableCell className="text-gray-300">{supply.vehicle_plate}</TableCell>
                    <TableCell className="text-gray-300">{supply.driver_name}</TableCell>
                    <TableCell className="text-blue-400">${Number(supply.total_price).toFixed(2)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="border-gray-700 bg-gray-800 hover:bg-gray-700"
                          onClick={() => router.push(`/supplies/${supply.id}`)}
                        >
                          <Eye className="h-4 w-4 text-gray-300" />
                          <span className="sr-only">View</span>
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          className="border-gray-700 bg-gray-800 hover:bg-gray-700"
                          onClick={() => router.push(`/invoices/create/${supply.id}`)}
                        >
                          <FileText className="h-4 w-4 text-gray-300" />
                          <span className="sr-only">Invoice</span>
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          className="border-gray-700 bg-gray-800 hover:bg-gray-700"
                          onClick={() => window.open(`/api/supplies/${supply.id}/print`, "_blank")}
                        >
                          <Printer className="h-4 w-4 text-gray-300" />
                          <span className="sr-only">Print</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
