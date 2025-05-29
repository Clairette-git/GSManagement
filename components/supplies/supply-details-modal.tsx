"use client"

import { useState, useEffect } from "react"
import { format, parseISO } from "date-fns"
import { Loader2, User, Phone, MapPin, FileText, Truck, Calendar, Package, Wallet, Wrench } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"

interface SupplyDetail {
  id: number
  date: string
  hospital_name: string
  vehicle_plate: string
  driver_name: string
  technician_name?: string
  storekeeper_name?: string
  total_price: number
  recipient_name?: string
  recipient_phone?: string
  delivery_address?: string
  notes?: string
  status?: string
  created_at?: string
  updated_at?: string
  cylinder_count?: number
  delivery_time?: string
  contact_person?: string
  department?: string
  kilometers?: number
  cylinders: {
    id: number
    code: string
    size: number | string
    gas_name: string
    price: number
    quantity?: number
  }[]
}

interface SupplyDetailsModalProps {
  supplyId: number | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SupplyDetailsModal({ supplyId, open, onOpenChange }: SupplyDetailsModalProps) {
  const [supply, setSupply] = useState<SupplyDetail | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (open && supplyId) {
      fetchSupplyDetails(supplyId)
    } else {
      // Reset state when modal closes
      setSupply(null)
      setError(null)
    }
  }, [open, supplyId])

  const fetchSupplyDetails = async (id: number) => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/supplies/${id}`)

      if (!response.ok) {
        throw new Error(`Failed to fetch supply details: ${response.statusText}`)
      }

      const data = await response.json()
      setSupply(data.data)
    } catch (error) {
      console.error("Error fetching supply details:", error)
      setError(error instanceof Error ? error.message : "Failed to load supply details")
    } finally {
      setLoading(false)
    }
  }

  const formatDateTime = (dateString: string) => {
    try {
      const date = parseISO(dateString)
      return format(date, "PPP 'at' h:mm:ss a")
    } catch (error) {
      return dateString
    }
  }

  const formatDate = (dateString: string) => {
    try {
      const date = parseISO(dateString)
      return format(date, "PPP")
    } catch (error) {
      return dateString
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto bg-gray-50 text-teal-700">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-teal-700">
            <Package className="h-5 w-5 text-teal-700" />
            Supply Details
          </DialogTitle>
          <DialogDescription className="text-teal-700">
            Complete information about the gas supply delivery
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
            <span className="ml-2 text-gray-600">Loading supply details...</span>
          </div>
        ) : error ? (
          <div className="py-6">
            <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
              <p className="text-red-600 font-medium">Error Loading Supply Details</p>
              <p className="text-red-500 text-sm mt-1">{error}</p>
            </div>
            <Button onClick={() => fetchSupplyDetails(supplyId!)}>Retry</Button>
          </div>
        ) : supply ? (
          <div className="space-y-6">
            {/* Status Badge */}
            {supply.status && (
              <div className="flex justify-end">
                <Badge variant={supply.status === "completed" ? "default" : "secondary"}>
                  {supply.status.charAt(0).toUpperCase() + supply.status.slice(1)}
                </Badge>
              </div>
            )}

            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-white rounded-lg border">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-xs text-gray-500">Supply Date</p>
                  <p className="font-medium">{formatDateTime(supply.date)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Wallet className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-xs text-gray-500">Total Amount</p>
                  <p className="font-medium text-teal-600">
                    RWF{" "}
                    {Number(supply.total_price).toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-xs text-gray-500">Cylinder Count</p>
                  <p className="font-medium">{supply.cylinder_count || supply.cylinders.length || "N/A"}</p>
                </div>
              </div>
            </div>

            {/* Hospital & Delivery Information */}
            <div className="bg-white p-4 rounded-lg border">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Hospital & Delivery Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Hospital Name</p>
                  <p className="font-medium">{supply.hospital_name}</p>
                </div>
                {supply.department && (
                  <div>
                    <p className="text-sm text-gray-500">Department</p>
                    <p className="font-medium">{supply.department}</p>
                  </div>
                )}
                {supply.delivery_address && (
                  <div>
                    <p className="text-sm text-gray-500">Delivery Address</p>
                    <p className="font-medium">{supply.delivery_address}</p>
                  </div>
                )}
                {supply.delivery_time && (
                  <div>
                    <p className="text-sm text-gray-500">Delivery Time</p>
                    <p className="font-medium">{supply.delivery_time}</p>
                  </div>
                )}
                {supply.kilometers && (
                  <div>
                    <p className="text-sm text-gray-500">Distance (KM)</p>
                    <p className="font-medium">{supply.kilometers} km</p>
                  </div>
                )}
              </div>
            </div>

            {/* Contact Information */}
            <div className="bg-white p-4 rounded-lg border">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <User className="h-4 w-4" />
                Hospital Recipient Name
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {supply.recipient_name && (
                  <div>
                    <p className="font-medium">{supply.recipient_name}</p>
                  </div>
                )}
                {supply.contact_person && (
                  <div>
                    <p className="text-sm text-gray-500">Contact Person</p>
                    <p className="font-medium">{supply.contact_person}</p>
                  </div>
                )}
              
              </div>
            </div>

            {/* Vehicle & Driver Information */}
            <div className="bg-white p-4 rounded-lg border">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Truck className="h-4 w-4" />
                Vehicle & Driver Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Vehicle Plate</p>
                  <p className="font-medium">{supply.vehicle_plate}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Driver Name</p>
                  <p className="font-medium">{supply.driver_name}</p>
                </div>
              </div>
            </div>

            {/* Staff Information */}
            <div className="bg-white p-4 rounded-lg border">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Wrench className="h-4 w-4" />
                Staff Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {supply.technician_name && (
                  <div>
                    <p className="text-sm text-gray-500">Kalisimbi Technician Name</p>
                    <p className="font-medium">{supply.technician_name}</p>
                  </div>
                )}
                {supply.storekeeper_name && (
                  <div>
                    <p className="text-sm text-gray-500">Kalisimbi Storekeeper Name</p>
                    <p className="font-medium">{supply.storekeeper_name}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Cylinders Information */}
            <div className="bg-white p-4 rounded-lg border">
              <h3 className="font-semibold text-gray-900 mb-3">Supplied Cylinders</h3>
              {supply.cylinders && supply.cylinders.length > 0 ? (
                <div className="overflow-x-auto border rounded-md">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-teal-50 border-b">
                        <th className="text-left py-3 px-4 text-xs font-medium text-teal-700 uppercase">
                          Cylinder Code
                        </th>
                        <th className="text-left py-3 px-4 text-xs font-medium text-teal-700 uppercase">Size (L)</th>
                        <th className="text-left py-3 px-4 text-xs font-medium text-teal-700 uppercase">Gas Type</th>
                        {supply.cylinders.some((c) => c.quantity) && (
                          <th className="text-center py-3 px-4 text-xs font-medium text-teal-700 uppercase">
                            Quantity
                          </th>
                        )}
                        <th className="text-center py-3 px-4 text-xs font-medium text-teal-700 uppercase">Price</th>
                      </tr>
                    </thead>
                    <tbody>
                      {supply.cylinders.map((cylinder) => (
                        <tr key={cylinder.id} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4 text-sm font-medium">{cylinder.code}</td>
                          <td className="py-3 px-4 text-sm">{cylinder.size}</td>
                          <td className="py-3 px-4 text-sm">{cylinder.gas_name || "N/A"}</td>
                          {supply.cylinders.some((c) => c.quantity) && (
                            <td className="py-3 px-4 text-sm text-center">{cylinder.quantity || 1}</td>
                          )}
                          <td className="py-3 px-4 text-sm text-right">
                            RWF{" "}
                            {Number(cylinder.price).toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </td>
                        </tr>
                      ))}
                      <tr className="bg-teal-50 font-medium">
                        <td
                          colSpan={supply.cylinders.some((c) => c.quantity) ? 4 : 3}
                          className="py-3 px-4 text-right text-sm"
                        >
                          Total:
                        </td>
                        <td className="py-3 px-4 text-right text-sm text-teal-600">
                          RWF{" "}
                          {Number(supply.total_price).toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-4 bg-gray-50 rounded-md text-center">
                  <p className="text-gray-500 text-sm">
                    {supply.cylinder_count
                      ? `${supply.cylinder_count} cylinders were supplied, but detailed information is not available.`
                      : "Cylinder details are not available for this supply."}
                  </p>
                </div>
              )}
            </div>

            {/* Timestamps */}
            <div className="pt-4 border-t">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-gray-500">
                {supply.created_at && (
                  <div>
                    <span className="font-medium">Created:</span> {formatDate(supply.created_at)}
                  </div>
                )}
                {supply.updated_at && (
                  <div>
                    <span className="font-medium">Last Updated:</span> {formatDate(supply.updated_at)}
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="py-6 text-center text-gray-500">No supply details available</div>
        )}

        <DialogFooter className="flex justify-between items-center">
          <div className="text-sm text-gray-500">
            {supply && `Supply • ${format(new Date(supply.date), "MMMM d, yyyy")}`}
          </div>
          
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
