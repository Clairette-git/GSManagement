"use client"

import type React from "react"

import { Card, CardContent } from "@/components/ui/card"
import type { Supply } from "@/types"
import { useEffect, useState } from "react"
import { Cylinder, Droplet, TruckIcon, DollarSign,Wallet, CreditCard, Banknote, BanknoteIcon } from "lucide-react"

export default function DashboardStats() {
  const [stats, setStats] = useState<{
    totalCylinders: number
    totalGasTypes: number
    totalSupplies: number
    totalRevenue: number
    isLoading: boolean
  }>({
    totalCylinders: 0,
    totalGasTypes: 0,
    totalSupplies: 0,
    totalRevenue: 0,
    isLoading: true,
  })

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [cylindersRes, gasTypesRes, suppliesRes] = await Promise.all([
          fetch("/api/cylinders"),
          fetch("/api/gas-types"),
          fetch("/api/supplies"),
        ])

        const [cylinders, gasTypes, supplies] = await Promise.all([
          cylindersRes.json(),
          gasTypesRes.json(),
          suppliesRes.json(),
        ])

        const totalRevenue = supplies.data.reduce((acc: number, supply: Supply) => acc + Number(supply.total_price), 0)

        setStats({
          totalCylinders: cylinders.data.length,
          totalGasTypes: gasTypes.data.length,
          totalSupplies: supplies.data.length,
          totalRevenue,
          isLoading: false,
        })
      } catch (error) {
        console.error("Error fetching dashboard stats:", error)
        setStats((prev) => ({ ...prev, isLoading: false }))
      }
    }

    fetchStats()
  }, [])

  if (stats.isLoading) {
    return (
      <>
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="bg-gray-800 border-gray-700 animate-pulse">
            <CardContent className="p-6">
              <div className="h-10 bg-gray-700 rounded-md mb-2"></div>
              <div className="h-6 bg-gray-700 rounded-md w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </>
    )
  }

  return (
    <>
      <StatCard
        title="Total Cylinders"
        value={stats.totalCylinders}
        description="Cylinders in the system"
        icon={<Cylinder className="h-5 w-5" />}
        color="blue"
      />
      <StatCard
        title="Gas Types"
        value={stats.totalGasTypes}
        description="Different gas types available"
        icon={<Droplet className="h-5 w-5" />}
        color="green"
      />
      <StatCard
        title="Total Supplies"
        value={stats.totalSupplies}
        description="Completed gas deliveries"
        icon={<TruckIcon className="h-5 w-5" />}
        color="purple"
      />
      <StatCard
        title="Total Revenue"
        value={`RWF${stats.totalRevenue.toFixed(2)}`}
        description="Revenue from all supplies"
        icon={<BanknoteIcon className="h-5 w-5" />}
        color="amber"
      />
    </>
  )
}

interface StatCardProps {
  title: string
  value: number | string
  description: string
  icon: React.ReactNode
  color: "blue" | "green" | "purple" | "amber"
}

function StatCard({ title, value, description, icon, color }: StatCardProps) {
  const colorClasses = {
    blue: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    green: "bg-green-500/10 text-green-500 border-green-500/20",
    purple: "bg-purple-500/10 text-purple-500 border-purple-500/20",
    amber: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  }

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-gray-400">{title}</h3>
          <div className={`p-2 rounded-md ${colorClasses[color]}`}>{icon}</div>
        </div>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-gray-500 mt-1">{description}</p>
      </CardContent>
    </Card>
  )
}
