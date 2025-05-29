"use client"

import { useEffect, useState } from "react"
import { format } from "date-fns"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from "next/navigation"

interface Supply {
  id: number
  date: string
  hospital_name: string
  total_price: number
}

interface RecentSuppliesProps {
  className?: string
}

export function RecentSupplies({ className }: RecentSuppliesProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [supplies, setSupplies] = useState<Supply[]>([])
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    async function fetchSupplies() {
      try {
        setIsLoading(true)
        // Explicitly request exactly 5 supplies
        const response = await fetch("/api/supplies?limit=5")

        // Handle non-200 responses
        if (!response.ok) {
          const errorText = await response.text()
          console.error("Error fetching supplies:", errorText)
          setError(`Failed to load supplies: ${response.statusText}`)
          setSupplies([])
          return
        }

        const data = await response.json()

        // Ensure data.data is an array and limit to 5 items
        if (data && Array.isArray(data.data)) {
          setSupplies(data.data.slice(0, 5))
          setError(null)
        } else {
          console.error("Invalid data format:", data)
          setError("Invalid data format received from server")
          setSupplies([])
        }
      } catch (error) {
        console.error("Error fetching supplies:", error)
        setError("Failed to load supplies. Please try again later.")
        setSupplies([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchSupplies()
  }, [])

  const handleViewAllSupplies = () => {
    // Navigate to the supplies list page
    router.push("/supplies")
  }

  return (
    <Card className={`bg-teal-600 border-teal-600 ${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-medium text-teal-100">Recent Supplies</CardTitle>
        <CardDescription className="text-teal-200">Latest gas deliveries to hospitals</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="flex items-center justify-between p-4 border border-teal-700 rounded-md animate-pulse"
              >
                <div className="space-y-2">
                  <div className="h-4 w-48 bg-teal-700 rounded" />
                  <div className="h-3 w-32 bg-teal-700 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="p-4 border border-red-500 bg-red-500/20 rounded-md">
            <p className="text-white">{error}</p>
            <Button
              variant="outline"
              size="sm"
              className="mt-2 border-white text-white hover:bg-white hover:text-teal-600"
              onClick={() => window.location.reload()}
            >
              Retry
            </Button>
          </div>
        ) : supplies.length === 0 ? (
          <p className="text-sm text-teal-100 p-4">No recent supplies found</p>
        ) : (
          <div className="space-y-4">
            {supplies.map((supply) => (
              <div
                key={supply.id}
                className="p-4 border border-teal-700 rounded-md hover:bg-teal-700/50 transition-colors"
              >
                <div>
                  <h3 className="font-medium text-white">{supply.hospital_name}</h3>
                  <p className="text-sm text-teal-200">
                    {format(new Date(supply.date), "PPP")} • RWF
                    {Number(supply.total_price).toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </p>
                </div>
              </div>
            ))}
            <div className="flex justify-end pt-2">
              <Button
                variant="ghost"
                className="text-white hover:text-teal-200 hover:bg-transparent"
                onClick={handleViewAllSupplies}
              >
                View all supplies
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default RecentSupplies
