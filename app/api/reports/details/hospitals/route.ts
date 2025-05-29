import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")

    let query = `
      SELECT 
        hospital_name,
        COUNT(id) as cylinder_count,
        SUM(total_price) as total_amount,
        MIN(date) as first_supply_date,
        MAX(date) as last_supply_date
      FROM supplies
    `

    let whereClause = ""
    const params: any[] = []

    if (startDate && endDate) {
      whereClause = " WHERE DATE(date) BETWEEN ? AND ?"
      params.push(startDate, endDate)
    }

    query += whereClause + " GROUP BY hospital_name ORDER BY COUNT(id) DESC"

    const [rows] = await db.query(query, params)

    return NextResponse.json({
      success: true,
      data: rows,
    })
  } catch (error) {
    console.error("Error fetching hospital stats:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch hospital stats",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
