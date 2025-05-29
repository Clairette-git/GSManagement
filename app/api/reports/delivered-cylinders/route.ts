import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import type { RowDataPacket } from "mysql2"

export async function GET() {
  try {
    console.log("🔍 Fetching delivered cylinders details")

    // Simple query without date filtering for now
    const [rows] = (await db.query(
      `
      SELECT 
        id,
        code,
        size,
        status
      FROM cylinders 
      WHERE status = 'delivered'
      ORDER BY id DESC
      LIMIT 50
    `,
    )) as RowDataPacket[][]

    console.log(`✅ Found ${rows.length} delivered cylinders`)

    return NextResponse.json({
      success: true,
      data: rows,
      count: rows.length,
    })
  } catch (error) {
    console.error("❌ Error fetching delivered cylinders:", error)

    // Return empty data instead of error
    return NextResponse.json({
      success: true,
      data: [],
      count: 0,
      message: "No data available",
    })
  }
}
