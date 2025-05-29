import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { format } from "date-fns"

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const date = url.searchParams.get("date") || format(new Date(), "yyyy-MM-dd")

    // Get the start and end of the specified day
    const dayStart = `${date} 00:00:00`
    const dayEnd = `${date} 23:59:59`

    // Query for cylinders filled today (status changed to "filled" today)
    const [filledCylinders] = await db.query(
      `SELECT COUNT(*) as count FROM cylinders 
       WHERE status = 'filled' 
       AND updated_at BETWEEN ? AND ?`,
      [dayStart, dayEnd],
    )

    // Query for cylinders delivered today (status changed to "delivered" today)
    const [deliveredCylinders] = await db.query(
      `SELECT COUNT(*) as count FROM cylinders 
       WHERE status = 'delivered' 
       AND updated_at BETWEEN ? AND ?`,
      [dayStart, dayEnd],
    )

    // Query for cylinders returned today (status changed to "returned" today)
    const [returnedCylinders] = await db.query(
      `SELECT COUNT(*) as count FROM cylinders 
       WHERE status = 'returned' 
       AND updated_at BETWEEN ? AND ?`,
      [dayStart, dayEnd],
    )

    // Query for hospitals supplied today
    const [hospitalsSupplied] = await db.query(
      `SELECT COUNT(DISTINCT hospital_name) as count FROM supplies 
       WHERE date BETWEEN ? AND ?`,
      [dayStart, dayEnd],
    )

    // Query for total revenue today
    const [revenue] = await db.query(
      `SELECT SUM(total_price) as total FROM supplies 
       WHERE date BETWEEN ? AND ?`,
      [dayStart, dayEnd],
    )

    // Query for returned cylinders by hospital
    const [returnedByHospital] = await db.query(
      `SELECT hospital_name, COUNT(*) as count FROM cylinders 
       WHERE status = 'returned' 
       AND updated_at BETWEEN ? AND ? 
       GROUP BY hospital_name`,
      [dayStart, dayEnd],
    )

    return NextResponse.json({
      data: {
        cylindersFilled: (filledCylinders as any[])[0]?.count || 0,
        cylindersDelivered: (deliveredCylinders as any[])[0]?.count || 0,
        cylindersReturned: (returnedCylinders as any[])[0]?.count || 0,
        hospitalsSupplied: (hospitalsSupplied as any[])[0]?.count || 0,
        dailyRevenue: (revenue as any[])[0]?.total || 0,
        returnedByHospital: returnedByHospital || [],
      },
    })
  } catch (error) {
    console.error("Error fetching daily stats:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
