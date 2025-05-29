import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import type { VehicleAssignment } from "@/types"

export async function GET() {
  try {
    // Check if vehicle_assignments table exists
    const [tables] = await db.query(
      "SELECT COUNT(*) as count FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'vehicle_assignments'",
    )

    const tableExists = (tables as any[])[0].count > 0

    if (!tableExists) {
      return NextResponse.json({ vehicleAssignments: [] })
    }

    // Get all active vehicle assignments with cylinder counts
    const [assignments] = await db.query(`
      SELECT 
        va.id,
        va.vehicle_plate,
        va.driver_name,
        va.assignment_date,
        va.is_active,
        COUNT(ca.id) as cylinder_count
      FROM 
        vehicle_assignments va
      LEFT JOIN 
        cylinder_assignments ca ON va.id = ca.vehicle_assignment_id
      WHERE 
        va.is_active = TRUE
      GROUP BY 
        va.id
      ORDER BY 
        va.assignment_date DESC
    `)

    const vehicleAssignments = (assignments as any[]).map((assignment) => ({
      id: assignment.id,
      vehicle_plate: assignment.vehicle_plate,
      driver_name: assignment.driver_name,
      assignment_date: assignment.assignment_date,
      is_active: Boolean(assignment.is_active),
      cylinder_count: assignment.cylinder_count,
    })) as VehicleAssignment[]

    return NextResponse.json({ vehicleAssignments })
  } catch (error) {
    console.error("Error fetching vehicle assignments:", error)
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 },
    )
  }
}
