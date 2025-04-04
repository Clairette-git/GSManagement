"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { Supply } from "@/types"
import { useEffect, useState } from "react"
import { Loader2 } from "lucide-react"

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
          <Card key={i} className="animate-pulse">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Loading...</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
              <p className="text-xs text-muted-foreground">Loading data...</p>
            </CardContent>
          </Card>
        ))}
      </>
    )
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium">Total Cylinders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalCylinders}</div>
          <p className="text-xs text-muted-foreground">Cylinders in the system</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium">Gas Types</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalGasTypes}</div>
          <p className="text-xs text-muted-foreground">Different gas types available</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium">Total Supplies</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalSupplies}</div>
          <p className="text-xs text-muted-foreground">Completed gas deliveries</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${stats.totalRevenue.toFixed(2)}</div>
          <p className="text-xs text-muted-foreground">Revenue from all supplies</p>
        </CardContent>
      </Card>
    </>
  )
}

