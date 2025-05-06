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
    <Card className="bg-teal-700 border-teal-600">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-medium text-white">Completed Tasks</CardTitle>
            <p className="text-sm text-teal-200 mt-1">+15% from last week</p>
          </div>
          <Badge
            variant="outline"
            className="text-xs bg-teal-600 text-teal-100 border-teal-500 cursor-pointer"
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
              <XAxis dataKey="day" stroke="#5eead4" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis
                stroke="#5eead4"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${value}`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#115e59",
                  border: "1px solid #0f766e",
                  borderRadius: "0.375rem",
                  color: "#f0fdfa",
                }}
                itemStyle={{ color: "#5eead4" }}
                formatter={(value) => [`${value} tasks`, "Completed"]}
                labelStyle={{ color: "#99f6e4" }}
              />
              <Line
                type="monotone"
                dataKey="tasks"
                stroke="#0ea5e9"
                strokeWidth={2}
                dot={{ r: 4, fill: "#0ea5e9", strokeWidth: 0 }}
                activeDot={{ r: 6, fill: "#0ea5e9", stroke: "#115e59", strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
