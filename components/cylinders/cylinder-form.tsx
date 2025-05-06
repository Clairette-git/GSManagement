"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Cylinder, GasType } from "@/types"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Clock } from "lucide-react"

interface CylinderFormProps {
  cylinderId?: number
}

export default function CylinderForm({ cylinderId }: CylinderFormProps) {
  const [code, setCode] = useState("")
  const [size, setSize] = useState<"10L" | "40L" | "50L">("10L")
  const [gasTypeId, setGasTypeId] = useState<string>("")
  const [status, setStatus] = useState<"in stock" | "delivered" | "returned" | "filling" | "filled" | "empty">(
    "in stock",
  )
  const [gasTypes, setGasTypes] = useState<GasType[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [fillingStartTime, setFillingStartTime] = useState<string>("")
  const [fillingEndTime, setFillingEndTime] = useState<string>("")
  const [isActive, setIsActive] = useState<boolean>(true)
  const router = useRouter()

  useEffect(() => {
    const fetchGasTypes = async () => {
      try {
        const response = await fetch("/api/gas-types")
        const data = await response.json()
        setGasTypes(data.data)
      } catch (error) {
        console.error("Error fetching gas types:", error)
      }
    }

    fetchGasTypes()

    if (cylinderId) {
      setIsEditing(true)
      const fetchCylinder = async () => {
        try {
          const response = await fetch(`/api/cylinders/${cylinderId}`)
          const data = await response.json()
          const cylinder = data.data as Cylinder

          setCode(cylinder.code)
          setSize(cylinder.size)
          setGasTypeId(cylinder.gas_type_id ? cylinder.gas_type_id.toString() : "")
          setStatus(cylinder.status)
          setFillingStartTime(cylinder.filling_start_time || "")
          setFillingEndTime(cylinder.filling_end_time || "")
          setIsActive(cylinder.is_active !== false)
        } catch (error) {
          console.error("Error fetching cylinder:", error)
        }
      }

      fetchCylinder()
    }
  }, [cylinderId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const url = isEditing ? `/api/cylinders/${cylinderId}` : "/api/cylinders"
      const method = isEditing ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code,
          size,
          gas_type_id: gasTypeId ? Number.parseInt(gasTypeId) : null,
          status,
          filling_start_time: fillingStartTime || null,
          filling_end_time: fillingEndTime || null,
          is_active: isActive,
        }),
      })

      if (response.ok) {
        router.push("/cylinders")
        router.refresh()
      } else {
        const data = await response.json()
        alert(data.message || "Failed to save cylinder")
      }
    } catch (error) {
      console.error("Error saving cylinder:", error)
      alert("An error occurred while saving the cylinder")
    } finally {
      setIsLoading(false)
    }
  }

  const handleStartFilling = () => {
    const now = new Date().toISOString()
    setFillingStartTime(now)
    setStatus("filling")
  }

  const handleEndFilling = () => {
    const now = new Date().toISOString()
    setFillingEndTime(now)
    setStatus("filled")
  }

  const formatDateTime = (dateTimeString: string) => {
    if (!dateTimeString) return ""
    const date = new Date(dateTimeString)
    return date.toLocaleString()
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card className="bg-white border-gray-200">
        <CardHeader className="bg-white text-gray-900">
          <CardTitle>{isEditing ? "Edit Cylinder" : "Add Cylinder"}</CardTitle>
          <CardDescription className="text-gray-600">
            {isEditing ? "Update the cylinder details" : "Add a new cylinder to the system"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 bg-white text-gray-900">
          <div className="space-y-2">
            <Label htmlFor="code" className="text-gray-700">
              Cylinder Code
            </Label>
            <Input
              id="code"
              placeholder="e.g., CYL-001"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
              className="border-gray-300 text-gray-900"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="size" className="text-gray-700">
              Cylinder Size
            </Label>
            <Select value={size} onValueChange={(value) => setSize(value as "10L" | "40L" | "50L")}>
              <SelectTrigger id="size" className="border-gray-300 text-gray-900 bg-white">
                <SelectValue placeholder="Select size" />
              </SelectTrigger>
              <SelectContent className="bg-white text-gray-900">
                <SelectItem value="10L">10L</SelectItem>
                <SelectItem value="40L">40L</SelectItem>
                <SelectItem value="50L">50L</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="gas-type" className="text-gray-700">
              Gas Type
            </Label>
            <Select value={gasTypeId} onValueChange={setGasTypeId}>
              <SelectTrigger id="gas-type" className="border-gray-300 text-gray-900 bg-white">
                <SelectValue placeholder="Select gas type" />
              </SelectTrigger>
              <SelectContent className="bg-white text-gray-900">
                <SelectItem value="none">Empty (No Gas)</SelectItem>
                {gasTypes.map((gasType) => (
                  <SelectItem key={gasType.id} value={gasType.id.toString()}>
                    {gasType.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="status" className="text-gray-700">
              Status
            </Label>
            <Select
              value={status}
              onValueChange={(value) =>
                setStatus(value as "in stock" | "delivered" | "returned" | "filling" | "filled" | "empty")
              }
            >
              <SelectTrigger id="status" className="border-gray-300 text-gray-900 bg-white">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent className="bg-white text-gray-900">
                <SelectItem value="in stock">In Stock</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="returned">Returned</SelectItem>
                <SelectItem value="filling">Filling</SelectItem>
                <SelectItem value="filled">Filled</SelectItem>
                <SelectItem value="empty">Empty</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-gray-700">Active Status</Label>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="is-active"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <Label htmlFor="is-active" className="text-sm font-normal text-gray-700">
                Cylinder is active and available for use
              </Label>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-4 mt-4">
            <h3 className="text-md font-medium mb-3 text-gray-800">Filling Information</h3>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="filling-start" className="text-gray-700">
                  Filling Start Time
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="filling-start"
                    type="datetime-local"
                    value={fillingStartTime ? new Date(fillingStartTime).toISOString().slice(0, 16) : ""}
                    onChange={(e) => setFillingStartTime(e.target.value ? new Date(e.target.value).toISOString() : "")}
                    className="flex-1 border-gray-300 text-gray-900"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleStartFilling}
                    className="flex items-center gap-1 border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                  >
                    <Clock className="h-4 w-4" />
                    Start Now
                  </Button>
                </div>
                {fillingStartTime && (
                  <p className="text-xs text-gray-500 mt-1">Started: {formatDateTime(fillingStartTime)}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="filling-end" className="text-gray-700">
                  Filling End Time
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="filling-end"
                    type="datetime-local"
                    value={fillingEndTime ? new Date(fillingEndTime).toISOString().slice(0, 16) : ""}
                    onChange={(e) => setFillingEndTime(e.target.value ? new Date(e.target.value).toISOString() : "")}
                    className="flex-1 border-gray-300 text-gray-900"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleEndFilling}
                    className="flex items-center gap-1 border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                    disabled={!fillingStartTime}
                  >
                    <Clock className="h-4 w-4" />
                    End Now
                  </Button>
                </div>
                {fillingEndTime && (
                  <p className="text-xs text-gray-500 mt-1">Ended: {formatDateTime(fillingEndTime)}</p>
                )}
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between bg-white">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/cylinders")}
            className="border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading} className="bg-blue-600 text-white hover:bg-blue-700">
            {isLoading ? "Saving..." : isEditing ? "Update" : "Add"}
          </Button>
        </CardFooter>
      </Card>
    </form>
  )
}
