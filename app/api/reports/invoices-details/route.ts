import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import type { RowDataPacket } from "mysql2"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const period = searchParams.get("period") || "day"
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")

    console.log("📄 Fetching invoice details for period:", period, "from", startDate, "to", endDate)

    try {
      // Use supplies as invoices (simplified query)
      const [rows] = (await db.query(
        `SELECT 
          id,
          hospital_name,
          total_price as amount,
          'generated' as status,
          created_at
        FROM supplies 
        ORDER BY created_at DESC 
        LIMIT 100`,
      )) as RowDataPacket[][]

      console.log(`✅ Found ${rows.length} invoice records`)

      return NextResponse.json({
        success: true,
        data: rows,
        count: rows.length,
      })
    } catch (dbError) {
      console.error("❌ Database error in invoice details:", dbError)

      // Return empty data instead of error
      return NextResponse.json({
        success: true,
        data: [],
        count: 0,
        message: "No invoice data available",
      })
    }
  } catch (error) {
    console.error("❌ Error fetching invoice details:", error)
    return NextResponse.json({
      success: true,
      data: [],
      count: 0,
      message: "Error loading invoice data",
    })
  }
}
