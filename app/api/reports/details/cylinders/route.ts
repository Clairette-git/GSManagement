import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const period = searchParams.get("period") || "day"
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")

    let query = `
      SELECT 
        c.id,
        c.code,
        c.size,
        c.gas_type,
        c.status,
        c.created_at,
        c.updated_at
      FROM cylinders c
    `

    let whereClause = ""
    const params: any[] = []

    if (startDate && endDate) {
      whereClause = " WHERE DATE(c.created_at) BETWEEN ? AND ?"
      params.push(startDate, endDate)
    }

    query += whereClause + " ORDER BY c.created_at DESC LIMIT 500"

    const [rows] = await db.query(query, params)

    // Get status distribution
    const statusQuery = `
      SELECT 
        status, 
        COUNT(*) as count
      FROM cylinders
      GROUP BY status
    `
    const [statusRows] = await db.query(statusQuery)

    return NextResponse.json({
      success: true,
      data: rows,
      statusDistribution: statusRows,
    })
  } catch (error) {
    console.error("Error fetching cylinder details:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch cylinder details",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
