"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { Cylinder, GasType } from "@/types"
import { Edit, Trash2, Search } from "lucide-react"
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

export default function CylindersTable() {
  const [cylinders, setCylinders] = useState<Cylinder[]>([])
  const [gasTypes, setGasTypes] = useState<GasType[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [sizeFilter, setSizeFilter] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState<string>("")
  const router = useRouter()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [cylindersRes, gasTypesRes] = await Promise.all([fetch("/api/cylinders"), fetch("/api/gas-types")])

        const [cylindersData, gasTypesData] = await Promise.all([cylindersRes.json(), gasTypesRes.json()])

        setCylinders(cylindersData.data)
        setGasTypes(gasTypesData.data)
        setIsLoading(false)
      } catch (error) {
        console.error("Error fetching data:", error)
        setIsLoading(false)
      }
    }

    fetchData()
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
      }
    } catch (error) {
      console.error("Error deleting cylinder:", error)
    }
  }

  const getGasTypeName = (gasTypeId: number | null) => {
    if (!gasTypeId) return "Empty"
    const gasType = gasTypes.find((gt) => gt.id === gasTypeId)
    return gasType ? gasType.name : "Unknown"
  }

  const filteredCylinders = cylinders.filter((cylinder) => {
    const matchesStatus = statusFilter === "all" || cylinder.status === statusFilter
    const matchesSize = sizeFilter === "all" || cylinder.size === sizeFilter
    const matchesSearch = searchQuery === "" || cylinder.code.toLowerCase().includes(searchQuery.toLowerCase())

    return matchesStatus && matchesSize && matchesSearch
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "in stock":
        return "bg-green-500/10 text-green-400 border-green-500/20"
      case "delivered":
        return "bg-blue-500/10 text-blue-400 border-blue-500/20"
      case "returned":
        return "bg-amber-500/10 text-amber-400 border-amber-500/20"
      default:
        return "bg-gray-500/10 text-gray-400 border-gray-500/20"
    }
  }

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader className="pb-3">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <CardTitle className="text-xl font-semibold">Gas Cylinders</CardTitle>
            <CardDescription className="text-gray-400">Manage gas cylinders and their status</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row gap-4 mb-6 bg-gray-900/50 p-4 rounded-lg border border-gray-700">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search by cylinder code..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-gray-900 border-gray-700 focus:border-blue-500 w-full"
              />
            </div>
          </div>
          <div className="flex flex-col md:flex-row gap-4">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[180px] bg-gray-900 border-gray-700">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700 text-white">
                <SelectItem value="all" className="focus:bg-gray-700 focus:text-white">
                  All Statuses
                </SelectItem>
                <SelectItem value="in stock" className="focus:bg-gray-700 focus:text-white">
                  In Stock
                </SelectItem>
                <SelectItem value="delivered" className="focus:bg-gray-700 focus:text-white">
                  Delivered
                </SelectItem>
                <SelectItem value="returned" className="focus:bg-gray-700 focus:text-white">
                  Returned
                </SelectItem>
              </SelectContent>
            </Select>
            <Select value={sizeFilter} onValueChange={setSizeFilter}>
              <SelectTrigger className="w-full md:w-[180px] bg-gray-900 border-gray-700">
                <SelectValue placeholder="Filter by size" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700 text-white">
                <SelectItem value="all" className="focus:bg-gray-700 focus:text-white">
                  All Sizes
                </SelectItem>
                <SelectItem value="10L" className="focus:bg-gray-700 focus:text-white">
                  10L
                </SelectItem>
                <SelectItem value="40L" className="focus:bg-gray-700 focus:text-white">
                  40L
                </SelectItem>
                <SelectItem value="50L" className="focus:bg-gray-700 focus:text-white">
                  50L
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
        ) : filteredCylinders.length === 0 ? (
          <div className="text-center py-10 bg-gray-900/50 rounded-lg border border-gray-800">
            <p className="text-gray-400">No cylinders found</p>
            <Button
              variant="outline"
              className="mt-4 border-gray-700 hover:bg-gray-800 hover:text-white"
              onClick={() => router.push("/cylinders/add")}
            >
              Add your first cylinder
            </Button>
          </div>
        ) : (
          <div className="rounded-md border border-gray-700 overflow-hidden">
            <Table>
              <TableHeader className="bg-gray-900">
                <TableRow className="hover:bg-gray-900/80 border-gray-800">
                  <TableHead className="text-gray-400 font-medium">Code</TableHead>
                  <TableHead className="text-gray-400 font-medium">Size</TableHead>
                  <TableHead className="text-gray-400 font-medium">Gas Type</TableHead>
                  <TableHead className="text-gray-400 font-medium">Status</TableHead>
                  <TableHead className="text-gray-400 font-medium text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCylinders.map((cylinder) => (
                  <TableRow key={cylinder.id} className="hover:bg-gray-800/50 border-gray-800">
                    <TableCell className="font-medium text-white">{cylinder.code}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-gray-700/50 text-gray-300 border-gray-600">
                        {cylinder.size}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-gray-300">{getGasTypeName(cylinder.gas_type_id)}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getStatusColor(cylinder.status)}>
                        {cylinder.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="border-gray-700 bg-gray-800 hover:bg-gray-700"
                          onClick={() => router.push(`/cylinders/edit/${cylinder.id}`)}
                        >
                          <Edit className="h-4 w-4 text-gray-300" />
                          <span className="sr-only">Edit</span>
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="icon"
                              className="border-gray-700 bg-gray-800 hover:bg-red-900/30 hover:border-red-800 text-gray-300 hover:text-red-400"
                            >
                              <Trash2 className="h-4 w-4" />
                              <span className="sr-only">Delete</span>
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="bg-gray-800 border-gray-700 text-white">
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                              <AlertDialogDescription className="text-gray-400">
                                This will permanently delete the cylinder. This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel className="bg-gray-700 border-gray-600 text-white hover:bg-gray-600">
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
          </div>
        )}
      </CardContent>
    </Card>
  )
}
