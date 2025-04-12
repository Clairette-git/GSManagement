"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Cylinder, GasType } from "@/types"
import { ArrowLeft, Plus, Save, Trash2, RefreshCw } from "lucide-react"

export default function SupplyForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [cylinders, setCylinders] = useState<Cylinder[]>([])
  const [gasTypes, setGasTypes] = useState<GasType[]>([])
  const signatureCanvasRef = useRef<HTMLCanvasElement>(null)
  const [signatureDataURL, setSignatureDataURL] = useState<string | null>(null)

  // Form state
  const [date, setDate] = useState(new Date().toISOString().split("T")[0])
  const [hospitalName, setHospitalName] = useState("")
  const [vehiclePlate, setVehiclePlate] = useState("")
  const [driverName, setDriverName] = useState("")
  const [storekeeperName, setStorekeeperName] = useState("")
  const [technicianName, setTechnicianName] = useState("")
  const [recipientName, setRecipientName] = useState("")
  const [supplyDetails, setSupplyDetails] = useState<
    Array<{
      cylinder_code: string
      gas_type_id: number
      liters: number
      price: number
    }>
  >([
    {
      cylinder_code: "",
      gas_type_id: 0,
      liters: 0,
      price: 0,
    },
  ])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [cylindersRes, gasTypesRes] = await Promise.all([fetch("/api/cylinders"), fetch("/api/gas-types")])

        const [cylindersData, gasTypesData] = await Promise.all([cylindersRes.json(), gasTypesRes.json()])

        setCylinders(cylindersData.data)
        setGasTypes(gasTypesData.data)
      } catch (error) {
        console.error("Error fetching data:", error)
      }
    }

    fetchData()
  }, [])

  useEffect(() => {
    // Initialize signature canvas
    const canvas = signatureCanvasRef.current
    if (canvas) {
      const ctx = canvas.getContext("2d")
      if (ctx) {
        ctx.lineWidth = 2
        ctx.strokeStyle = "#000000"
      }
    }
  }, [])

  const handleAddDetail = () => {
    setSupplyDetails([
      ...supplyDetails,
      {
        cylinder_code: "",
        gas_type_id: 0,
        liters: 0,
        price: 0,
      },
    ])
  }

  const handleRemoveDetail = (index: number) => {
    const newDetails = [...supplyDetails]
    newDetails.splice(index, 1)
    setSupplyDetails(newDetails)
  }

  const handleDetailChange = (index: number, field: string, value: any) => {
    const newDetails = [...supplyDetails]
    newDetails[index] = { ...newDetails[index], [field]: value }

    // If gas type changes, update price
    if (field === "gas_type_id" || field === "liters") {
      const gasType = gasTypes.find((g) => g.id === Number(newDetails[index].gas_type_id))
      if (gasType) {
        const pricePerLiter = Number(gasType.price_per_liter)
        const liters = Number(newDetails[index].liters)
        newDetails[index].price = pricePerLiter * liters
      }
    }

    setSupplyDetails(newDetails)
  }

  const calculateTotalPrice = () => {
    return supplyDetails.reduce((total, detail) => total + Number(detail.price), 0)
  }

  // Signature pad functionality
  let isDrawing = false
  let lastX = 0
  let lastY = 0

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    isDrawing = true
    const canvas = signatureCanvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()

    if ("touches" in e) {
      // Touch event
      lastX = e.touches[0].clientX - rect.left
      lastY = e.touches[0].clientY - rect.top
    } else {
      // Mouse event
      lastX = e.clientX - rect.left
      lastY = e.clientY - rect.top
    }
  }

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return

    const canvas = signatureCanvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const rect = canvas.getBoundingClientRect()
    let currentX, currentY

    if ("touches" in e) {
      // Touch event
      currentX = e.touches[0].clientX - rect.left
      currentY = e.touches[0].clientY - rect.top
    } else {
      // Mouse event
      currentX = e.clientX - rect.left
      currentY = e.clientY - rect.top
    }

    ctx.beginPath()
    ctx.moveTo(lastX, lastY)
    ctx.lineTo(currentX, currentY)
    ctx.stroke()

    lastX = currentX
    lastY = currentY
  }

  const stopDrawing = () => {
    isDrawing = false

    // Save the signature as data URL
    const canvas = signatureCanvasRef.current
    if (canvas) {
      setSignatureDataURL(canvas.toDataURL())
    }
  }

  const clearSignature = () => {
    const canvas = signatureCanvasRef.current
    if (canvas) {
      const ctx = canvas.getContext("2d")
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        setSignatureDataURL(null)
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!signatureDataURL) {
      alert("Recipient signature is required")
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch("/api/supplies", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          date,
          hospital_name: hospitalName,
          vehicle_plate: vehiclePlate,
          driver_name: driverName,
          storekeeper_name: storekeeperName,
          technician_name: technicianName,
          recipient_name: recipientName,
          recipient_signature: signatureDataURL,
          total_price: calculateTotalPrice(),
          supply_details: supplyDetails,
        }),
      })

      if (response.ok) {
        router.push("/supplies")
        router.refresh()
      } else {
        const data = await response.json()
        alert(data.message || "Failed to create supply")
      }
    } catch (error) {
      console.error("Error creating supply:", error)
      alert("An error occurred while creating the supply")
    } finally {
      setIsLoading(false)
    }
  }

  const getAvailableCylinders = () => {
    return cylinders.filter((c) => c.status === "in stock")
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
              onClick={() => router.push("/supplies")}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <CardTitle className="text-xl font-semibold text-gray-900">Add New Supply</CardTitle>
          </div>
          <CardDescription className="text-gray-500">
            Create a new gas supply record for hospital delivery
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="date" className="text-gray-700">
                Date
              </Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="border-gray-300 focus:border-blue-500 text-gray-900"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="hospital" className="text-gray-700">
                Hospital Name
              </Label>
              <Input
                id="hospital"
                placeholder="Enter hospital name"
                value={hospitalName}
                onChange={(e) => setHospitalName(e.target.value)}
                required
                className="border-gray-300 focus:border-blue-500 text-gray-900 placeholder:text-gray-400"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="vehicle" className="text-gray-700">
                Vehicle Plate
              </Label>
              <Input
                id="vehicle"
                placeholder="e.g., RAB 123A"
                value={vehiclePlate}
                onChange={(e) => setVehiclePlate(e.target.value)}
                required
                className="border-gray-300 focus:border-blue-500 text-gray-900 placeholder:text-gray-400"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="driver" className="text-gray-700">
                Driver Name
              </Label>
              <Input
                id="driver"
                placeholder="Enter driver name"
                value={driverName}
                onChange={(e) => setDriverName(e.target.value)}
                required
                className="border-gray-300 focus:border-blue-500 text-gray-900 placeholder:text-gray-400"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="storekeeper" className="text-gray-700">
                Storekeeper Name
              </Label>
              <Input
                id="storekeeper"
                placeholder="Enter storekeeper name"
                value={storekeeperName}
                onChange={(e) => setStorekeeperName(e.target.value)}
                required
                className="border-gray-300 focus:border-blue-500 text-gray-900 placeholder:text-gray-400"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="technician" className="text-gray-700">
                Technician Name
              </Label>
              <Input
                id="technician"
                placeholder="Enter technician name"
                value={technicianName}
                onChange={(e) => setTechnicianName(e.target.value)}
                required
                className="border-gray-300 focus:border-blue-500 text-gray-900 placeholder:text-gray-400"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="recipient" className="text-gray-700">
                Recipient Name
              </Label>
              <Input
                id="recipient"
                placeholder="Enter recipient name"
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                required
                className="border-gray-300 focus:border-blue-500 text-gray-900 placeholder:text-gray-400"
              />
            </div>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Supply Details</h3>

            {supplyDetails.map((detail, index) => (
              <div
                key={index}
                className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4 p-4 border border-gray-200 rounded-lg bg-gray-50"
              >
                <div className="space-y-2">
                  <Label htmlFor={`cylinder-${index}`} className="text-gray-700">
                    Cylinder
                  </Label>
                  <Select
                    value={detail.cylinder_code}
                    onValueChange={(value) => handleDetailChange(index, "cylinder_code", value)}
                  >
                    <SelectTrigger id={`cylinder-${index}`} className="border-gray-300 text-gray-900">
                      <SelectValue placeholder="Select cylinder" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-gray-200">
                      {getAvailableCylinders().map((cylinder) => (
                        <SelectItem key={cylinder.id} value={cylinder.code} className="text-gray-900">
                          {cylinder.code} ({cylinder.size})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`gas-type-${index}`} className="text-gray-700">
                    Gas Type
                  </Label>
                  <Select
                    value={detail.gas_type_id.toString()}
                    onValueChange={(value) => handleDetailChange(index, "gas_type_id", Number(value))}
                  >
                    <SelectTrigger id={`gas-type-${index}`} className="border-gray-300 text-gray-900">
                      <SelectValue placeholder="Select gas type" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-gray-200">
                      {gasTypes.map((gasType) => (
                        <SelectItem key={gasType.id} value={gasType.id.toString()} className="text-gray-900">
                          {gasType.name} (${Number(gasType.price_per_liter).toFixed(2)}/L)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`liters-${index}`} className="text-gray-700">
                    Liters
                  </Label>
                  <Input
                    id={`liters-${index}`}
                    type="number"
                    min="0"
                    step="0.1"
                    placeholder="0.0"
                    value={detail.liters || ""}
                    onChange={(e) => handleDetailChange(index, "liters", Number(e.target.value))}
                    required
                    className="border-gray-300 focus:border-blue-500 text-gray-900 placeholder:text-gray-400"
                  />
                </div>

                <div className="space-y-2 flex items-end gap-2">
                  <div className="flex-1">
                    <Label htmlFor={`price-${index}`} className="text-gray-700">
                      Price ($)
                    </Label>
                    <Input
                      id={`price-${index}`}
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      value={detail.price.toFixed(2)}
                      readOnly
                      className="border-gray-300 bg-gray-100 text-gray-900"
                    />
                  </div>

                  {supplyDetails.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="h-10 w-10 border-gray-300 text-red-600 hover:bg-red-50 hover:text-red-700"
                      onClick={() => handleRemoveDetail(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}

            <Button
              type="button"
              variant="outline"
              className="mt-2 border-gray-300 text-gray-700"
              onClick={handleAddDetail}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Cylinder
            </Button>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Recipient Signature</h3>
            <div className="border border-gray-300 rounded-lg p-2 bg-white">
              <div className="flex justify-between items-center mb-2">
                <Label className="text-gray-700">Sign below</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-8 px-3 text-gray-700 border-gray-300"
                  onClick={clearSignature}
                >
                  <RefreshCw className="h-3.5 w-3.5 mr-1" />
                  Clear
                </Button>
              </div>
              <div className="border border-gray-200 rounded bg-gray-50">
                <canvas
                  ref={signatureCanvasRef}
                  width={900}
                  height={90}
                  className="w-full touch-none"
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                ></canvas>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {signatureDataURL ? "Signature captured" : "Please sign above to confirm receipt"}
              </p>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <div className="flex justify-between items-center">
              <span className="text-lg font-medium text-gray-900">Total Price:</span>
              <span className="text-xl font-bold text-blue-600">${calculateTotalPrice().toFixed(2)}</span>
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex justify-between border-t border-gray-200 bg-gray-50 p-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/supplies")}
            className="border-gray-300 text-gray-700 hover:bg-gray-100"
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading} className="bg-blue-600 hover:bg-blue-700 text-white">
            {isLoading ? (
              <span className="flex items-center gap-1">
                <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                Saving...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Save className="h-4 w-4" />
                Save Supply
              </span>
            )}
          </Button>
        </CardFooter>
      </Card>
    </form>
  )
}
