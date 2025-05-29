import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const period = searchParams.get("period") || "day"
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")

    console.log("🔍 Fetching delivered details for period:", period)
    console.log("📅 Date range:", startDate, "to", endDate)

    // Build the base query - start simple and add complexity
    let query = `
      SELECT 
        c.id,
        c.code as cylinder_code,
        c.size,
        c.status
    `

    // Try to add date column - check common date column names
    const dateColumns = ["created_at", "date_created", "delivery_date", "updated_at"]
    let dateColumn = "c.id" // fallback to id if no date column found

    for (const col of dateColumns) {
      try {
        await db.query(`SELECT ${col} FROM cylinders LIMIT 1`)
        dateColumn = `c.${col}`
        query += `, c.${col} as delivery_date`
        break
      } catch (e) {
        // Column doesn't exist, try next one
        continue
      }
    }

    // If no date column found, use current timestamp
    if (dateColumn === "c.id") {
      query += `, NOW() as delivery_date`
    }

    // Try to add gas type
    try {
      await db.query(`SELECT gas_type FROM cylinders LIMIT 1`)
      query += `, c.gas_type as gas_type`
    } catch (e) {
      try {
        await db.query(`SELECT type FROM cylinders LIMIT 1`)
        query += `, c.type as gas_type`
      } catch (e2) {
        query += `, 'Gas Type' as gas_type`
      }
    }

    // Add hospital name placeholder for now
    query += `, 'Hospital Name' as hospital_name`

    // Complete the query
    query += `
      FROM cylinders c
      WHERE c.status = 'delivered'
    `

    let params: any[] = []

    // Add date filtering if we have a proper date column and date range
    if (dateColumn !== "c.id" && startDate && endDate) {
      query += ` AND DATE(${dateColumn}) BETWEEN ? AND ?`
      params = [startDate, endDate]
    }

    query += ` ORDER BY ${dateColumn} DESC LIMIT 100`

    console.log("📝 Executing query:", query)
    console.log("📝 With params:", params)

    const [rows] = await db.query(query, params)

    console.log("✅ Query result count:", (rows as any[]).length)

    return NextResponse.json({
      success: true,
      data: rows,
    })
  } catch (error) {
    console.error("❌ Error fetching delivered stats:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch delivered stats",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
