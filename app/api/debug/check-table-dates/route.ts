import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import type { RowDataPacket } from "mysql2"

export async function GET() {
  try {
    const results: any = {}

    // Check cylinders table columns
    try {
      const [cylinderColumns] = (await db.query(`
        SELECT COLUMN_NAME, DATA_TYPE 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'cylinders'
        ORDER BY ORDINAL_POSITION
      `)) as RowDataPacket[][]

      results.cylinderColumns = cylinderColumns

      // Get sample data from cylinders
      const [cylinderSample] = (await db.query(`SELECT * FROM cylinders LIMIT 3`)) as RowDataPacket[][]
      results.cylinderSample = cylinderSample

      // Count cylinders by status
      const [cylinderCounts] = (await db.query(`
        SELECT status, COUNT(*) as count 
        FROM cylinders 
        GROUP BY status
      `)) as RowDataPacket[][]
      results.cylinderCounts = cylinderCounts
    } catch (e) {
      results.cylinderError = e instanceof Error ? e.message : "Unknown error"
    }

    // Check supplies table columns
    try {
      const [suppliesColumns] = (await db.query(`
        SELECT COLUMN_NAME, DATA_TYPE 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'supplies'
        ORDER BY ORDINAL_POSITION
      `)) as RowDataPacket[][]

      results.suppliesColumns = suppliesColumns

      // Get sample data from supplies
      const [suppliesSample] = (await db.query(`SELECT * FROM supplies LIMIT 3`)) as RowDataPacket[][]
      results.suppliesSample = suppliesSample

      // Count supplies
      const [suppliesCount] = (await db.query(`SELECT COUNT(*) as total FROM supplies`)) as RowDataPacket[][]
      results.suppliesTotal = suppliesCount[0]?.total || 0
    } catch (e) {
      results.suppliesError = e instanceof Error ? e.message : "Unknown error"
    }

    return NextResponse.json({
      success: true,
      data: results,
    })
  } catch (error) {
    console.error("Error checking table structure:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to check table structure",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
