"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowLeft, Save, Truck, AlertCircle } from "lucide-react"
import type { Cylinder } from "@/types"

export default function CylinderAssignmentForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Form state
  const [vehiclePlate, setVehiclePlate] = useState("")
  const [driverName, setDriverName] = useState("")
  const [selectedCylinders, setSelectedCylinders] = useState<number[]>([])

  // Data state
  const [filledCylinders, setFilledCylinders] = useState<Cylinder[]>([])
  const [isLoadingCylinders, setIsLoadingCylinders] = useState(true)

  useEffect(() => {
    const fetchFilledCylinders = async () => {
      setIsLoadingCylinders(true)
      setError(null)

      try {
        const response = await fetch("/api/cylinders")

        if (!response.ok) {
          throw new Error(`Failed to fetch cylinders: ${response.status}`)
        }

        const data = await response.json()

        // Filter only filled cylinders that are active
        const filled = (data.data || []).filter(
          (cylinder: Cylinder) => cylinder.status === "filled" && cylinder.is_active !== false,
        )

        setFilledCylinders(filled)
      } catch (err) {
        console.error("Error fetching filled cylinders:", err)
        setError(err instanceof Error ? err.message : "Failed to load cylinders")
      } finally {
        setIsLoadingCylinders(false)
      }
    }

    fetchFilledCylinders()
  }, [])

  const handleToggleCylinder = (cylinderId: number) => {
    setSelectedCylinders((prev) =>
      prev.includes(cylinderId) ? prev.filter((id) => id !== cylinderId) : [...prev, cylinderId],
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!vehiclePlate.trim()) {
      setError("Vehicle plate number is required")
      return
    }

    if (!driverName.trim()) {
      setError("Driver name is required")
      return
    }

    if (selectedCylinders.length === 0) {
      setError("Please select at least one cylinder")
      return
    }

    setIsLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await fetch("/api/cylinders/assign", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          vehicle_plate: vehiclePlate,
          driver_name: driverName,
          cylinder_ids: selectedCylinders,
        }),
      })

      if (!response.ok) {
        let errorMessage = "Failed to assign cylinders"
        try {
          // Check if there's content to parse
          const text = await response.text()
          if (text) {
            const errorData = JSON.parse(text)
            errorMessage = errorData.message || errorMessage
          }
        } catch (parseError) {
          console.error("Error parsing error response:", parseError)
        }
        throw new Error(errorMessage)
      }

      setSuccess("Cylinders successfully assigned to vehicle")

      // Clear form after successful submission
      setSelectedCylinders([])
      setVehiclePlate("")
      setDriverName("")

      // Refresh the cylinder list
      const cylindersRes = await fetch("/api/cylinders")
      const cylindersData = await cylindersRes.json()

      // Filter only filled cylinders that are active
      const filled = (cylindersData.data || []).filter(
        (cylinder: Cylinder) => cylinder.status === "filled" && cylinder.is_active !== false,
      )

      setFilledCylinders(filled)
    } catch (err) {
      console.error("Error assigning cylinders:", err)
      setError(err instanceof Error ? err.message : "Failed to assign cylinders")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card className="bg-white border-gray-200 shadow-sm">
        <CardHeader className="border-b border-gray-200 bg-gray-50">
          <div className="flex items-center gap-2 mb-2">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-gray-500 hover:text-gray-700"
              onClick={() => router.push("/cylinders")}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <CardTitle className="text-xl font-semibold text-gray-900">Assign Cylinders to Vehicle</CardTitle>
          </div>
          <CardDescription className="text-gray-500">
            Select filled cylinders and assign them to a vehicle for delivery
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6 p-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
              <div className="flex items-start">
                <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 mr-2" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-4">
              <div className="flex items-start">
                <AlertCircle className="h-5 w-5 text-green-500 mt-0.5 mr-2" />
                <p className="text-sm text-green-700">{success}</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="vehicle-plate" className="text-gray-700">
                Vehicle Plate Number
              </Label>
              <Input
                id="vehicle-plate"
                placeholder="e.g., RAB 123A"
                value={vehiclePlate}
                onChange={(e) => setVehiclePlate(e.target.value)}
                required
                className="border-gray-300 focus:border-blue-500 text-gray-900 placeholder:text-gray-400"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="driver-name" className="text-gray-700">
                Driver Name
              </Label>
              <Input
                id="driver-name"
                placeholder="Enter driver name"
                value={driverName}
                onChange={(e) => setDriverName(e.target.value)}
                required
                className="border-gray-300 focus:border-blue-500 text-gray-900 placeholder:text-gray-400"
              />
            </div>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Select Filled Cylinders</h3>

            {isLoadingCylinders ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin h-8 w-8 border-2 border-blue-500 border-t-transparent rounded-full"></div>
              </div>
            ) : filledCylinders.length === 0 ? (
              <div className="text-center py-8 border border-dashed border-gray-300 rounded-lg bg-gray-50">
                <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                  <Truck className="h-6 w-6 text-gray-400" />
                </div>
                <h4 className="text-sm font-medium text-gray-900 mb-1">No filled cylinders available</h4>
                <p className="text-xs text-gray-500 mb-3">
                  All filled cylinders have already been assigned or delivered
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="border-gray-300 text-gray-700"
                  onClick={() => router.push("/cylinders")}
                >
                  Go to Cylinders
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filledCylinders.map((cylinder) => (
                  <div
                    key={cylinder.id}
                    className={`border rounded-lg p-4 ${
                      selectedCylinders.includes(cylinder.id)
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 bg-white"
                    }`}
                  >
                    <div className="flex items-start">
                      <Checkbox
                        id={`cylinder-${cylinder.id}`}
                        checked={selectedCylinders.includes(cylinder.id)}
                        onCheckedChange={() => handleToggleCylinder(cylinder.id)}
                        className="mt-1"
                      />
                      <div className="ml-3">
                        <Label
                          htmlFor={`cylinder-${cylinder.id}`}
                          className="text-sm font-medium text-gray-900 cursor-pointer"
                        >
                          {cylinder.code}
                        </Label>
                        <p className="text-xs text-gray-500">Size: {cylinder.size}</p>
                        <p className="text-xs text-gray-500">
                          Filled on: {new Date(cylinder.filling_end_time || "").toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>

        <CardFooter className="flex justify-between border-t border-gray-200 bg-gray-50 p-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/cylinders")}
            className="border-gray-300 text-gray-700 hover:bg-gray-100"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isLoading || selectedCylinders.length === 0}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isLoading ? (
              <span className="flex items-center gap-1">
                <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                Assigning...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Save className="h-4 w-4" />
                Assign Cylinders
              </span>
            )}
          </Button>
        </CardFooter>
      </Card>
    </form>
  )
}
