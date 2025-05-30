import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import type { RowDataPacket } from "mysql2"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const period = searchParams.get("period") || "week"
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")

    console.log(`🔍 Fetching filled cylinders for period: ${period}`)
    console.log(`📅 Date range: ${startDate} to ${endDate}`)

    // Check if gas_types table exists and get its structure
    let gasTypeJoin = ""
    let gasTypeSelect = "'N/A' as gas_type"

    try {
      const [gasTypesCheck] = (await db.query("SHOW TABLES LIKE 'gas_types'")) as RowDataPacket[][]
      if (gasTypesCheck.length > 0) {
        // Check if gas_types table has the expected columns
        const [gasTypesColumns] = (await db.query("SHOW COLUMNS FROM gas_types")) as RowDataPacket[][]
        const hasNameColumn = gasTypesColumns.some((col: any) => col.Field === "name")

        if (hasNameColumn) {
          gasTypeJoin = "LEFT JOIN gas_types gt ON c.gas_type_id = gt.id"
          gasTypeSelect = "COALESCE(gt.name, 'Unknown') as gas_type"
        }
      }
    } catch (error) {
      console.log("Gas types table not available, using fallback")
    }

    let query = `
      SELECT 
        c.id,
        c.code,
        c.size,
        ${gasTypeSelect},
        c.status,
        c.created_at,
        c.updated_at
      FROM cylinders c
      ${gasTypeJoin}
      WHERE c.status = 'filled'
    `

    const params: any[] = []

    // Add date filtering if provided
    if (startDate && endDate) {
      query += ` AND DATE(c.created_at) >= ? AND DATE(c.created_at) <= ?`
      params.push(startDate, endDate)
    }

    query += ` ORDER BY c.created_at DESC LIMIT 100`

    console.log("🔍 Executing query:", query)
    console.log("📊 With params:", params)

    const [rows] = (await db.query(query, params)) as RowDataPacket[][]

    console.log(`✅ Found ${rows.length} filled cylinders`)

    return NextResponse.json({
      success: true,
      data: rows,
      count: rows.length,
    })
  } catch (error) {
    console.error("❌ Error fetching filled cylinders:", error)

    return NextResponse.json({
      success: true,
      data: [],
      count: 0,
      message: "No data available",
    })
  }
}
