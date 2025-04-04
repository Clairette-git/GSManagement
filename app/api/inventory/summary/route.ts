import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET() {
  try {
    // Get inventory summary with gas type names
    const [summary] = await db.query(`
      SELECT 
        i.gas_type_id, 
        g.name AS gas_name, 
        i.total_cylinders, 
        i.total_liters
      FROM 
        inventory i
      JOIN 
        gas_types g ON i.gas_type_id = g.id
      ORDER BY 
        g.name
    `)

    return NextResponse.json({
      data: summary,
    })
  } catch (error) {
    console.error("Error fetching inventory summary:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

