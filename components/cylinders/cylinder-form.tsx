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

interface CylinderFormProps {
  cylinderId?: number
}

export default function CylinderForm({ cylinderId }: CylinderFormProps) {
  const [code, setCode] = useState("")
  const [size, setSize] = useState<"10L" | "40L" | "50L">("10L")
  const [gasTypeId, setGasTypeId] = useState<string>("")
  const [status, setStatus] = useState<"in stock" | "delivered" | "returned">("in stock")
  const [gasTypes, setGasTypes] = useState<GasType[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
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

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>{isEditing ? "Edit Cylinder" : "Add Cylinder"}</CardTitle>
          <CardDescription>
            {isEditing ? "Update the cylinder details" : "Add a new cylinder to the system"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="code">Cylinder Code</Label>
            <Input
              id="code"
              placeholder="e.g., CYL-001"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="size">Cylinder Size</Label>
            <Select value={size} onValueChange={(value) => setSize(value as "10L" | "40L" | "50L")}>
              <SelectTrigger id="size">
                <SelectValue placeholder="Select size" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10L">10L</SelectItem>
                <SelectItem value="40L">40L</SelectItem>
                <SelectItem value="50L">50L</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="gas-type">Gas Type (Optional)</Label>
            <Select value={gasTypeId} onValueChange={setGasTypeId}>
              <SelectTrigger id="gas-type">
                <SelectValue placeholder="Select gas type" />
              </SelectTrigger>
              <SelectContent>
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
            <Label htmlFor="status">Status</Label>
            <Select value={status} onValueChange={(value) => setStatus(value as "in stock" | "delivered" | "returned")}>
              <SelectTrigger id="status">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="in stock">In Stock</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="returned">Returned</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button type="button" variant="outline" onClick={() => router.push("/cylinders")}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Saving..." : isEditing ? "Update" : "Add"}
          </Button>
        </CardFooter>
      </Card>
    </form>
  )
}

