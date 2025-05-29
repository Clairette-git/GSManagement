import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const period = searchParams.get("period") || "day"
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")

    // Check if cylinder_status_history table exists
    const [tablesResult] = await db.query(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'cylinder_status_history'
    `)

    const hasCylinderStatusHistory = (tablesResult as any[]).length > 0

    let query = ""
    let params: any[] = []

    if (hasCylinderStatusHistory) {
      query = `
        SELECT c.id, c.code, c.size, c.gas_type, csh.changed_at as return_date,
               ca.hospital_name
        FROM cylinders c
        JOIN cylinder_status_history csh ON c.id = csh.cylinder_id
        LEFT JOIN cylinder_assignments ca ON c.id = ca.cylinder_id AND ca.status = 'returned'
        WHERE csh.new_status = 'returned'
      `

      if (startDate && endDate) {
        query += " AND DATE(csh.changed_at) BETWEEN ? AND ?"
        params = [startDate, endDate]
      }

      query += " ORDER BY csh.changed_at DESC LIMIT 500"
    } else {
      // Fallback to cylinder_assignments table
      query = `
        SELECT c.id, c.code, c.size, c.gas_type, ca.return_date,
               ca.hospital_name
        FROM cylinders c
        JOIN cylinder_assignments ca ON c.id = ca.cylinder_id
        WHERE ca.status = 'returned'
      `

      if (startDate && endDate) {
        query += " AND DATE(ca.return_date) BETWEEN ? AND ?"
        params = [startDate, endDate]
      }

      query += " ORDER BY ca.return_date DESC LIMIT 500"
    }

    const [rows] = await db.query(query, params)

    return NextResponse.json({
      success: true,
      data: rows,
    })
  } catch (error) {
    console.error("Error fetching returned stats:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch returned stats",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
