"use client"

import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { GasType } from "@/types"
import { Edit, Trash2, Search, Filter, Plus, Download, Upload, Package, ArrowLeft } from "lucide-react"
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
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

export default function InventoryTable() {
  const [gasTypes, setGasTypes] = useState<GasType[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const router = useRouter()

  useEffect(() => {
    const fetchGasTypes = async () => {
      try {
        const response = await fetch("/api/gas-types")
        const data = await response.json()
        setGasTypes(data.data)
        setIsLoading(false)
      } catch (error) {
        console.error("Error fetching gas types:", error)
        setIsLoading(false)
      }
    }

    fetchGasTypes()
  }, [])

  const handleDelete = async (id: number) => {
    try {
      const response = await fetch(`/api/gas-types/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setGasTypes(gasTypes.filter((gasType) => gasType.id !== id))
      } else {
        console.error("Failed to delete gas type")
      }
    } catch (error) {
      console.error("Error deleting gas type:", error)
    }
  }

  const filteredGasTypes = gasTypes.filter((gasType) => gasType.name.toLowerCase().includes(searchQuery.toLowerCase()))

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
              <h2 className="text-xl font-semibold text-gray-900">Gas Types</h2>
            </div>
            <p className="text-gray-500 mt-1">Manage gas types and their prices per liter</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search gas types..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2 h-10 w-full md:w-[240px] text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <Button variant="outline" size="icon" className="h-10 w-10 border-gray-300">
              <Filter className="h-4 w-4 text-gray-500" />
            </Button>
            <Link href="/inventory/add-gas-type">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white h-10 px-4 rounded-lg flex items-center gap-2">
                <Plus className="h-4 w-4" />
                <span>Add Gas Type</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        {isLoading ? (
          <div className="p-8 flex justify-center">
            <div className="animate-spin h-8 w-8 border-2 border-blue-500 border-t-transparent rounded-full"></div>
          </div>
        ) : filteredGasTypes.length === 0 ? (
          <div className="text-center py-12">
            <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Package className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">No gas types found</h3>
            <p className="text-gray-500 mb-6">Get started by creating a new gas type</p>
            <Button
              onClick={() => router.push("/inventory/add-gas-type")}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Gas Type
            </Button>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50 border-b border-gray-200">
                <TableHead className="py-4 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </TableHead>
                <TableHead className="py-4 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </TableHead>
                <TableHead className="py-4 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price per Liter
                </TableHead>
                <TableHead className="py-4 px-6 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredGasTypes.map((gasType, index) => (
                <TableRow
                  key={gasType.id}
                  className={`border-b border-gray-200 hover:bg-gray-50 ${index % 2 === 0 ? "bg-white" : "bg-gray-50/50"}`}
                >
                  <TableCell className="py-4 px-6 text-sm">
                    <Badge variant="outline" className="bg-gray-100 text-gray-700 border-gray-200 font-medium">
                      {gasType.id}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-4 px-6 text-sm font-medium text-gray-900">{gasType.name}</TableCell>
                  <TableCell className="py-4 px-6 text-sm text-blue-600 font-medium">
                    RWF{Number(gasType.price_per_liter).toFixed(2)}
                  </TableCell>
                  <TableCell className="py-4 px-6 text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 px-3 text-gray-700 border-gray-300 hover:bg-gray-100"
                        onClick={() => router.push(`/inventory/edit-gas-type/${gasType.id}`)}
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
                              This will permanently delete the gas type. This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel className="border border-gray-300 text-gray-700">
                              Cancel
                            </AlertDialogCancel>
                            <AlertDialogAction
                              className="bg-red-600 text-white hover:bg-red-700"
                              onClick={() => handleDelete(gasType.id)}
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
        <div className="text-sm text-gray-500">Showing {filteredGasTypes.length} gas types</div>
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
