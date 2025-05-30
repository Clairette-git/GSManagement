"use client"

import { Card, CardContent } from "@/components/ui/card"
import { FileText } from "lucide-react"
import { useRouter } from "next/navigation"

interface ClickableInvoicesCardProps {
  value: number
  period: string
}

export function ClickableInvoicesCard({ value, period }: ClickableInvoicesCardProps) {
  const router = useRouter()

  const handleClick = () => {
    router.push("/invoices")
  }

  return (
    <Card
      className="bg-teal-700 border-teal-600 cursor-pointer hover:bg-teal-700 transition-colors"
      onClick={handleClick}
    >
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-teal-100">Invoices Generated</h3>
          <div className="p-2 rounded-md bg-indigo-500/10 text-indigo-500 border-indigo-500/20">
            <FileText className="h-5 w-5" />
          </div>
        </div>
        <div className="text-2xl font-bold text-white">{value}</div>
        <p className="text-xs text-teal-200 mt-1">
          {period === "day"
            ? "Today"
            : period === "week"
              ? "This week"
              : period === "month"
                ? "This month"
                : "This year"}
          {" - Click to view all invoices"}
        </p>
      </CardContent>
    </Card>
  )
}
