"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Package,
  Truck,
  RotateCcw,
  Building,
  DollarSign,
  FileText,
  TrendingUp,
  TrendingDown,
  Minus,
} from "lucide-react"

interface MetricCardProps {
  title: string
  value: string | number
  description: string
  icon: string
  trend?: number
  color: "teal" | "blue" | "purple" | "indigo" | "emerald" | "amber"
}

const iconMap = {
  package: Package,
  truck: Truck,
  "rotate-ccw": RotateCcw,
  building: Building,
  "dollar-sign": DollarSign,
  "file-text": FileText,
}

const colorMap = {
  teal: "text-teal-600 bg-teal-50",
  blue: "text-blue-600 bg-blue-50",
  purple: "text-purple-600 bg-purple-50",
  indigo: "text-indigo-600 bg-indigo-50",
  emerald: "text-emerald-600 bg-emerald-50",
  amber: "text-amber-600 bg-amber-50",
}

export function MetricCard({ title, value, description, icon, trend, color }: MetricCardProps) {
  const IconComponent = iconMap[icon as keyof typeof iconMap] || Package

  const getTrendIcon = () => {
    if (trend === undefined || trend === 0) return <Minus className="h-3 w-3" />
    return trend > 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />
  }

  const getTrendColor = () => {
    if (trend === undefined || trend === 0) return "text-gray-500"
    return trend > 0 ? "text-green-600" : "text-red-600"
  }

  return (
    <Card className="hover:shadow-lg transition-shadow duration-200 ease-in-out transform cursor-pointer">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-white">{title}</CardTitle>
        <div className={`p-2 rounded-md ${colorMap[color]}`}>
          <IconComponent className="h-4 w-4" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-white">{value}</div>
        <div className="flex items-center justify-between mt-1 ">
          <p className="text-xs text-white">{description}</p>
          {trend !== undefined && (
            <Badge variant="outline" className={`${getTrendColor()} border-current`}>
              {getTrendIcon()}
              <span className="ml-1">{Math.abs(trend)}%</span>
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
