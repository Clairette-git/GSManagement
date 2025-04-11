"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

const data = [
  { day: "Mon", tasks: 12 },
  { day: "Tue", tasks: 18 },
  { day: "Wed", tasks: 15 },
  { day: "Thu", tasks: 25 },
  { day: "Fri", tasks: 30 },
  { day: "Sat", tasks: 22 },
  { day: "Sun", tasks: 10 },
]

export function CompletionChart() {
  const [period, setPeriod] = useState("week")

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-medium">Completed Tasks</CardTitle>
            <p className="text-sm text-gray-400 mt-1">+15% from last week</p>
          </div>
          <Badge
            variant="outline"
            className="text-xs bg-gray-700 text-gray-300 border-gray-600 cursor-pointer"
            onClick={() => setPeriod(period === "week" ? "month" : "week")}
          >
            {period === "week" ? "Week" : "Month"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="h-[180px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
              <XAxis dataKey="day" stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis
                stroke="#6b7280"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${value}`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1f2937",
                  border: "1px solid #374151",
                  borderRadius: "0.375rem",
                  color: "#f9fafb",
                }}
                itemStyle={{ color: "#93c5fd" }}
                formatter={(value) => [`${value} tasks`, "Completed"]}
                labelStyle={{ color: "#d1d5db" }}
              />
              <Line
                type="monotone"
                dataKey="tasks"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ r: 4, fill: "#3b82f6", strokeWidth: 0 }}
                activeDot={{ r: 6, fill: "#3b82f6", stroke: "#1f2937", strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
