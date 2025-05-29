import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import type { RowDataPacket } from "mysql2"

export async function GET() {
  try {
    console.log("Checking database table structure...")

    // Check cylinders table
    let cylindersInfo = null
    try {
      const [cylinderColumns] = (await db.query(`SHOW COLUMNS FROM cylinders`)) as RowDataPacket[][]
      cylindersInfo = {
        exists: true,
        columns: cylinderColumns.map((col) => ({
          name: col.Field,
          type: col.Type,
          null: col.Null,
          key: col.Key,
          default: col.Default,
        })),
      }
    } catch (e) {
      cylindersInfo = { exists: false, error: e instanceof Error ? e.message : "Unknown error" }
    }

    // Check supplies table
    let suppliesInfo = null
    try {
      const [suppliesColumns] = (await db.query(`SHOW COLUMNS FROM supplies`)) as RowDataPacket[][]
      suppliesInfo = {
        exists: true,
        columns: suppliesColumns.map((col) => ({
          name: col.Field,
          type: col.Type,
          null: col.Null,
          key: col.Key,
          default: col.Default,
        })),
      }
    } catch (e) {
      suppliesInfo = { exists: false, error: e instanceof Error ? e.message : "Unknown error" }
    }

    // Check invoices table
    let invoicesInfo = null
    try {
      const [invoicesColumns] = (await db.query(`SHOW COLUMNS FROM invoices`)) as RowDataPacket[][]
      invoicesInfo = {
        exists: true,
        columns: invoicesColumns.map((col) => ({
          name: col.Field,
          type: col.Type,
          null: col.Null,
          key: col.Key,
          default: col.Default,
        })),
      }
    } catch (e) {
      invoicesInfo = { exists: false, error: e instanceof Error ? e.message : "Unknown error" }
    }

    return NextResponse.json({
      success: true,
      tables: {
        cylinders: cylindersInfo,
        supplies: suppliesInfo,
        invoices: invoicesInfo,
      },
    })
  } catch (error) {
    console.error("Error checking table structure:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to check table structure",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
