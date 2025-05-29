"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts"
import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"

interface InventoryItem {
  gas_type_id: number
  gas_name: string
  total_cylinders: number
  total_liters: number
}

const COLORS = [
  "#7aebeb",
  "#5de6e6",
  "#40e0e0",
  "#23dbdb",
  "#1cc6c6",
  "#19b1b1",
  "#169c9c",
  "#138787",
  "#107272",
  "#0d5d5d",
]

// Sample data for testing
const SAMPLE_DATA = [
  { gas_type_id: 1, gas_name: "Oxygen", total_cylinders: 25, total_liters: 500 },
  { gas_type_id: 2, gas_name: "Nitrogen", total_cylinders: 15, total_liters: 300 },
  { gas_type_id: 3, gas_name: "Helium", total_cylinders: 10, total_liters: 200 },
  { gas_type_id: 4, gas_name: "Carbon Dioxide", total_cylinders: 5, total_liters: 100 },
]

export default function InventorySummaryChart() {
  const [loading, setLoading] = useState(true)
  const [inventory, setInventory] = useState<InventoryItem[]>([])
  const [error, setError] = useState<string | null>(null)
  const [debugInfo, setDebugInfo] = useState<any>(null)
  const [useSampleData, setUseSampleData] = useState(false)

  const fetchInventory = async () => {
    if (useSampleData) {
      setInventory(SAMPLE_DATA)
      setLoading(false)
      setError(null)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/inventory/summary")

      // Store the response status for debugging
      setDebugInfo((prev: any) => ({
        ...prev,
        status: response.status,
        statusText: response.statusText,
      }))

      // Handle non-200 responses
      if (!response.ok) {
        throw new Error(`API returned ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()

      // Store the raw response for debugging
      setDebugInfo((prev: any) => ({ ...prev, rawData: data }))

      // Check if data.data exists and is an array
      if (!data.data || !Array.isArray(data.data)) {
        throw new Error("API response doesn't contain an array at data.data")
      }

      // Check if the array is empty
      if (data.data.length === 0) {
        setInventory([])
        setError("No inventory data found in the database")
      } else {
        setInventory(data.data)
      }
    } catch (error) {
      console.error("Error fetching inventory:", error)
      setError(error instanceof Error ? error.message : "Unknown error occurred")
      setInventory([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchInventory()
  }, [useSampleData])

  // Prepare data for pie chart
  const chartData = inventory.map((item) => ({
    name: item.gas_name,
    value: item.total_liters,
    cylinders: item.total_cylinders,
  }))

  // Custom tooltip for the pie chart
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-teal-800 p-2 rounded border border-teal-700 text-white text-sm">
          <p className="font-bold">{payload[0].name}</p>
          <p>{payload[0].value} Liters</p>
          <p>{payload[0].payload.cylinders} Cylinders</p>
        </div>
      )
    }
    return null
  }

  return (
    <Card className="bg-teal-600 text-white">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="text-xl font-bold">Inventory Summary</CardTitle>
          <CardDescription className="text-teal-200">Distribution of gas types by volume</CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-8 border-teal-500 bg-teal-700 text-white hover:bg-teal-800"
            onClick={() => fetchInventory()}
          >
            <RefreshCw className="h-4 w-4 mr-1" />
            Refresh
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-8 border-teal-500 bg-teal-700 text-white hover:bg-teal-800"
            onClick={() => setUseSampleData(!useSampleData)}
          >
            {useSampleData ? "Use Real Data" : "Use Sample Data"}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center h-[300px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-[300px] space-y-4">
            <p className="text-sm text-teal-200 text-center">{error}</p>
            {debugInfo && (
              <div className="bg-teal-700 p-3 rounded text-xs max-w-full overflow-auto">
                <p className="font-bold mb-1">Debug Information:</p>
                <pre className="whitespace-pre-wrap">{JSON.stringify(debugInfo, null, 2)}</pre>
              </div>
            )}
          </div>
        ) : inventory.length === 0 ? (
          <div className="flex items-center justify-center h-[300px]">
            <p className="text-sm text-teal-200">No inventory data available</p>
          </div>
        ) : (
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  nameKey="name"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
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
