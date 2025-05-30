"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"

interface CylinderStatusChartProps {
  data: Array<{ status: string; count: number }>
}

const COLORS = {
  filled: "#10b981",
  delivered: "#3b82f6",
  returned: "#f59e0b",
  empty: "#ef4444",
  maintenance: "#8b5cf6",
}

export function CylinderStatusChart({ data }: CylinderStatusChartProps) {
  console.log("🔍 Chart received data:", data)

  const chartData = data.map((item) => ({
    name: item.status.charAt(0).toUpperCase() + item.status.slice(1),
    value: item.count,
    color: COLORS[item.status as keyof typeof COLORS] || "#6b7280",
  }))

  console.log("📊 Chart data:", chartData)

  return (
    <Card className="hover:shadow-lg transition-shadow duration-200 ease-in-out transform cursor-pointer">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Cylinder Status Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
