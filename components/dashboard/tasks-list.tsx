"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Play, CheckCircle } from "lucide-react"

export function TasksList() {
  const [tasks, setTasks] = useState([
    {
      id: 1,
      name: "Inventory Check",
      status: "in progress",
      deadline: "Dec 30",
      timeSpent: "2h 30m",
    },
    {
      id: 2,
      name: "Cylinder Maintenance",
      status: "completed",
      deadline: "Dec 21",
      timeSpent: "1h 15m",
    },
    {
      id: 3,
      name: "Supply Approval",
      status: "in progress",
      deadline: "Dec 25",
      timeSpent: "2h 45m",
    },
    {
      id: 4,
      name: "Monthly Report",
      status: "pending",
      deadline: "Dec 31",
      timeSpent: "0h 0m",
    },
  ])

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-medium">Tasks List</CardTitle>
          <Badge variant="outline" className="text-xs bg-gray-700 text-gray-300 border-gray-600">
            Filter
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-1">
          <div className="grid grid-cols-12 text-xs text-gray-500 py-2">
            <div className="col-span-5">Name</div>
            <div className="col-span-3">Status</div>
            <div className="col-span-2">Deadline</div>
            <div className="col-span-2">Time</div>
          </div>

          {tasks.map((task) => (
            <div key={task.id} className="grid grid-cols-12 items-center py-3 border-t border-gray-700">
              <div className="col-span-5 font-medium">{task.name}</div>
              <div className="col-span-3">
                <Badge
                  variant="outline"
                  className={`
                    ${task.status === "in progress" ? "bg-blue-500/10 text-blue-400 border-blue-500/20" : ""}
                    ${task.status === "completed" ? "bg-green-500/10 text-green-400 border-green-500/20" : ""}
                    ${task.status === "pending" ? "bg-amber-500/10 text-amber-400 border-amber-500/20" : ""}
                  `}
                >
                  {task.status}
                </Badge>
              </div>
              <div className="col-span-2 text-sm text-gray-400">{task.deadline}</div>
              <div className="col-span-1 text-sm text-gray-400">{task.timeSpent}</div>
              <div className="col-span-1 flex justify-end">
                {task.status === "completed" ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <button className="h-5 w-5 rounded-full bg-blue-500 flex items-center justify-center">
                    <Play className="h-3 w-3 text-white" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
