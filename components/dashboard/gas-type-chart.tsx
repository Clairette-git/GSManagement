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
   
<Card className={`bg-teal-600 border-teal-600 ${className}`}>
  <CardHeader>
    <CardTitle className="text-lg font-medium text-white">Gas Types and Prices</CardTitle>
    <CardDescription className="text-custom-lighter">Price per liter for each gas type</CardDescription>
  </CardHeader>
  <CardContent className="pl-2">
    {isLoading ? (
      <div className="flex items-center justify-center h-[250px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    ) : (
      <div className="h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <XAxis dataKey="name" stroke="#ffffff" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis
              stroke="#ffffff"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `RWF${value}`}
            />
            <CartesianGrid strokeDasharray="3 3" stroke="#0f766e" vertical={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#115e59",
                    border: "1px solid #0f766e",
                    borderRadius: "0.375rem",
                    color: "#f0fdfa",
                  }}
                  formatter={(value) => [`RWF${value}`, "Price per Liter"]}
                  labelStyle={{ color: "#99f6e4" }}
                />
                <Bar dataKey="price" fill="#7aebeb" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
        </ResponsiveContainer>
      </div>
    )}
  </CardContent>
</Card>
  )
}
