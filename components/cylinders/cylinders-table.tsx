"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { Cylinder, GasType } from "@/types"
import { Edit, Trash2 } from "lucide-react"
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gas Cylinders</CardTitle>
        <CardDescription>Manage gas cylinders and their status</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <Input
              placeholder="Search by cylinder code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
            />
          </div>
          <div className="flex gap-4">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="in stock">In Stock</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="returned">Returned</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sizeFilter} onValueChange={setSizeFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by size" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sizes</SelectItem>
                <SelectItem value="10L">10L</SelectItem>
                <SelectItem value="40L">40L</SelectItem>
                <SelectItem value="50L">50L</SelectItem>
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
        ) : filteredCylinders.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-muted-foreground">No cylinders found</p>
            <Button variant="outline" className="mt-4" onClick={() => router.push("/cylinders/add")}>
              Add your first cylinder
            </Button>
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Gas Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCylinders.map((cylinder) => (
                  <TableRow key={cylinder.id}>
                    <TableCell className="font-medium">{cylinder.code}</TableCell>
                    <TableCell>{cylinder.size}</TableCell>
                    <TableCell>{getGasTypeName(cylinder.gas_type_id)}</TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          cylinder.status === "in stock"
                            ? "bg-green-100 text-green-800"
                            : cylinder.status === "delivered"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {cylinder.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => router.push(`/cylinders/edit/${cylinder.id}`)}
                        >
                          <Edit className="h-4 w-4" />
                          <span className="sr-only">Edit</span>
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="icon" className="text-destructive">
                              <Trash2 className="h-4 w-4" />
                              <span className="sr-only">Delete</span>
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will permanently delete the cylinder. This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                className="bg-destructive text-destructive-foreground"
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

