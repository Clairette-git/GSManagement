"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Search, RefreshCw, Truck, AlertCircle, CheckCircle } from "lucide-react"
import type { VehicleAssignment, CylinderAssignment } from "@/types"

export function AssignedCylindersTable() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [vehicleAssignments, setVehicleAssignments] = useState<VehicleAssignment[]>([])
  const [expandedAssignments, setExpandedAssignments] = useState<Record<number, boolean>>({})
  const [cylinderAssignments, setCylinderAssignments] = useState<Record<number, CylinderAssignment[]>>({})

  const fetchAssignments = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/cylinders/assignments")

      if (!response.ok) {
        throw new Error(`Failed to fetch assignments: ${response.status}`)
      }

      const data = await response.json()
      setVehicleAssignments(data.vehicleAssignments || [])

      // Initialize expanded state for all assignments
      const expanded: Record<number, boolean> = {}
      data.vehicleAssignments.forEach((assignment: VehicleAssignment) => {
        expanded[assignment.id] = false
      })
      setExpandedAssignments(expanded)

      // Initialize cylinder assignments
      const cylinders: Record<number, CylinderAssignment[]> = {}
      data.vehicleAssignments.forEach((assignment: VehicleAssignment) => {
        cylinders[assignment.id] = []
      })
      setCylinderAssignments(cylinders)
    } catch (error) {
      console.error("Error fetching assignments:", error)
      setError(error instanceof Error ? error.message : "An unknown error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchAssignments()

    // Set up refresh interval (every 30 seconds)
    const intervalId = setInterval(fetchAssignments, 30000)

    // Clean up interval on component unmount
    return () => clearInterval(intervalId)
  }, [])

  const toggleExpand = async (assignmentId: number) => {
    // Toggle the expanded state
    setExpandedAssignments((prev) => ({
      ...prev,
      [assignmentId]: !prev[assignmentId],
    }))

    // If expanding and we don't have the cylinders yet, fetch them
    if (
      !expandedAssignments[assignmentId] &&
      (!cylinderAssignments[assignmentId] || cylinderAssignments[assignmentId].length === 0)
    ) {
      try {
        const response = await fetch(`/api/cylinders/assignments/${assignmentId}`)

        if (!response.ok) {
          throw new Error(`Failed to fetch cylinder details: ${response.status}`)
        }

        const data = await response.json()
        setCylinderAssignments((prev) => ({
          ...prev,
          [assignmentId]: data.cylinderAssignments || [],
        }))
      } catch (error) {
        console.error(`Error fetching cylinders for assignment ${assignmentId}:`, error)
        setError(error instanceof Error ? error.message : "Failed to load cylinder details")
      }
    }
  }

  const handleMarkAsReturned = async (assignmentId: number, cylinderId: number) => {
    try {
      const response = await fetch(`/api/cylinders/assignments/mark-returned`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          assignment_id: assignmentId,
          cylinder_id: cylinderId,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to mark cylinder as returned")
      }

      // Update the local state
      setCylinderAssignments((prev) => {
        const updated = { ...prev }
        updated[assignmentId] = updated[assignmentId].map((cylinder) =>
          cylinder.cylinder_id === cylinderId ? { ...cylinder, is_returned: true } : cylinder,
        )
        return updated
      })
    } catch (error) {
      console.error("Error marking cylinder as returned:", error)
      setError(error instanceof Error ? error.message : "An unknown error occurred")
    }
  }

  // Filter vehicle assignments based on search query
  const filteredAssignments = vehicleAssignments.filter(
    (assignment) =>
      assignment.vehicle_plate.toLowerCase().includes(searchQuery.toLowerCase()) ||
      assignment.driver_name.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString()
  }

  return (
    <Card className="bg-white border border-gray-200 shadow-sm">
      <CardHeader className="border-b border-gray-200 bg-gray-50">
        <div className="flex items-center gap-2 mb-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-gray-500 hover:text-gray-700"
            onClick={() => router.push("/cylinders")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <CardTitle className="text-xl font-semibold text-gray-900">Assigned Cylinders</CardTitle>
        </div>
        <CardDescription className="text-gray-500">
          View and manage cylinders assigned to vehicles for delivery
        </CardDescription>
      </CardHeader>

      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex flex-col md:flex-row gap-4 justify-between">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by vehicle plate or driver..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 h-10 w-full text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            className="h-10 px-3 text-blue-600 border-gray-300 hover:bg-blue-50"
            onClick={fetchAssignments}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border-b border-red-200">
          <div className="flex items-center gap-2 text-red-700">
            <AlertCircle className="h-4 w-4" />
            <span className="font-medium">Error:</span> {error}
          </div>
        </div>
      )}

      <CardContent className="p-0">
        {isLoading ? (
          <div className="p-8 flex justify-center">
            <div className="animate-spin h-8 w-8 border-2 border-blue-500 border-t-transparent rounded-full"></div>
          </div>
        ) : filteredAssignments.length === 0 ? (
          <div className="text-center py-12">
            <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Truck className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">No assigned cylinders found</h3>
            <p className="text-gray-500 mb-6">No cylinders have been assigned to vehicles yet</p>
            <Button
              onClick={() => router.push("/cylinders/assign")}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Assign Cylinders
            </Button>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredAssignments.map((assignment) => (
              <div key={assignment.id} className="border-b border-gray-200 last:border-b-0">
                <div
                  className="p-4 flex flex-col md:flex-row md:items-center justify-between cursor-pointer hover:bg-gray-50"
                  onClick={() => toggleExpand(assignment.id)}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <Truck className="h-4 w-4 text-gray-500" />
                      <h3 className="font-medium text-gray-900">{assignment.vehicle_plate}</h3>
                      <Badge className="bg-teal-100 text-teal-800 border-teal-200">
                        {assignment.cylinder_count} Cylinders
                      </Badge>
                    </div>
                    <div className="mt-1 text-sm text-gray-500">
                      <span className="font-medium">Driver:</span> {assignment.driver_name}
                    </div>
                    <div className="mt-1 text-sm text-gray-500">
                      <span className="font-medium">Assigned:</span> {formatDate(assignment.assignment_date)}
                    </div>
                  </div>
                  <div className="mt-2 md:mt-0">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 px-3 text-gray-700 border-gray-300 hover:bg-gray-100"
                      onClick={(e) => {
                        e.stopPropagation()
                        toggleExpand(assignment.id)
                      }}
                    >
                      {expandedAssignments[assignment.id] ? "Hide Details" : "View Details"}
                    </Button>
                  </div>
                </div>

                {expandedAssignments[assignment.id] && (
                  <div className="p-4 bg-gray-50 border-t border-gray-200">
                    {cylinderAssignments[assignment.id]?.length > 0 ? (
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-gray-100 border-b border-gray-200">
                            <TableHead className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Cylinder Code
                            </TableHead>
                            <TableHead className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Size
                            </TableHead>
                            <TableHead className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Gas Type
                            </TableHead>
                            <TableHead className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Status
                            </TableHead>
                            <TableHead className="py-3 px-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Actions
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {cylinderAssignments[assignment.id].map((cylinder) => (
                            <TableRow key={cylinder.id} className="border-b border-gray-200 last:border-b-0">
                              <TableCell className="py-3 px-4 text-sm font-medium text-gray-900">
                                {cylinder.cylinder_code}
                              </TableCell>
                              <TableCell className="py-3 px-4 text-sm text-gray-700">
                                {cylinder.cylinder_size}
                              </TableCell>
                              <TableCell className="py-3 px-4 text-sm text-gray-700">{cylinder.gas_type}</TableCell>
                              <TableCell className="py-3 px-4 text-sm">
                                {cylinder.is_returned ? (
                                  <Badge className="bg-amber-100 text-amber-800 border-amber-200">Returned</Badge>
                                ) : cylinder.is_delivered ? (
                                  <Badge className="bg-blue-100 text-blue-800 border-blue-200">Delivered</Badge>
                                ) : (
                                  <Badge className="bg-teal-100 text-teal-800 border-teal-200">To be Delivered</Badge>
                                )}
                              </TableCell>
                              <TableCell className="py-3 px-4 text-right">
                                <div className="flex justify-end gap-2">
                                  {cylinder.is_delivered && !cylinder.is_returned && (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="h-8 px-3 text-amber-600 border-gray-300 hover:bg-amber-50"
                                      onClick={() => handleMarkAsReturned(assignment.id, cylinder.cylinder_id)}
                                    >
                                      <CheckCircle className="h-3.5 w-3.5 mr-1" />
                                      Mark Returned
                                    </Button>
                                  )}
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    ) : (
                      <div className="text-center py-4 text-gray-500">Loading cylinder details...</div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
