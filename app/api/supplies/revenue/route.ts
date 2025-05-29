import { NextResponse } from "next/server"
import { db } from "@/lib/db"

// Define the type for MySQL query results
type QueryResult = [any[], any]

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const date = searchParams.get("date") || new Date().toISOString().split("T")[0]

    // Query to get detailed revenue information for the given date
    const query = `
      SELECT 
        s.id,
        s.hospital_name,
        s.total_price,
        s.date,
        COUNT(sd.cylinder_code) as cylinder_count
      FROM 
        supplies s
      LEFT JOIN 
        supply_details sd ON s.id = sd.supply_id
      WHERE 
        DATE(s.date) = ?
      GROUP BY 
        s.id
      ORDER BY 
        s.date DESC
    `

    const result = (await db.query(query, [date])) as QueryResult
    const data = result[0]

    return NextResponse.json({
      success: true,
      data,
    })
  } catch (error) {
    console.error("Error fetching revenue details:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch revenue details",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
