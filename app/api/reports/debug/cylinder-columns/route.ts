import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET() {
  try {
    // Check cylinders table structure
    const [cylindersColumns] = await db.query(`
      DESCRIBE cylinders
    `)

    // Get a sample row from cylinders
    const [sampleRow] = await db.query(`
      SELECT * FROM cylinders LIMIT 1
    `)

    return NextResponse.json({
      success: true,
      columns: cylindersColumns,
      sampleRow: sampleRow,
    })
  } catch (error) {
    console.error("Error checking cylinders columns:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to check cylinders columns",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
