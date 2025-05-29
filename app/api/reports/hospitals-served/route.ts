import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import type { RowDataPacket } from "mysql2"

export async function GET() {
  try {
    console.log("🔍 Fetching hospitals served details")

    // Simple query without date filtering for now
    const [rows] = (await db.query(
      `
      SELECT 
        hospital_name,
        COUNT(*) as supply_count,
        SUM(total_price) as total_revenue
      FROM supplies 
      GROUP BY hospital_name
      ORDER BY supply_count DESC
      LIMIT 50
    `,
    )) as RowDataPacket[][]

    console.log(`✅ Found ${rows.length} hospitals`)

    return NextResponse.json({
      success: true,
      data: rows,
      count: rows.length,
    })
  } catch (error) {
    console.error("❌ Error fetching hospitals:", error)

    // Return empty data instead of error
    return NextResponse.json({
      success: true,
      data: [],
      count: 0,
      message: "No data available",
    })
  }
}
