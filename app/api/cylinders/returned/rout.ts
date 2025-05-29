import { db } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    // Get date from query params if provided
    const { searchParams } = new URL(request.url)
    const date = searchParams.get("date")

    let query = `
      SELECT 
        s.hospital_name, 
        COUNT(c.id) as count
      FROM 
        cylinders c
      LEFT JOIN 
        supplies s ON c.supply_id = s.id
      WHERE 
        c.status = 'returned'
    `

    // Add date filter if provided
    if (date) {
      query += ` AND DATE(c.updated_at) = ?`
    }

    query += `
      GROUP BY 
        s.hospital_name
      ORDER BY 
        count DESC
    `

    // Execute query with or without date parameter
    const [rows] = date ? await db.query(query, [date]) : await db.query(query)

    // Handle case where no results are found
    if (!rows || (Array.isArray(rows) && rows.length === 0)) {
      return NextResponse.json({
        success: true,
        data: [],
        message: "No returned cylinders found",
      })
    }

    // Return the results
    return NextResponse.json({
      success: true,
      data: rows,
    })
  } catch (error) {
    console.error("Error fetching returned cylinders:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch returned cylinders",
        error: (error as Error).message,
      },
      { status: 500 },
    )
  }
}
