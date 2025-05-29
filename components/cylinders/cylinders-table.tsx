"use client"

import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { Cylinder, GasType } from "@/types"
import {
  Edit,
  Trash2,
  Search,
  Filter,
  Plus,
  Download,
  Upload,
  ArrowLeft,
  RefreshCw,
  CheckCircle,
  Truck,
  ClipboardList,
} from "lucide-react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { CylinderIcon } from "lucide-react"
import { format } from "date-fns"
import { useCurrentUser } from "@/components/auth/role-access-control"

export default function CylindersTable() {
  const [cylinders, setCylinders] = useState<Cylinder[]>([]) // Initialize as empty array
  const [gasTypes, setGasTypes] = useState<GasType[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [sizeFilter, setSizeFilter] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState<string>("")
  const router = useRouter()
  const { user } = useCurrentUser()

  const fetchData = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const [cylindersRes, gasTypesRes] = await Promise.all([fetch("/api/cylinders"), fetch("/api/gas-types")])

      if (!cylindersRes.ok) {
        throw new Error(`Failed to fetch cylinders: ${cylindersRes.status}`)
      }

      if (!gasTypesRes.ok) {
        throw new Error(`Failed to fetch gas types: ${gasTypesRes.status}`)
      }

      const [cylindersData, gasTypesData] = await Promise.all([cylindersRes.json(), gasTypesRes.json()])

      setCylinders(cylindersData.data || []) // Ensure we set an empty array if data is null/undefined
      setGasTypes(gasTypesData.data || [])
    } catch (error) {
      console.error("Error fetching data:", error)
      setError(error instanceof Error ? error.message : "An unknown error occurred")
      // Set empty arrays to prevent undefined errors
      setCylinders([])
      setGasTypes([])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()

    // Set up refresh interval (every 30 seconds)
    const intervalId = setInterval(fetchData, 30000)

    // Clean up interval on component unmount
    return () => clearInterval(intervalId)
  }, [])

  const handleDelete = async (id: number) => {
    try {
      const response = await fetch(`/api/cylinders/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setCylinders(cylinders.filter((cylinder) => cylinder.id !== id))
      } else {
        console.error("Failed to delete cylinder")
        setError("Failed to delete cylinder")
      }
    } catch (error) {
      console.error("Error deleting cylinder:", error)
      setError(error instanceof Error ? error.message : "An unknown error occurred")
    }
  }

  const handleMarkAsReturned = async (id: number) => {
    try {
      const cylinder = cylinders.find((c) => c.id === id)
      if (!cylinder) return

      const response = await fetch(`/api/cylinders/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...cylinder,
          status: "returned",
          gas_type_id: null,
          is_active: false,
        }),
      })

      if (response.ok) {
        // Update the cylinder in the local state
        setCylinders(
          cylinders.map((c) => (c.id === id ? { ...c, status: "returned", gas_type_id: null, is_active: false } : c)),
        )
      } else {
        console.error("Failed to mark cylinder as returned")
        setError("Failed to mark cylinder as returned")
      }
    } catch (error) {
      console.error("Error marking cylinder as returned:", error)
      setError(error instanceof Error ? error.message : "An unknown error occurred")
    }
  }

  // Add this new function to handle marking a cylinder as filled
  const handleMarkAsFilled = async (id: number) => {
    try {
      setIsLoading(true)
      const cylinder = cylinders.find((c) => c.id === id)
      if (!cylinder) return

      const now = new Date().toISOString()

      const response = await fetch(`/api/cylinders/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...cylinder,
          status: "filled",
          filling_end_time: now,
        }),
      })

      if (response.ok) {
        // Refresh the data to show the updated filling end time
        await fetchData()
      } else {
        console.error("Failed to mark cylinder as filled")
        setError("Failed to mark cylinder as filled")
      }
    } catch (error) {
      console.error("Error marking cylinder as filled:", error)
      setError(error instanceof Error ? error.message : "An unknown error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const getGasTypeName = (gasTypeId: number | null) => {
    if (!gasTypeId) return "Empty"
    const gasType = gasTypes.find((gt) => gt.id === gasTypeId)
    return gasType ? gasType.name : "Unknown"
  }

  // Count filled cylinders that haven't been assigned
  const filledCylindersCount =
    cylinders?.filter((cylinder) => cylinder.status === "filled" && cylinder.is_active !== false).length || 0

  // Count cylinders with "to be delivered" status
  const toBeDeliveredCount =
    cylinders?.filter((cylinder) => cylinder.status === "to be delivered" && cylinder.is_active !== false).length || 0

  // Ensure cylinders is an array before filtering
  const filteredCylinders =
    cylinders?.filter((cylinder) => {
      const matchesStatus = statusFilter === "all" || cylinder.status === statusFilter
      const matchesSize = sizeFilter === "all" || cylinder.size === sizeFilter
      const matchesSearch = searchQuery === "" || cylinder.code.toLowerCase().includes(searchQuery.toLowerCase())

      return matchesStatus && matchesSize && matchesSearch
    }) || []

  const getStatusBadge = (status: string, isActive: boolean) => {
    if (!isActive) {
      return <Badge className="bg-gray-100 text-gray-800 border-gray-200">Inactive</Badge>
    }

    switch (status) {
      case "in stock":
        return <Badge className="bg-green-100 text-green-800 border-green-200">In Stock</Badge>
      case "delivered":
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Delivered</Badge>
      case "returned":
        return <Badge className="bg-amber-100 text-amber-800 border-amber-200">Returned</Badge>
      case "filling":
        return <Badge className="bg-purple-100 text-purple-800 border-purple-200">Filling</Badge>
      case "filled":
        return <Badge className="bg-indigo-100 text-indigo-800 border-indigo-200">Filled</Badge>
      case "to be delivered":
        return <Badge className="bg-teal-100 text-teal-800 border-teal-200">To be Delivered</Badge>
      case "empty":
        return <Badge className="bg-red-100 text-red-800 border-red-200">Empty</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800 border-gray-200">{status}</Badge>
    }
  }

  // Updated to show specific date and time
  const formatDateTime = (dateTimeString?: string | null) => {
    if (!dateTimeString) return "N/A"
    const date = new Date(dateTimeString)
    return format(date, "MMM d, yyyy 'at' h:mm:ss a")
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
              <h2 className="text-xl font-semibold text-gray-900">Gas Cylinders</h2>
            </div>
            <p className="text-gray-500 mt-1">Manage gas cylinders and their status</p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              className="h-10 px-3 text-teal-600 border-gray-300 hover:bg-teal-50"
              onClick={fetchData}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>

           {toBeDeliveredCount > 0 && (user?.role === "admin" || user?.role === "storekeeper") && (
              <Link href="/cylinders/assigned">
                <Button className="bg-teal-600 hover:bg-teal-700 text-white h-10 px-4 rounded-lg flex items-center gap-2">
                  <ClipboardList className="h-4 w-4" />
                  <span>View Assigned ({toBeDeliveredCount})</span>
                </Button>
              </Link>
            )}

            {filledCylindersCount > 0 && (
              <Link href="/cylinders/assign">
                <Button className="bg-teal-600 hover:bg-teal-700 text-white h-10 px-4 rounded-lg flex items-center gap-2">
                  <Truck className="h-4 w-4" />
                  <span>Assign to Vehicle ({filledCylindersCount})</span>
                </Button>
              </Link>
            )}

            <Link href="/cylinders/add">
              <Button className="bg-teal-600 hover:bg-teal-700 text-white h-10 px-4 rounded-lg flex items-center gap-2">
                <Plus className="h-4 w-4" />
                <span>Add Cylinder</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="p-4 border-b border-gray-200 bg-teal-600">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by cylinder code..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2 h-10 w-full text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          <div className="flex flex-col md:flex-row gap-4">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[180px] h-10 border-gray-300 text-gray-700">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent className="bg-white border border-gray-200">
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="in stock">In Stock</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="returned">Returned</SelectItem>
                <SelectItem value="filling">Filling</SelectItem>
                <SelectItem value="filled">Filled</SelectItem>
                <SelectItem value="to be delivered">To be Delivered</SelectItem>
                <SelectItem value="empty">Empty</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sizeFilter} onValueChange={setSizeFilter}>
              <SelectTrigger className="w-full md:w-[180px] h-10 border-gray-300 text-gray-700">
                <SelectValue placeholder="Filter by size" />
              </SelectTrigger>
              <SelectContent className="bg-white border border-gray-200">
                <SelectItem value="all">All Sizes</SelectItem>
                <SelectItem value="10L">10L</SelectItem>
                <SelectItem value="40L">40L</SelectItem>
                <SelectItem value="50L">50L</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon" className="h-10 w-10 border-gray-300">
              <Filter className="h-4 w-4 text-gray-500" />
            </Button>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border-b border-red-200">
          <div className="flex items-center gap-2 text-red-700">
            <span className="font-medium">Error:</span> {error}
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        {isLoading ? (
          <div className="p-8 flex justify-center">
            <div className="animate-spin h-8 w-8 border-2 border-blue-500 border-t-transparent rounded-full"></div>
          </div>
        ) : filteredCylinders.length === 0 ? (
          <div className="text-center py-12">
            <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <CylinderIcon className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">No cylinders found</h3>
            <p className="text-gray-500 mb-6">Get started by creating a new cylinder</p>
            <Button onClick={() => router.push("/cylinders/add")} className="bg-blue-600 hover:bg-blue-700 text-white">
              <Plus className="h-4 w-4 mr-2" />
              Add Cylinder
            </Button>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-teal-600 border-b border-gray-200 text-white">
                <TableHead className="py-4 px-6 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Code
                </TableHead>
                <TableHead className="py-4 px-6 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Size
                </TableHead>
                <TableHead className="py-4 px-6 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Gas Type
                </TableHead>
                <TableHead className="py-4 px-6 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Status
                </TableHead>
                <TableHead className="py-4 px-6 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Filling Start
                </TableHead>
                <TableHead className="py-4 px-6 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Filling End
                </TableHead>
                <TableHead className="py-4 px-6 text-center text-xs font-medium text-white uppercase tracking-wider">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCylinders.map((cylinder, index) => (
                <TableRow
                  key={cylinder.id}
                  className={`border-b border-gray-200 hover:bg-gray-50 ${index % 2 === 0 ? "bg-white" : "bg-gray-50/50"}`}
                >
                  <TableCell className="py-4 px-6 text-sm font-medium text-gray-900">{cylinder.code}</TableCell>
                  <TableCell className="py-4 px-6 text-sm text-gray-700">
                    <Badge variant="outline" className="bg-gray-100 text-gray-700 border-gray-200">
                      {cylinder.size}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-4 px-6 text-sm text-gray-700">
                    {getGasTypeName(cylinder.gas_type_id)}
                  </TableCell>
                  <TableCell className="py-4 px-6 text-sm">
                    {getStatusBadge(cylinder.status, cylinder.is_active !== false)}
                  </TableCell>
                  <TableCell className="py-4 px-6 text-sm text-gray-700">
                    {formatDateTime(cylinder.filling_start_time)}
                  </TableCell>
                  <TableCell className="py-4 px-6 text-sm text-gray-700">
                    {formatDateTime(cylinder.filling_end_time)}
                  </TableCell>
                  <TableCell className="py-4 px-6 text-right">
                    <div className="flex justify-end gap-2">
                      {cylinder.status === "delivered" && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 px-3 text-green-600 border-gray-300 hover:bg-green-50 hover:text-green-700"
                          onClick={() => handleMarkAsReturned(cylinder.id)}
                        >
                          <CheckCircle className="h-3.5 w-3.5 mr-1" />
                          Mark Returned
                        </Button>
                      )}

                      {cylinder.status === "filling" && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 px-3 text-indigo-600 border-gray-300 hover:bg-indigo-50 hover:text-indigo-700"
                          onClick={() => handleMarkAsFilled(cylinder.id)}
                        >
                          <CheckCircle className="h-3.5 w-3.5 mr-1" />
                          Mark Filled
                        </Button>
                      )}

                      {cylinder.status === "filling" && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 px-3 text-purple-600 border-gray-300 hover:bg-purple-50 hover:text-purple-700"
                          onClick={() => router.push(`/cylinders/edit/${cylinder.id}`)}
                        >
                          <RefreshCw className="h-3.5 w-3.5 mr-1" />
                          Update Filling
                        </Button>
                      )}

                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 px-3 text-gray-700 border-gray-300 hover:bg-gray-100"
                        onClick={() => router.push(`/cylinders/edit/${cylinder.id}`)}
                      >
                        <Edit className="h-3.5 w-3.5 mr-1" />
                        Edit
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 px-3 text-red-600 border-gray-300 hover:bg-red-50 hover:border-red-300 hover:text-red-700"
                          >
                            <Trash2 className="h-3.5 w-3.5 mr-1" />
                            Delete
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="bg-white">
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will permanently delete the cylinder. This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel className="border border-gray-300 text-gray-700">
                              Cancel
                            </AlertDialogCancel>
                            <AlertDialogAction
                              className="bg-red-600 text-white hover:bg-red-700"
                              onClick={() => handleDelete(cylinder.id)}
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      <div className="p-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
        <div className="text-sm text-gray-500">Showing {filteredCylinders.length} cylinders</div>
        <div className="flex items-center gap-2">
        
        </div>
      </div>
    </div>
  )
}
