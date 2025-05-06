"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useEffect, useState } from "react"

interface InventorySummaryProps {
  className?: string
}

export default function InventorySummary({ className }: InventorySummaryProps) {
  const [inventory, setInventory] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const response = await fetch("/api/inventory/summary")
        const data = await response.json()
        setInventory(data.data)
        setIsLoading(false)
      } catch (error) {
        console.error("Error fetching inventory summary:", error)
        setIsLoading(false)
      }
    }

    fetchInventory()
  }, [])

  return (
    <Card className="bg-teal-700 border-teal-600">
      <CardHeader>
        <CardTitle className="text-lg font-medium">Inventory Summary</CardTitle>
        <CardDescription className="text-gray-400">Current gas inventory levels</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center">
                <div className="w-full h-12 bg-gray-700 animate-pulse rounded-md" />
              </div>
            ))}
          </div>
        ) : inventory.length === 0 ? (
          <p className="text-sm text-gray-400">No inventory data available</p>
        ) : (
          <div className="space-y-6">
            {inventory.map((item) => (
              <div key={item.gas_type_id} className="flex items-center">
                <div className="w-full">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">{item.gas_name}</span>
                    <span className="text-sm text-gray-400">
                      {item.total_liters} liters ({item.total_cylinders} cylinders)
                    </span>
                  </div>
                  <div className="w-full bg-gray-700 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-blue-500 h-full"
                      style={{ width: `${Math.min(100, (item.total_liters / 1000) * 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}