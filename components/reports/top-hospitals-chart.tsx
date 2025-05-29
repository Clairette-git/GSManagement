"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

interface TopHospitalsChartProps {
  data: Array<{ hospital_name: string; count: number }>
}

export function TopHospitalsChart({ data }: TopHospitalsChartProps) {
  const chartData = data.map((item) => ({
    name: item.hospital_name.length > 15 ? item.hospital_name.substring(0, 15) + "..." : item.hospital_name,
    supplies: item.count,
  }))

  return (
    <Card className="hover:shadow-xl hover:scale-[1.02] hover:-translate-y-1 transition-all duration-300 ease-in-out transform cursor-pointer ">
  <CardHeader>
    <CardTitle className="text-lg font-semibold">Top Hospitals by Supply Count</CardTitle>
  </CardHeader>
  <CardContent>
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData} style={{ backgroundColor: 'transparent' }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.2)" />
        <XAxis 
          dataKey="name" 
          tick={{ fill: 'white' }}
          axisLine={{ stroke: 'white' }}
          tickLine={{ stroke: 'white' }}
        />
        <YAxis 
          tick={{ fill: 'white' }}
          axisLine={{ stroke: 'white' }}
          tickLine={{ stroke: 'white' }}
        />
        <Tooltip 
              cursor={false}
              contentStyle={{ 
                border: '1px solid #38b2ac ',
                borderRadius: '8px',
                color: 'white'
              }}
              labelStyle={{ color: 'teal' }}
            />
        <Bar dataKey="supplies" fill="#37c0c4" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  </CardContent>
</Card>
  )
}