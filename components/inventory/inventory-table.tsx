"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { GasType } from "@/types"
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

export default function InventoryTable() {
  const [gasTypes, setGasTypes] = useState<GasType[]>([])
  const [isLoading, setIsLoading] = useState(true)
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gas Types</CardTitle>
        <CardDescription>Manage gas types and their prices per liter</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="w-full h-10 bg-muted animate-pulse rounded" />
            ))}
          </div>
        ) : gasTypes.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-muted-foreground">No gas types found</p>
            <Button variant="outline" className="mt-4" onClick={() => router.push("/inventory/add-gas-type")}>
              Add your first gas type
            </Button>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Price per Liter</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {gasTypes.map((gasType) => (
                <TableRow key={gasType.id}>
                  <TableCell>{gasType.id}</TableCell>
                  <TableCell className="font-medium">{gasType.name}</TableCell>
                  <TableCell>${Number(gasType.price_per_liter).toFixed(2)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => router.push(`/inventory/edit-gas-type/${gasType.id}`)}
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
                              This will permanently delete the gas type. This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              className="bg-destructive text-destructive-foreground"
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
      </CardContent>
    </Card>
  )
}

