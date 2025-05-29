import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const date = searchParams.get("date")

    if (!date) {
      return NextResponse.json({ success: false, message: "Date parameter is required" }, { status: 400 })
    }

    // Query to get supplies grouped by hospital for the given date
    const query = `
      SELECT 
        hospital_name,
        COUNT(DISTINCT s.id) as supply_count,
        SUM(s.total_price) as total_amount,
        COUNT(sd.cylinder_code) as cylinder_count
      FROM 
        supplies s
      LEFT JOIN 
        supply_details sd ON s.id = sd.supply_id
      WHERE 
        DATE(s.date) = ?
      GROUP BY 
        hospital_name
      ORDER BY 
        total_amount DESC
    `

    const [result] = await db.query(query, [date])

    return NextResponse.json({
      success: true,
      data: result,
    })
  } catch (error) {
    console.error("Error fetching hospital supplies:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch hospital supplies",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
