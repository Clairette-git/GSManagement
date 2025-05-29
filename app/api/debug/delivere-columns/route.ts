import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET() {
  try {
    // Check cylinder_assignments table structure
    const [caColumns] = await db.query(`
      DESCRIBE cylinder_assignments
    `)

    // Check supplies table structure
    const [suppliesColumns] = await db.query(`
      DESCRIBE supplies
    `)

    // Check cylinders table structure
    const [cylindersColumns] = await db.query(`
      DESCRIBE cylinders
    `)

    // Check gas_types table structure
    const [gasTypesColumns] = await db.query(`
      DESCRIBE gas_types
    `)

    return NextResponse.json({
      success: true,
      data: {
        cylinder_assignments: caColumns,
        supplies: suppliesColumns,
        cylinders: cylindersColumns,
        gas_types: gasTypesColumns,
      },
    })
  } catch (error) {
    console.error("Error checking columns:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to check columns",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
