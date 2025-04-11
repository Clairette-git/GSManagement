"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { GasType } from "@/types"
import { Edit, Trash2, Search, Filter } from "lucide-react"
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
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader className="pb-3">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <CardTitle className="text-xl font-semibold">Gas Types</CardTitle>
            <CardDescription className="text-gray-400">Manage gas types and their prices per liter</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search gas types..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-gray-900 border-gray-700 focus:border-blue-500 w-full md:w-[200px]"
              />
            </div>
            <Button variant="outline" size="icon" className="border-gray-700 bg-gray-900 hover:bg-gray-800">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="w-full h-10 bg-gray-700 animate-pulse rounded" />
            ))}
          </div>
        ) : filteredGasTypes.length === 0 ? (
          <div className="text-center py-10 bg-gray-900/50 rounded-lg border border-gray-800">
            <p className="text-gray-400">No gas types found</p>
            <Button
              variant="outline"
              className="mt-4 border-gray-700 hover:bg-gray-800 hover:text-white"
              onClick={() => router.push("/inventory/add-gas-type")}
            >
              Add your first gas type
            </Button>
          </div>
        ) : (
          <div className="rounded-md border border-gray-700 overflow-hidden">
            <Table>
              <TableHeader className="bg-gray-900">
                <TableRow className="hover:bg-gray-900/80 border-gray-800">
                  <TableHead className="text-gray-400 font-medium">ID</TableHead>
                  <TableHead className="text-gray-400 font-medium">Name</TableHead>
                  <TableHead className="text-gray-400 font-medium">Price per Liter</TableHead>
                  <TableHead className="text-gray-400 font-medium text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
              {[...filteredGasTypes].sort((a, b) => a.id - b.id).map((gasType) =>(
                  <TableRow key={gasType.id} className="hover:bg-gray-800/50 border-gray-800">
                    <TableCell className="text-gray-300">
                      <Badge variant="outline" className="bg-gray-700/50 text-gray-300 border-gray-600">
                        {gasType.id}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium text-white">{gasType.name}</TableCell>
                    <TableCell className="text-blue-400">${Number(gasType.price_per_liter).toFixed(2)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="border-gray-700 bg-gray-800 hover:bg-gray-700"
                          onClick={() => router.push(`/inventory/edit-gas-type/${gasType.id}`)}
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
                                This will permanently delete the gas type. This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel className="bg-gray-700 border-gray-600 text-white hover:bg-gray-600">
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
          </div>
        )}
      </CardContent>
    </Card>
  )
}
