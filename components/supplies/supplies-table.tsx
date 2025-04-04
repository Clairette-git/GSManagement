"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { Supply } from "@/types"
import { Eye, FileText, Printer } from "lucide-react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

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
    <Card>
      <CardHeader>
        <CardTitle>Gas Supplies</CardTitle>
        <CardDescription>Manage gas supplies to hospitals</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <Input
              placeholder="Search by hospital, vehicle, or driver..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
            />
          </div>
          <div>
            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by date" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">Last 7 Days</SelectItem>
                <SelectItem value="month">Last 30 Days</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="w-full h-10 bg-muted animate-pulse rounded" />
            ))}
          </div>
        ) : filteredSupplies.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-muted-foreground">No supplies found</p>
            <Button variant="outline" className="mt-4" onClick={() => router.push("/supplies/add")}>
              Create your first supply
            </Button>
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Hospital</TableHead>
                  <TableHead>Vehicle</TableHead>
                  <TableHead>Driver</TableHead>
                  <TableHead>Total Price</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSupplies.map((supply) => (
                  <TableRow key={supply.id}>
                    <TableCell>{format(new Date(supply.date), "PPP")}</TableCell>
                    <TableCell className="font-medium">{supply.hospital_name}</TableCell>
                    <TableCell>{supply.vehicle_plate}</TableCell>
                    <TableCell>{supply.driver_name}</TableCell>
                    <TableCell>${Number(supply.total_price).toFixed(2)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="icon" onClick={() => router.push(`/supplies/${supply.id}`)}>
                          <Eye className="h-4 w-4" />
                          <span className="sr-only">View</span>
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => router.push(`/invoices/create/${supply.id}`)}
                        >
                          <FileText className="h-4 w-4" />
                          <span className="sr-only">Invoice</span>
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => window.open(`/api/supplies/${supply.id}/print`, "_blank")}
                        >
                          <Printer className="h-4 w-4" />
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

