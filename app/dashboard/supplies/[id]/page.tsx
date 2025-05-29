"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Printer, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { format } from "date-fns"

interface SupplyDetail {
  id: number
  date: string
  hospital_name: string
  total_price: number
  cylinders: {
    id: number
    code: string
    size: number
    gas_name: string
    price: number
  }[]
}

export default function SupplyDetailsPage({ params }: { params: { id: string } }) {
  const supplyId = params.id
  const [supply, setSupply] = useState<SupplyDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    async function fetchSupplyDetails() {
      try {
        setLoading(true)
        const response = await fetch(`/api/supplies/${supplyId}`)

        if (!response.ok) {
          const errorText = await response.text()
          console.error(`Error fetching supply details: ${errorText}`)
          throw new Error(`Failed to fetch supply details: ${response.statusText}`)
        }

        const data = await response.json()
        setSupply(data.data)
      } catch (error) {
        console.error("Error fetching supply details:", error)
        setError(error instanceof Error ? error.message : "Failed to load supply details")
      } finally {
        setLoading(false)
      }
    }

    fetchSupplyDetails()
  }, [supplyId])

  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <div className="flex items-center mb-6">
          <Button variant="ghost" className="mr-4" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <h1 className="text-2xl font-bold">Loading Supply Details...</h1>
        </div>
        <Card>
          <CardHeader>
            <div className="h-8 w-64 bg-gray-200 rounded animate-pulse"></div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-12 bg-gray-200 rounded animate-pulse"></div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <div className="flex items-center mb-6">
          <Button variant="ghost" className="mr-4" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <h1 className="text-2xl font-bold">Supply Details</h1>
        </div>
        <Card className="border-red-500">
          <CardContent className="p-6">
            <div className="text-red-500 mb-4">
              <p className="text-lg font-semibold">Error Loading Supply Details</p>
              <p>{error}</p>
            </div>
            <Button onClick={() => window.location.reload()}>Retry</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!supply) {
    return (
      <div className="container mx-auto p-4">
        <div className="flex items-center mb-6">
          <Button variant="ghost" className="mr-4" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <h1 className="text-2xl font-bold">Supply Not Found</h1>
        </div>
        <Card>
          <CardContent className="p-6">
            <p>The requested supply could not be found.</p>
            <Button className="mt-4" onClick={() => router.push("/dashboard/supplies")}>
              View All Supplies
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Button variant="ghost" className="mr-4" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <h1 className="text-2xl font-bold">Supply Details</h1>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Printer className="mr-2 h-4 w-4" />
            Print
          </Button>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Supply Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Supply ID</p>
              <p className="font-medium">{supply.id}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Date</p>
              <p className="font-medium">{format(new Date(supply.date), "PPP")}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Hospital</p>
              <p className="font-medium">{supply.hospital_name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Price</p>
              <p className="font-medium">
                RWF{" "}
                {Number(supply.total_price).toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Supplied Cylinders</CardTitle>
        </CardHeader>
        <CardContent>
          {supply.cylinders && supply.cylinders.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Cylinder Code</th>
                    <th className="text-left py-3 px-4">Size (L)</th>
                    <th className="text-left py-3 px-4">Gas Type</th>
                    <th className="text-right py-3 px-4">Price</th>
                  </tr>
                </thead>
                <tbody>
                  {supply.cylinders.map((cylinder) => (
                    <tr key={cylinder.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">{cylinder.code}</td>
                      <td className="py-3 px-4">{cylinder.size}</td>
                      <td className="py-3 px-4">{cylinder.gas_name}</td>
                      <td className="py-3 px-4 text-right">
                        RWF{" "}
                        {Number(cylinder.price).toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="font-bold">
                    <td colSpan={3} className="py-3 px-4 text-right">
                      Total:
                    </td>
                    <td className="py-3 px-4 text-right">
                      RWF{" "}
                      {Number(supply.total_price).toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          ) : (
            <p className="text-gray-500">No cylinders found for this supply.</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
