"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { Supply } from "@/types"
import { useEffect, useState } from "react"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { Eye, ArrowRight } from "lucide-react"
import Link from "next/link"

interface RecentSuppliesProps {
  className?: string
}

export default function RecentSupplies({ className }: RecentSuppliesProps) {
  const [supplies, setSupplies] = useState<Supply[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchSupplies = async () => {
      try {
        const response = await fetch("/api/supplies?limit=5")
        const data = await response.json()
        setSupplies(data.data)
        setIsLoading(false)
      } catch (error) {
        console.error("Error fetching recent supplies:", error)
        setIsLoading(false)
      }
    }

    fetchSupplies()
  }, [])

  return (
    <Card className={`bg-gray-800 border-gray-700 ${className}`}>
      <CardHeader>
        <CardTitle className="text-lg font-medium">Recent Supplies</CardTitle>
        <CardDescription className="text-gray-400">Latest gas deliveries to hospitals</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="flex items-center justify-between p-4 border border-gray-700 rounded-md animate-pulse"
              >
                <div className="space-y-2">
                  <div className="h-4 w-48 bg-gray-700 rounded" />
                  <div className="h-3 w-32 bg-gray-700 rounded" />
                </div>
                <div className="h-8 w-20 bg-gray-700 rounded" />
              </div>
            ))}
          </div>
        ) : supplies.length === 0 ? (
          <p className="text-sm text-gray-400">No recent supplies</p>
        ) : (
          <div className="space-y-4">
            {supplies.map((supply) => (
              <div
                key={supply.id}
                className="flex items-center justify-between p-4 border border-gray-700 rounded-md hover:bg-gray-700/50 transition-colors"
              >
                <div>
                  <h3 className="font-medium">{supply.hospital_name}</h3>
                  <p className="text-sm text-gray-400">
                    {format(new Date(supply.date), "PPP")} • RWF{Number(supply.total_price).toFixed(2)}
                  </p>
                </div>
                <Link href={`/supplies/${supply.id}`}>
                  <Button variant="outline" size="sm" className="border-gray-600 bg-gray-700 hover:bg-gray-600">
                    <Eye className="h-4 w-4 mr-2" />
                    View
                  </Button>
                </Link>
              </div>
            ))}
            <div className="flex justify-end">
              <Link href="/supplies">
                <Button variant="ghost" className="text-blue-400 hover:text-blue-300 hover:bg-transparent">
                  View all supplies
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
