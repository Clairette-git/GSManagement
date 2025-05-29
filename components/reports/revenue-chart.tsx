"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

interface RevenueChartProps {
  data: Array<{ day: string; total: number }>
}

export function RevenueChart({ data }: RevenueChartProps) {
  const chartData = data.map((item) => ({
    date: new Date(item.day).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    revenue: item.total,
  }))

  return (
   <Card className="hover:shadow-lg hover:scale-105 transition-all duration-200 ease-out transform hover:animate-pulse">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Revenue Trend</CardTitle>
      </CardHeader>
      <CardContent className="text-white">
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="date" 
              tick={{ fill: 'white' }}
              axisLine={{ stroke: 'white' }}
              tickLine={{ stroke: 'white' }}
            />
            <YAxis 
              tick={{ fill: 'white' }}
              axisLine={{ stroke: 'white' }}
              tickLine={{ stroke: 'white' }}
            />
            <Tooltip formatter={(value) => [`RWF${value}`, "Revenue"]} 
              cursor={false}
              contentStyle={{ 
                border: '1px solid #38b2ac ',
                borderRadius: '8px',
                color: 'white'
              }}
              labelStyle={{ color: 'teal' }}/>
              
            <Line
              type="monotone"
              dataKey="revenue"
              stroke="#10b981"
              strokeWidth={3}
              dot={{ fill: "#37c0c4", strokeWidth: 2, r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}