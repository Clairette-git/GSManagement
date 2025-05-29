import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")

    // Check if invoices table exists
    const [tablesResult] = await db.query(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'invoices'
    `)

    const hasInvoicesTable = (tablesResult as any[]).length > 0

    if (!hasInvoicesTable) {
      return NextResponse.json({
        success: true,
        data: [],
        message: "Invoices table does not exist",
      })
    }

    let query = `
      SELECT 
        i.id, 
        i.invoice_number,
        i.amount,
        i.status,
        i.created_at,
        s.hospital_name
      FROM invoices i
      LEFT JOIN supplies s ON i.supply_id = s.id
    `

    let whereClause = ""
    const params: any[] = []

    if (startDate && endDate) {
      whereClause = " WHERE DATE(i.created_at) BETWEEN ? AND ?"
      params.push(startDate, endDate)
    }

    query += whereClause + " ORDER BY i.created_at DESC"

    const [rows] = await db.query(query, params)

    return NextResponse.json({
      success: true,
      data: rows,
    })
  } catch (error) {
    console.error("Error fetching invoice stats:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch invoice stats",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
