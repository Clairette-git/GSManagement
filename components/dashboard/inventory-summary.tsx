"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

interface InventoryItem {
  gas_type_id: number
  gas_name: string
  total_cylinders: number
  total_liters: number
}

export default function InventorySummary() {
  const [loading, setLoading] = useState(true)
  const [inventory, setInventory] = useState<InventoryItem[]>([])
  const [chartData, setChartData] = useState<any[]>([])
  const [activeIndex, setActiveIndex] = useState<number | null>(null)

  useEffect(() => {
    async function fetchInventory() {
      try {
        const response = await fetch("/api/inventory/summary")

        // Handle non-200 responses
        if (!response.ok) {
          console.error("Error fetching inventory:", response.statusText)
          setInventory([])
          setLoading(false)
          return
        }

        const data = await response.json()

        // Ensure data.data is an array
        setInventory(Array.isArray(data.data) ? data.data : [])
      } catch (error) {
        console.error("Error fetching inventory:", error)
        setInventory([])
      } finally {
        setLoading(false)
      }
    }

    async function fetchCylinderData() {
      try {
        // Fetch all cylinders
        const response = await fetch("/api/cylinders")

        if (!response.ok) {
          console.error("Error fetching cylinders:", response.statusText)
          return
        }

        const data = await response.json()

        if (!data.data || !Array.isArray(data.data)) {
          console.error("Invalid data format from API:", data)
          return
        }

        const cylinders = data.data

        // Calculate counts
        const allCylinders = cylinders.length
        const usedCylinders = cylinders.filter((c: { status: string }) => c.status === "delivered" || c.status === "returned").length
        const returnedCylinders = cylinders.filter((c: { status: string }) => c.status === "returned").length
        const notReturnedCylinders = cylinders.filter((c: { status: string }) => c.status === "delivered").length

        // Format data for chart
        const formattedData = [
          { name: "All Cylinders", count: allCylinders, fill: "#4ade80" },
          { name: "Used Cylinders", count: usedCylinders, fill: "#60a5fa" },
          { name: "Returned", count: returnedCylinders, fill: "#f97316" },
          { name: "Not Returned", count: notReturnedCylinders, fill: "#f43f5e" },
        ]

        setChartData(formattedData)
      } catch (error) {
        console.error("Error fetching cylinder data:", error)
      }
    }

    fetchInventory()
    fetchCylinderData()
  }, [])

  const handleMouseEnter = (_: any, index: number) => {
    setActiveIndex(index)
  }

  const handleMouseLeave = () => {
    setActiveIndex(null)
  }

  // Custom tooltip component
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-black/80 text-white p-2 rounded shadow-lg border border-gray-700 animate-fadeIn">
          <p className="font-medium">{payload[0].payload.name}</p>
          <p className="text-gray-200">{`Count: ${payload[0].payload.count}`}</p>
        </div>
      )
    }
    return null
  }

  return (
    <Card className="bg-teal-600 text-white border-teal-600">
      <CardHeader>
        <CardTitle className="text-xl font-bold">Inventory Summary</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-2">
            <div className="h-4 w-3/4 animate-pulse rounded bg-teal-700"></div>
            <div className="h-4 w-1/2 animate-pulse rounded bg-teal-700"></div>
            <div className="h-4 w-5/6 animate-pulse rounded bg-teal-700"></div>
          </div>
        ) : (
          <>
            <div className="space-y-6 mb-6">
              {inventory && inventory.length === 0 ? (
                <p className="text-sm text-teal-200">No inventory data available</p>
              ) : (
                inventory.map((item) => (
                  <div key={item.gas_type_id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{item.gas_name}</p>
                      <p className="text-sm text-teal-200">{item.total_cylinders} cylinders</p>
                    </div>
                    <p className="text-2xl font-bold">{item.total_liters} L</p>
                  </div>
                ))
              )}
            </div>

            <div className="mt-6 pt-6 border-t border-teal-500">
              <h3 className="text-lg font-medium mb-4">Cylinder Distribution</h3>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                    <XAxis
                      dataKey="name"
                      stroke="#ffffff"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      angle={-45}
                      textAnchor="end"
                      height={60}
                    />
                    <YAxis stroke="#ffffff" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar
                      dataKey="count"
                      radius={[4, 4, 0, 0]}
                      barSize={30}
                      onMouseEnter={handleMouseEnter}
                      onMouseLeave={handleMouseLeave}
                    >
                      {chartData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={entry.fill}
                          className={activeIndex === index ? "animate-pulse" : ""}
                          opacity={activeIndex === null || activeIndex === index ? 1 : 0.6}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
