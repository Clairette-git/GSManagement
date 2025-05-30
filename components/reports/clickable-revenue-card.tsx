"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Wallet } from "lucide-react"
import { useRouter } from "next/navigation"

interface ClickableRevenueCardProps {
  value: number
  period: string
}

export function ClickableRevenueCard({ value, period }: ClickableRevenueCardProps) {
  const router = useRouter()

  const handleClick = () => {
    router.push("/supplies")
  }

  return (
    <Card
      className="bg-teal-700 border-teal-600 cursor-pointer hover:bg-teal-700 transition-colors"
      onClick={handleClick}
    >
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-teal-100">Total Revenue</h3>
          <div className="p-2 rounded-md bg-amber-500/10 text-amber-500 border-amber-500/20">
            <Wallet className="h-5 w-5" />
          </div>
        </div>
        <div className="text-2xl font-bold text-white">
          RWF {value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
        <p className="text-xs text-teal-200 mt-1">
          {period === "day"
            ? "Today"
            : period === "week"
              ? "This week"
              : period === "month"
                ? "This month"
                : "This year"}
          {" - Click to view all supplies"}
        </p>
      </CardContent>
    </Card>
  )
}
