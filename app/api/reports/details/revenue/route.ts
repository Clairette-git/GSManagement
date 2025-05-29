import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")
    const period = searchParams.get("period") || "day"

    let groupBy = "DATE(date)"
    let dateFormat = "%Y-%m-%d"

    // Adjust grouping based on period
    if (period === "month") {
      groupBy = "YEAR(date), MONTH(date)"
      dateFormat = "%Y-%m"
    } else if (period === "year") {
      groupBy = "YEAR(date)"
      dateFormat = "%Y"
    }

    let query = `
      SELECT 
        DATE_FORMAT(date, ?) as period,
        SUM(total_price) as total_amount,
        COUNT(id) as supply_count,
        COUNT(DISTINCT hospital_name) as hospital_count
      FROM supplies
    `

    let whereClause = ""
    const params: any[] = [dateFormat]

    if (startDate && endDate) {
      whereClause = " WHERE DATE(date) BETWEEN ? AND ?"
      params.push(startDate, endDate)
    }

    query += whereClause + ` GROUP BY ${groupBy} ORDER BY date DESC`

    const [rows] = await db.query(query, params)

    return NextResponse.json({
      success: true,
      data: rows,
    })
  } catch (error) {
    console.error("Error fetching revenue stats:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch revenue stats",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
