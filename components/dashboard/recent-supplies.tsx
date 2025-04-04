"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { Supply } from "@/types"
import { useEffect, useState } from "react"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { Eye } from "lucide-react"
import Link from "next/link"

export default function RecentSupplies() {
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
    <Card>
      <CardHeader>
        <CardTitle>Recent Supplies</CardTitle>
        <CardDescription>Latest gas deliveries to hospitals</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center justify-between p-4 border rounded-md animate-pulse">
                <div className="space-y-2">
                  <div className="h-4 w-48 bg-muted rounded" />
                  <div className="h-3 w-32 bg-muted rounded" />
                </div>
                <div className="h-8 w-20 bg-muted rounded" />
              </div>
            ))}
          </div>
        ) : supplies.length === 0 ? (
          <p className="text-sm text-muted-foreground">No recent supplies</p>
        ) : (
          <div className="space-y-4">
            {supplies.map((supply) => (
              <div key={supply.id} className="flex items-center justify-between p-4 border rounded-md">
                <div>
                  <h3 className="font-medium">{supply.hospital_name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(supply.date), "PPP")} • ${Number(supply.total_price).toFixed(2)}
                  </p>
                </div>
                <Link href={`/supplies/${supply.id}`}>
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4 mr-2" />
                    View
                  </Button>
                </Link>
              </div>
            ))}
            <div className="flex justify-end">
              <Link href="/supplies">
                <Button variant="link">View all supplies →</Button>
              </Link>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

