"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useEffect, useState, useRef } from "react"
import { Bar, BarChart, Cell, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"
import type { Cylinder } from "@/types"

interface CylinderStatusChartProps {
  className?: string
}

export function CylinderStatusChart({ className }: CylinderStatusChartProps) {
  const [cylinders, setCylinders] = useState<Cylinder[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [chartData, setChartData] = useState<{ name: string; count: number }[]>([])
  const [activeIndex, setActiveIndex] = useState<number | undefined>(undefined)
  const [animatedCount, setAnimatedCount] = useState(0)
  const [isHovering, setIsHovering] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const animationRef = useRef<NodeJS.Timeout | null>(null)

  // Fetch cylinders
  useEffect(() => {
    const fetchData = async () => {
      try {
        const cylindersRes = await fetch("/api/cylinders")
        const cylindersData = await cylindersRes.json()

        setCylinders(cylindersData.data)
        setIsLoading(false)
      } catch (error) {
        console.error("Error fetching data:", error)
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  // Process data for the chart
  useEffect(() => {
    if (cylinders.length === 0) return

    // Count cylinders by status
    const statusCounts = {
      "in stock": 0,
      delivered: 0,
      returned: 0,
      filling: 0,
      filled: 0,
      empty: 0,
    }

    cylinders.forEach((cylinder) => {
      // Count by status
      if (statusCounts.hasOwnProperty(cylinder.status)) {
        statusCounts[cylinder.status as keyof typeof statusCounts]++
      }
    })

    // Calculate the new categories
    const allCylinders = cylinders.length
    const returnedCylinders = statusCounts["returned"]
    const notReturnedCylinders = statusCounts["delivered"]
    const usedCylinders = returnedCylinders + notReturnedCylinders

    const newChartData = [
      { name: "All Cylinders", count: allCylinders },
      { name: "Used Cylinders", count: usedCylinders },
      { name: "Returned", count: returnedCylinders },
      { name: "Not Returned", count: notReturnedCylinders },
    ]

    setChartData(newChartData)
  }, [cylinders])

  // Function to animate count to a target value
  const animateCountToValue = (targetCount: number) => {
    const duration = 1000 // Animation duration in ms
    const steps = 25 // Number of steps in the animation
    const stepDuration = duration / steps
    let currentStep = 0
    const startCount = animatedCount

    // Clear any existing animation
    if (animationRef.current) {
      clearInterval(animationRef.current)
    }

    // Set up interval to animate the count
    animationRef.current = setInterval(() => {
      currentStep++

      if (currentStep <= steps) {
        // Calculate the current animated value with easing
        const progress = currentStep / steps
        const easedProgress = 1 - Math.pow(1 - progress, 3)
        const newCount = Math.round(startCount + (targetCount - startCount) * easedProgress)
        setAnimatedCount(newCount)
      } else {
        // Animation complete, set final value
        setAnimatedCount(targetCount)
        if (animationRef.current) {
          clearInterval(animationRef.current)
        }
      }
    }, stepDuration)
  }

  // Animate the count when active index changes
  useEffect(() => {
    if (activeIndex === undefined || !chartData[activeIndex]) return

    const targetCount = chartData[activeIndex].count
    animateCountToValue(targetCount)
  }, [activeIndex, chartData])

  // Set up animation for tooltips when not hovering
  useEffect(() => {
    if (chartData.length === 0 || isLoading) return

    // Start with the first bar
    setActiveIndex(0)

    // Set up interval to cycle through bars
    const cycleTooltips = () => {
      setActiveIndex((prevIndex) => {
        if (prevIndex === undefined) return 0
        return (prevIndex + 1) % chartData.length
      })
    }

    intervalRef.current = setInterval(cycleTooltips, 3000)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [chartData, isLoading])

  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) return null

    const data = payload[0].payload

    // Get appropriate tooltip text based on category
    let tooltipText = `${data.count} Cylinders`

    if (data.name === "Used Cylinders") {
      tooltipText = `${data.count} Cylinders (Delivered + Returned)`
    } else if (data.name === "Not Returned") {
      tooltipText = `${data.count} Cylinders (Delivered)`
    }

    return (
      <div className="bg-teal-700 text-white p-2 rounded shadow-lg border border-teal-600 animate-fadeIn">
        <p className="font-medium">{data.name}</p>
        <p className="text-teal-200">{tooltipText}</p>
      </div>
    )
  }

  // Handle mouse enter on bar
  const handleMouseEnter = (data: any, index: number) => {
    setIsHovering(true)
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }
    setActiveIndex(index)
  }

  // Handle mouse leave from chart
  const handleMouseLeave = () => {
    setIsHovering(false)
    // Restart the automatic cycling
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }

    intervalRef.current = setInterval(() => {
      setActiveIndex((prevIndex) => {
        if (prevIndex === undefined) return 0
        return (prevIndex + 1) % chartData.length
      })
    }, 3000)
  }

  return (
    <Card className={`bg-teal-600 border-teal-600 ${className}`}>
      <CardHeader>
        <CardTitle className="text-lg font-medium text-white">Cylinder Status</CardTitle>
        <CardDescription className="text-teal-200">Distribution of cylinders by status</CardDescription>
      </CardHeader>
      <CardContent className="pl-2">
        {isLoading ? (
          <div className="flex items-center justify-center h-[250px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          </div>
        ) : (
          <div className="h-[250px] relative">
            {/* Animated count display in the center */}
            <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
              <div
                className={`text-center transition-all duration-500 ${isHovering ? "scale-110" : "animate-pulse"}`}
                style={{
                  animationDuration: "2s",
                }}
              >
                <div
                  className={`text-5xl font-bold transition-all duration-300 ${
                    isHovering ? "animate-bounce" : "animate-pulse"
                  }`}
                  style={{
                    color: "#2dd4bf", // teal-400
                    textShadow: "0 0 15px rgba(45, 212, 191, 0.6)",
                    filter: "drop-shadow(0 0 5px rgba(45, 212, 191, 0.4))",
                    animationDuration: isHovering ? "0.8s" : "2s",
                  }}
                >
                  {animatedCount}
                </div>
                <div
                  className={`text-sm font-semibold mt-1 transition-all duration-300 text-teal-100 ${
                    isHovering ? "" : "animate-pulse"
                  }`}
                  style={{
                    animationDuration: "2s",
                  }}
                >
                  {chartData[activeIndex || 0]?.name}
                </div>
              </div>
            </div>

            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 30, right: 30, left: 20, bottom: 5 }}
                onMouseLeave={handleMouseLeave}
              >
                <XAxis dataKey="name" stroke="#ffffff" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#ffffff" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255, 255, 255, 0.1)" }} />
                <Bar dataKey="count" radius={[4, 4, 0, 0]} barSize={40} onMouseEnter={handleMouseEnter}>
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={index === activeIndex ? "#34d399" : "#2dd4bf"} // teal-400 for inactive, slightly lighter for active
                      className={index === activeIndex ? "animate-pulse" : ""}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
