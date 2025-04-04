"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

interface GasTypeFormProps {
  gasTypeId?: number
}

export default function GasTypeForm({ gasTypeId }: GasTypeFormProps) {
  const [name, setName] = useState("")
  const [pricePerLiter, setPricePerLiter] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const router = useRouter()

  useEffect(() => {
    if (gasTypeId) {
      setIsEditing(true)
      const fetchGasType = async () => {
        try {
          const response = await fetch(`/api/gas-types/${gasTypeId}`)
          const data = await response.json()
          setName(data.data.name)
          setPricePerLiter(data.data.price_per_liter.toString())
        } catch (error) {
          console.error("Error fetching gas type:", error)
        }
      }

      fetchGasType()
    }
  }, [gasTypeId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const url = isEditing ? `/api/gas-types/${gasTypeId}` : "/api/gas-types"
      const method = isEditing ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          price_per_liter: Number.parseFloat(pricePerLiter),
        }),
      })

      if (response.ok) {
        router.push("/inventory")
        router.refresh()
      } else {
        console.error("Failed to save gas type")
      }
    } catch (error) {
      console.error("Error saving gas type:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>{isEditing ? "Edit Gas Type" : "Add Gas Type"}</CardTitle>
          <CardDescription>
            {isEditing ? "Update the gas type details" : "Add a new gas type to the system"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Gas Type Name</Label>
            <Input
              id="name"
              placeholder="e.g., Oxygen, Nitrogen"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="price">Price per Liter ($)</Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              value={pricePerLiter}
              onChange={(e) => setPricePerLiter(e.target.value)}
              required
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button type="button" variant="outline" onClick={() => router.push("/inventory")}>
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

