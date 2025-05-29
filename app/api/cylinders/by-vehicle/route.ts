import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const vehiclePlate = searchParams.get("plate")

    if (!vehiclePlate) {
      return NextResponse.json({ message: "Vehicle plate is required" }, { status: 400 })
    }

    // Get cylinders with status "to be delivered" that are assigned to this vehicle
    const [cylinders] = await db.query(
      `
      SELECT 
        c.id, 
        c.code, 
        c.size, 
        c.status,
        gt.name as gas_type
      FROM 
        cylinders c
      LEFT JOIN 
        gas_types gt ON c.gas_type_id = gt.id
      WHERE 
        c.status = 'to be delivered' 
        AND c.is_active = TRUE
        AND EXISTS (
          SELECT 1 
          FROM vehicle_assignments va
          JOIN cylinder_assignments ca ON va.id = ca.vehicle_assignment_id
          WHERE va.vehicle_plate = ? 
          AND va.is_active = TRUE
          AND ca.cylinder_id = c.id
          AND ca.is_delivered = FALSE
          AND ca.is_returned = FALSE
        )
      ORDER BY 
        c.code ASC
    `,
      [vehiclePlate],
    )

    return NextResponse.json({ data: cylinders })
  } catch (error) {
    console.error("Error fetching cylinders by vehicle:", error)
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 },
    )
  }
}
