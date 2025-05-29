import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import type { CylinderAssignment } from "@/types"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const assignmentId = Number.parseInt(params.id)

    if (isNaN(assignmentId)) {
      return NextResponse.json({ message: "Invalid assignment ID" }, { status: 400 })
    }

    // Get all cylinders for this assignment with details
    const [cylinders] = await db.query(
      `
      SELECT 
        ca.id,
        ca.vehicle_assignment_id,
        ca.cylinder_id,
        ca.is_delivered,
        ca.is_returned,
        c.code as cylinder_code,
        c.size as cylinder_size,
        COALESCE(gt.name, 'Empty') as gas_type
      FROM 
        cylinder_assignments ca
      JOIN 
        cylinders c ON ca.cylinder_id = c.id
      LEFT JOIN 
        gas_types gt ON c.gas_type_id = gt.id
      WHERE 
        ca.vehicle_assignment_id = ?
      ORDER BY 
        c.code
    `,
      [assignmentId],
    )

    const cylinderAssignments = (cylinders as any[]).map((cylinder) => ({
      id: cylinder.id,
      vehicle_assignment_id: cylinder.vehicle_assignment_id,
      cylinder_id: cylinder.cylinder_id,
      cylinder_code: cylinder.cylinder_code,
      cylinder_size: cylinder.cylinder_size,
      gas_type: cylinder.gas_type,
      is_delivered: Boolean(cylinder.is_delivered),
      is_returned: Boolean(cylinder.is_returned),
    })) as CylinderAssignment[]

    return NextResponse.json({ cylinderAssignments })
  } catch (error) {
    console.error(`Error fetching cylinder assignments for vehicle ${params.id}:`, error)
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 },
    )
  }
}
