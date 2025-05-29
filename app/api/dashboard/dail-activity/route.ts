import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { format } from "date-fns"
import type { RowDataPacket } from "mysql2"

interface StatusCount extends RowDataPacket {
  new_status: string
  count: number
}

interface SupplyStats extends RowDataPacket {
  count: number
  revenue: number
  hospitals: number
}

interface ReturnedByHospital extends RowDataPacket {
  hospital_name: string
  count: number
}

interface TableCheck extends RowDataPacket {
  count: number
}

export async function GET(request: Request) {
  try {
    // Get today's date in MySQL format (YYYY-MM-DD)
    const today = format(new Date(), "yyyy-MM-dd")

    // Initialize response object
    const stats = {
      filledToday: 0,
      deliveredToday: 0,
      returnedToday: 0,
      suppliesCreated: 0,
      revenue: 0,
      hospitalsSupplied: 0,
      returnedByHospital: [] as ReturnedByHospital[],
    }

    try {
      // Check if cylinder_status_history table exists
      const [tables] = await db.query<TableCheck[]>(
        `
        SELECT COUNT(*) as count 
        FROM information_schema.tables 
        WHERE table_schema = DATABASE() 
        AND table_name = 'cylinder_status_history'
      `,
      )

      const tableExists = tables[0]?.count > 0

      if (tableExists) {
        // Count status changes that happened today
        const [statusChanges] = await db.query<StatusCount[]>(
          `
          SELECT 
            new_status, 
            COUNT(*) as count 
          FROM cylinder_status_history 
          WHERE DATE(changed_at) = ?
          GROUP BY new_status
        `,
          [today],
        )

        if (Array.isArray(statusChanges)) {
          for (const row of statusChanges) {
            if (row.new_status === "filled") {
              stats.filledToday = row.count
            } else if (row.new_status === "delivered") {
              stats.deliveredToday = row.count
            } else if (row.new_status === "returned") {
              stats.returnedToday = row.count
            }
          }
        }
      } else {
        // Fallback to counting current status
        const [statusCounts] = await db.query<StatusCount[]>(
          `
          SELECT 
            status as new_status, 
            COUNT(*) as count 
          FROM cylinders 
          GROUP BY status
        `,
        )

        if (Array.isArray(statusCounts)) {
          for (const row of statusCounts) {
            if (row.new_status === "filled") {
              stats.filledToday = row.count
            } else if (row.new_status === "delivered") {
              stats.deliveredToday = row.count
            } else if (row.new_status === "returned") {
              stats.returnedToday = row.count
            }
          }
        }
      }
    } catch (error) {
      console.error("Error counting cylinder status changes:", error)
    }

    try {
      // Count supplies created today
      const [suppliesResult] = await db.query<SupplyStats[]>(
        `
        SELECT 
          COUNT(*) as count,
          SUM(total_price) as revenue,
          COUNT(DISTINCT hospital_name) as hospitals
        FROM supplies
        WHERE DATE(date) = ?
      `,
        [today],
      )

      if (Array.isArray(suppliesResult) && suppliesResult.length > 0) {
        const row = suppliesResult[0]
        stats.suppliesCreated = row.count || 0
        stats.revenue = row.revenue || 0
        stats.hospitalsSupplied = row.hospitals || 0
      }
    } catch (error) {
      console.error("Error counting supplies:", error)
    }

    try {
      // Get returned cylinders by hospital
      const [returnedResult] = await db.query<ReturnedByHospital[]>(
        `
        SELECT 
          s.hospital_name,
          COUNT(*) as count
        FROM cylinders c
        JOIN supply_details sd ON c.code = sd.cylinder_code
        JOIN supplies s ON sd.supply_id = s.id
        WHERE c.status = 'returned'
        GROUP BY s.hospital_name
      `,
      )

      if (Array.isArray(returnedResult)) {
        stats.returnedByHospital = returnedResult
      }
    } catch (error) {
      console.error("Error counting returned cylinders by hospital:", error)
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error("Error in daily activity API:", error)
    return NextResponse.json({ error: "Failed to fetch daily activity stats" }, { status: 500 })
  }
}
