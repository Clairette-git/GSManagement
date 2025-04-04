"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { GasType } from "@/types"
import { useEffect, useState } from "react"
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

interface GasTypeChartProps {
  className?: string
}

export function GasTypeChart({ className }: GasTypeChartProps) {
  const [gasTypes, setGasTypes] = useState<GasType[]>([])
  const [isLoading, setIsLoading] = useState(true)

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

  const chartData = gasTypes.map((gasType) => ({
    name: gasType.name,
    price: Number(gasType.price_per_liter),
  }))

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Gas Types and Prices</CardTitle>
        <CardDescription>Price per liter for each gas type</CardDescription>
      </CardHeader>
      <CardContent className="pl-2">
        {isLoading ? (
          <div className="flex items-center justify-center h-80">
            <p>Loading chart data...</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={chartData}>
              <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `$${value}`}
              />
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <Tooltip
                formatter={(value) => [`$${value}`, "Price per Liter"]}
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #ccc",
                  borderRadius: "4px",
                  padding: "8px",
                }}
              />
              <Bar dataKey="price" fill="#0365ff" radius={[4, 4, 0, 0]} className="fill-primary" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}

