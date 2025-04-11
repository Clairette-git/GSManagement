"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { ArrowLeft, Save } from "lucide-react"

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
      <Card className="bg-gray-800 border-gray-700 max-w-2xl mx-auto">
        <CardHeader>
          <div className="flex items-center gap-2 mb-2">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-gray-400 hover:text-white"
              onClick={() => router.push("/inventory")}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <CardTitle className="text-xl font-semibold">{isEditing ? "Edit Gas Type" : "Add Gas Type"}</CardTitle>
          </div>
          <CardDescription className="text-gray-400">
            {isEditing ? "Update the gas type details" : "Add a new gas type to the system"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-gray-300">
              Gas Type Name
            </Label>
            <Input
              id="name"
              placeholder="e.g., Oxygen, Nitrogen"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="bg-gray-900 border-gray-700 focus:border-blue-500"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="price" className="text-gray-300">
              Price per Liter ($)
            </Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              value={pricePerLiter}
              onChange={(e) => setPricePerLiter(e.target.value)}
              required
              className="bg-gray-900 border-gray-700 focus:border-blue-500"
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-between border-t border-gray-700 pt-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/inventory")}
            className="border-gray-700 bg-gray-900 hover:bg-gray-800 text-gray-300 hover:text-white"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isLoading}
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 border-0"
          >
            {isLoading ? (
              <span className="flex items-center gap-1">
                <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                {isEditing ? "Updating..." : "Saving..."}
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Save className="h-4 w-4" />
                {isEditing ? "Update" : "Save"}
              </span>
            )}
          </Button>
        </CardFooter>
      </Card>
    </form>
  )
}
