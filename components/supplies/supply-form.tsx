"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import type { Cylinder, GasType } from "@/types"
import { ArrowLeft, Save, RefreshCw, AlertCircle, Search, Truck, DollarSign } from "lucide-react"

export default function SupplyForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [cylinders, setCylinders] = useState<Cylinder[]>([])
  const [gasTypes, setGasTypes] = useState<GasType[]>([])
  const signatureCanvasRef = useRef<HTMLCanvasElement>(null)
  const [signatureDataURL, setSignatureDataURL] = useState<string | null>(null)
  const [delivererSignatureDataURL, setDelivererSignatureDataURL] = useState<string | null>(null)
  const delivererSignatureCanvasRef = useRef<HTMLCanvasElement>(null)

  // Form state
  const [date, setDate] = useState(new Date().toISOString().split("T")[0])
  const [hospitalName, setHospitalName] = useState("")
  const [vehiclePlate, setVehiclePlate] = useState("")
  const [driverName, setDriverName] = useState("")
  const [storekeeperName, setStorekeeperName] = useState("")
  const [technicianName, setTechnicianName] = useState("")
  const [recipientName, setRecipientName] = useState("")
  const [kilometers, setKilometers] = useState<number>(0)
  const [supplyDetails, setSupplyDetails] = useState<
    Array<{
      cylinder_code: string
      gas_type_id: number
      liters: number
      price: number
      price_per_liter?: number // Add custom price per liter
      default_price_per_liter?: number // Store default price for reference
    }>
  >([])

  // Vehicle cylinders state
  const [vehicleCylinders, setVehicleCylinders] = useState<any[]>([])
  const [isLoadingVehicleCylinders, setIsLoadingVehicleCylinders] = useState(false)
  const [selectedCylinderIds, setSelectedCylinderIds] = useState<string[]>([])

  // Invoice state
  const [createInvoice, setCreateInvoice] = useState(true)
  const [invoiceStatus, setInvoiceStatus] = useState<"paid" | "unpaid">("unpaid")
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split("T")[0])

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

  // Fetch cylinders assigned to the vehicle when plate number changes
  useEffect(() => {
    const fetchVehicleCylinders = async () => {
      if (!vehiclePlate.trim()) {
        setVehicleCylinders([])
        return
      }

      setIsLoadingVehicleCylinders(true)

      try {
        const response = await fetch(`/api/cylinders/by-vehicle?plate=${encodeURIComponent(vehiclePlate)}`)

        if (!response.ok) {
          throw new Error(`Failed to fetch cylinders: ${response.status}`)
        }

        const data = await response.json()
        setVehicleCylinders(data.data || [])
      } catch (error) {
        console.error("Error fetching vehicle cylinders:", error)
      } finally {
        setIsLoadingVehicleCylinders(false)
      }
    }

    fetchVehicleCylinders()
  }, [vehiclePlate])

  // Update supply details when selected cylinders change
  useEffect(() => {
    if (selectedCylinderIds.length > 0) {
      // Create supply details from selected cylinders
      const newSupplyDetails = selectedCylinderIds.map((cylinderCode) => {
        const cylinder = vehicleCylinders.find((c) => c.code === cylinderCode)
        const gasTypeId = cylinders.find((c) => c.code === cylinderCode)?.gas_type_id || 0
        const gasType = gasTypes.find((g) => g.id === gasTypeId)

        // Extract numeric part from size (e.g., "50L" -> 50)
        const cylinderSize = cylinders.find((c) => c.code === cylinderCode)?.size || ""
        const sizeNumber = Number.parseInt(cylinderSize.replace(/[^0-9]/g, "")) || 0

        // Get default price per liter from gas type
        const defaultPricePerLiter = gasType ? Number(gasType.price_per_liter) : 0

        // Check if this cylinder already has custom pricing
        const existingDetail = supplyDetails.find((detail) => detail.cylinder_code === cylinderCode)
        const pricePerLiter = existingDetail?.price_per_liter || defaultPricePerLiter

        // Calculate total price
        const price = pricePerLiter * sizeNumber

        return {
          cylinder_code: cylinderCode,
          gas_type_id: gasTypeId,
          liters: sizeNumber,
          price: price,
          price_per_liter: pricePerLiter,
          default_price_per_liter: defaultPricePerLiter,
        }
      })

      setSupplyDetails(newSupplyDetails)
    } else {
      setSupplyDetails([])
    }
  }, [selectedCylinderIds, vehicleCylinders, cylinders, gasTypes])

  useEffect(() => {
    // Initialize signature canvases
    const initCanvas = (canvas: HTMLCanvasElement | null) => {
      if (canvas) {
        const ctx = canvas.getContext("2d")
        if (ctx) {
          ctx.lineWidth = 2
          ctx.strokeStyle = "#000000"
        }
      }
    }

    initCanvas(signatureCanvasRef.current)
    initCanvas(delivererSignatureCanvasRef.current)
  }, [])

  const handleToggleCylinder = (cylinderCode: string) => {
    setSelectedCylinderIds((prev) =>
      prev.includes(cylinderCode) ? prev.filter((code) => code !== cylinderCode) : [...prev, cylinderCode],
    )
  }

  // New function to handle price per liter changes
  const handlePricePerLiterChange = (cylinderCode: string, newPricePerLiter: number) => {
    setSupplyDetails((prev) =>
      prev.map((detail) => {
        if (detail.cylinder_code === cylinderCode) {
          const newPrice = newPricePerLiter * detail.liters
          return {
            ...detail,
            price_per_liter: newPricePerLiter,
            price: newPrice,
          }
        }
        return detail
      }),
    )
  }

  // Function to reset to default price
  const resetToDefaultPrice = (cylinderCode: string) => {
    setSupplyDetails((prev) =>
      prev.map((detail) => {
        if (detail.cylinder_code === cylinderCode) {
          const defaultPrice = (detail.default_price_per_liter || 0) * detail.liters
          return {
            ...detail,
            price_per_liter: detail.default_price_per_liter || 0,
            price: defaultPrice,
          }
        }
        return detail
      }),
    )
  }

  const calculateTotalPrice = () => {
    return supplyDetails.reduce((total, detail) => total + Number(detail.price), 0)
  }

  // Signature pad functionality for recipient
  let isDrawing = false
  let lastX = 0
  let lastY = 0

  const startDrawing = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>,
    canvasRef: React.RefObject<HTMLCanvasElement | null>,
  ) => {
    isDrawing = true
    const canvas = canvasRef.current
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

  const draw = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>,
    canvasRef: React.RefObject<HTMLCanvasElement | null>,
  ) => {
    if (!isDrawing) return

    const canvas = canvasRef.current
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

  const stopDrawing = (
    canvasRef: React.RefObject<HTMLCanvasElement | null>,
    setSignature: (url: string | null) => void,
  ) => {
    isDrawing = false

    // Save the signature as data URL
    const canvas = canvasRef.current
    if (canvas) {
      setSignature(canvas.toDataURL())
    }
  }

  const clearSignature = (
    canvasRef: React.RefObject<HTMLCanvasElement | null>,
    setSignature: (url: string | null) => void,
  ) => {
    const canvas = canvasRef.current
    if (canvas) {
      const ctx = canvas.getContext("2d")
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        setSignature(null)
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (supplyDetails.length === 0) {
      alert("Please select at least one cylinder to the supply")
      return
    }

    // Check if all required fields are filled
    const hasEmptyFields = supplyDetails.some(
      (detail) => !detail.cylinder_code || !detail.gas_type_id || !detail.liters,
    )

    if (hasEmptyFields) {
      alert("Please fill in all cylinder details")
      return
    }

    if (!signatureDataURL) {
      alert("Recipient signature is required")
      return
    }

    if (!delivererSignatureDataURL) {
      alert("Deliverer signature is required")
      return
    }

    setIsLoading(true)

    try {
      const totalPrice = calculateTotalPrice()

      // Prepare supply details with the actual prices used
      const finalSupplyDetails = supplyDetails.map((detail) => ({
        cylinder_code: detail.cylinder_code,
        gas_type_id: detail.gas_type_id,
        liters: detail.liters,
        price: detail.price, // This will be the final calculated price (custom or default)
      }))

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
          deliverer_signature: delivererSignatureDataURL,
          total_price: totalPrice,
          kilometers: kilometers,
          supply_details: finalSupplyDetails,
          create_invoice: createInvoice,
          invoice_status: invoiceStatus,
          invoice_date: invoiceDate || date,
        }),
      })

      if (response.ok) {
        // Always redirect to supplies list, regardless of invoice creation
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
              <div className="relative">
                <Input
                  id="vehicle"
                  placeholder="e.g., RAB 123A"
                  value={vehiclePlate}
                  onChange={(e) => setVehiclePlate(e.target.value)}
                  required
                  className="border-gray-300 focus:border-blue-500 text-gray-900 placeholder:text-gray-400 pr-10"
                />
                {isLoadingVehicleCylinders && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <div className="animate-spin h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                  </div>
                )}
                {!isLoadingVehicleCylinders && vehiclePlate && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="kilometers" className="text-gray-700">
                Kilometers Traveled
              </Label>
              <Input
                id="kilometers"
                type="number"
                min="0"
                step="0.1"
                placeholder="Enter kilometers traveled"
                value={kilometers || ""}
                onChange={(e) => setKilometers(Number(e.target.value))}
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
                Storekeeper Name (Production Site)
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
                Kalisimbi Technician Name
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
                Hospital Recipient Name
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
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Cylinders Assigned to Vehicle</h3>
            </div>

            {!vehiclePlate && (
              <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-md flex items-center text-amber-700">
                <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
                <p className="text-sm">Enter a vehicle plate number to see assigned cylinders.</p>
              </div>
            )}

            {isLoadingVehicleCylinders && vehiclePlate && (
              <div className="flex justify-center py-8">
                <div className="animate-spin h-8 w-8 border-2 border-blue-500 border-t-transparent rounded-full"></div>
              </div>
            )}

            {!isLoadingVehicleCylinders && vehiclePlate && vehicleCylinders.length === 0 && (
              <div className="text-center py-8 border border-dashed border-gray-300 rounded-lg bg-gray-50">
                <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                  <Truck className="h-6 w-6 text-gray-400" />
                </div>
                <h4 className="text-sm font-medium text-gray-900 mb-1">No cylinders assigned to this vehicle</h4>
                <p className="text-xs text-gray-500 mb-3">
                  Check the vehicle plate number or assign cylinders to this vehicle first
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="border-gray-300 text-gray-700"
                  onClick={() => router.push("/cylinders/assign")}
                >
                  Assign Cylinders
                </Button>
              </div>
            )}

            {!isLoadingVehicleCylinders && vehiclePlate && vehicleCylinders.length > 0 && (
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-100 rounded-md p-3 mb-4">
                  <p className="text-sm text-blue-700">Select the cylinders that are being delivered in this supply.</p>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {vehicleCylinders.map((cylinder) => (
                    <div
                      key={cylinder.id}
                      className={`border rounded-lg p-4 ${
                        selectedCylinderIds.includes(cylinder.code)
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 bg-white"
                      }`}
                    >
                      <div className="flex items-start space-x-4">
                        <Checkbox
                          id={`cylinder-${cylinder.id}`}
                          checked={selectedCylinderIds.includes(cylinder.code)}
                          onCheckedChange={() => handleToggleCylinder(cylinder.code)}
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                            <div>
                              <Label
                                htmlFor={`cylinder-${cylinder.id}`}
                                className="text-sm font-medium text-gray-900 cursor-pointer"
                              >
                                {cylinder.code}
                              </Label>
                              <p className="text-xs text-gray-500">Size: {cylinder.size}</p>
                              <p className="text-xs text-gray-500">Gas Type: {cylinder.gas_type || "Unknown"}</p>
                            </div>

                            {selectedCylinderIds.includes(cylinder.code) && (
                              <>
                                <div className="space-y-2">
                                  <Label className="text-xs text-gray-600">Default Price/L</Label>
                                  <div className="text-sm font-medium text-gray-700">
                                    RWF{" "}
                                    {supplyDetails
                                      .find((d) => d.cylinder_code === cylinder.code)
                                      ?.default_price_per_liter?.toFixed(2) || "0.00"}
                                  </div>
                                </div>

                                <div className="space-y-2">
                                  <Label className="text-xs text-gray-600">Custom Price/L</Label>
                                  <div className="flex items-center space-x-2">
                                    <Input
                                      type="number"
                                      min="0"
                                      step="0.01"
                                      value={
                                        supplyDetails.find((d) => d.cylinder_code === cylinder.code)?.price_per_liter ||
                                        0
                                      }
                                      onChange={(e) => handlePricePerLiterChange(cylinder.code, Number(e.target.value))}
                                      className="w-24 h-8 text-sm"
                                      placeholder="0.00"
                                    />
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      className="h-8 px-2 text-xs"
                                      onClick={() => resetToDefaultPrice(cylinder.code)}
                                      title="Reset to default price"
                                    >
                                      <RefreshCw className="h-3 w-3" />
                                    </Button>
                                  </div>
                                </div>

                                <div className="space-y-2">
                                  <Label className="text-xs text-gray-600">Total Price</Label>
                                  <div className="flex items-center space-x-2">
                                    
                                    <span className="text-sm font-bold text-green-600">
                                      RWF{" "}
                                      {supplyDetails
                                        .find((d) => d.cylinder_code === cylinder.code)
                                        ?.price?.toFixed(2) || "0.00"}
                                    </span>
                                  </div>
                                  {supplyDetails.find((d) => d.cylinder_code === cylinder.code)?.price_per_liter !==
                                    supplyDetails.find((d) => d.cylinder_code === cylinder.code)
                                      ?.default_price_per_liter && (
                                    <div className="text-xs text-amber-600 flex items-center">
                                      <AlertCircle className="h-3 w-3 mr-1" />
                                      Custom pricing
                                    </div>
                                  )}
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Deliverer Signature</h3>
            <div className="border border-gray-300 rounded-lg p-2 bg-white">
              <div className="flex justify-between items-center mb-2">
                <Label className="text-gray-700">Sign below (Deliverer)</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-8 px-3 text-gray-700 border-gray-300"
                  onClick={() => clearSignature(delivererSignatureCanvasRef, setDelivererSignatureDataURL)}
                >
                  <RefreshCw className="h-3.5 w-3.5 mr-1" />
                  Clear
                </Button>
              </div>
              <div className="border border-gray-200 rounded bg-gray-50">
                <canvas
                  ref={delivererSignatureCanvasRef}
                  width={600}
                  height={150}
                  className="w-full touch-none"
                  onMouseDown={(e) => startDrawing(e, delivererSignatureCanvasRef)}
                  onMouseMove={(e) => draw(e, delivererSignatureCanvasRef)}
                  onMouseUp={() => stopDrawing(delivererSignatureCanvasRef, setDelivererSignatureDataURL)}
                  onMouseLeave={() => stopDrawing(delivererSignatureCanvasRef, setDelivererSignatureDataURL)}
                  onTouchStart={(e) => startDrawing(e, delivererSignatureCanvasRef)}
                  onTouchMove={(e) => draw(e, delivererSignatureCanvasRef)}
                  onTouchEnd={() => stopDrawing(delivererSignatureCanvasRef, setDelivererSignatureDataURL)}
                ></canvas>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {delivererSignatureDataURL ? "Signature captured" : "Please sign above to confirm delivery"}
              </p>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Recipient Signature</h3>
            <div className="border border-gray-300 rounded-lg p-2 bg-white">
              <div className="flex justify-between items-center mb-2">
                <Label className="text-gray-700">Sign below (Recipient)</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-8 px-3 text-gray-700 border-gray-300"
                  onClick={() => clearSignature(signatureCanvasRef, setSignatureDataURL)}
                >
                  <RefreshCw className="h-3.5 w-3.5 mr-1" />
                  Clear
                </Button>
              </div>
              <div className="border border-gray-200 rounded bg-gray-50">
                <canvas
                  ref={signatureCanvasRef}
                  width={600}
                  height={150}
                  className="w-full touch-none"
                  onMouseDown={(e) => startDrawing(e, signatureCanvasRef)}
                  onMouseMove={(e) => draw(e, signatureCanvasRef)}
                  onMouseUp={() => stopDrawing(signatureCanvasRef, setSignatureDataURL)}
                  onMouseLeave={() => stopDrawing(signatureCanvasRef, setSignatureDataURL)}
                  onTouchStart={(e) => startDrawing(e, signatureCanvasRef)}
                  onTouchMove={(e) => draw(e, signatureCanvasRef)}
                  onTouchEnd={() => stopDrawing(signatureCanvasRef, setSignatureDataURL)}
                ></canvas>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {signatureDataURL ? "Signature captured" : "Please sign above to confirm receipt"}
              </p>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex justify-between items-center">
                <span className="text-lg font-medium text-gray-900">Total Price:</span>
                <span className="text-2xl font-bold text-blue-600">RWF {calculateTotalPrice().toFixed(2)}</span>
              </div>
              {supplyDetails.some((detail) => detail.price_per_liter !== detail.default_price_per_liter) && (
                <div className="mt-2 text-sm text-amber-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  Custom pricing applied to some cylinders
                </div>
              )}
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
          <Button
            type="submit"
            disabled={isLoading || selectedCylinderIds.length === 0}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
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
