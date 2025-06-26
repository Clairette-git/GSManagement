"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { GasType } from "@/types"
import { useEffect, useState } from "react"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"

interface GasTypeChartProps {
  className?: string
}

export function GasTypeChart({ className }: GasTypeChartProps) {
  const [gasTypes, setGasTypes] = useState<GasType[]>([])
  const [isLoading, setIsLoading] = useState(true)


  const COLORS = [
    "#5eead4", // teal-300 - light teal
    "#f0f9ff", // sky-50 - almost white
    "#fde68a", // amber-200 - light amber
    "#7dd3fc", // sky-300 - light blue
    "#c4b5fd", // violet-300 - light purple
    "#fed7aa", // orange-200 - light orange
  ]

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
    value: Number(gasType.price_per_liter),
  }))

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-teal-800 p-2 rounded border border-teal-600 text-white">
          <p className="font-medium">{payload[0].name}</p>
          <p className="text-teal-200">RWF{payload[0].value.toFixed(2)} per liter</p>
         
        </div>
      )
    }
    return null
  }

  return (
    <Card className={`bg-teal-600 border-teal-600 ${className}`}>
      <CardHeader>
        <CardTitle className="text-lg font-medium text-white">Gas Types and Prices</CardTitle>
        <CardDescription className="text-teal-200">Price per liter for each gas type</CardDescription>
      </CardHeader>
      <CardContent className="pl-2">
        {isLoading ? (
          <div className="flex items-center justify-center h-[250px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          </div>
        ) : (
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  stroke="#0f766e" // teal-700 for slice borders
                  strokeWidth={1}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  layout="horizontal"
                  verticalAlign="bottom"
                  align="center"
                  formatter={(value) => <span className="text-white">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
