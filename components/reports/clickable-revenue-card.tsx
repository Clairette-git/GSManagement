"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Wallet } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"

interface ClickableRevenueCardProps {
  value: number
  period: string
}

export function ClickableRevenueCard({ value, period }: ClickableRevenueCardProps) {
  const router = useRouter()
  const [isHovered, setIsHovered] = useState(false)

  const handleClick = () => {
    router.push("/dashboard/supplies")
  }

  const getPeriodDescription = () => {
    switch (period) {
      case "day":
        return "Today"
      case "week":
        return "This week"
      case "month":
        return "This month"
      case "year":
        return "This year"
      default:
        return "Total"
    }
  }

  return (
    <Card
      className={`w-full cursor-pointer transition-all duration-200 ${
        isHovered ? "bg-teal-700/20 border-2 border-teal-300 shadow-lg" : "border-2 border-transparent"
      }`}
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <CardContent className="p-6">
        <div className="flex flex-row items-center justify-between space-y-0 pb-2">
          <p className="text-sm font-medium text-teal-100">Total Revenue</p>
          <div className="text-emerald-400">
            <Wallet className="h-6 w-6" />
          </div>
        </div>
        <div className="text-2xl font-bold text-white">RWF {value.toLocaleString()}</div>
        <div className="flex items-center justify-between text-xs text-teal-100">
          <span>{getPeriodDescription()}</span>
          <span className="text-teal-300">Click to view supplies →</span>
        </div>
      </CardContent>
    </Card>
  )
}
