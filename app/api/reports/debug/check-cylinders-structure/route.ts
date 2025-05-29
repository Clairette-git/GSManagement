import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET() {
  try {
    // Check cylinders table structure
    const [cylindersColumns] = await db.query(`
      SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'cylinders'
      ORDER BY ORDINAL_POSITION
    `)

    // Get a sample row to see actual data
    const [sampleData] = await db.query(`
      SELECT * FROM cylinders LIMIT 1
    `)

    // Check if gas_types table exists
    const [gasTypesExists] = await db.query(`
      SELECT COUNT(*) as count
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'gas_types'
    `)

    // Check if supplies table exists
    const [suppliesExists] = await db.query(`
      SELECT COUNT(*) as count
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'supplies'
    `)

    return NextResponse.json({
      success: true,
      data: {
        cylindersColumns,
        sampleData,
        hasGasTypesTable: (gasTypesExists as any)[0]?.count > 0,
        hasSuppliesTable: (suppliesExists as any)[0]?.count > 0,
      },
    })
  } catch (error) {
    console.error("Error checking database structure:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
