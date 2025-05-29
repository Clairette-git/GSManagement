import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { format } from "date-fns"

// Define the type for MySQL query results
type QueryResult = [any[], any]

export async function GET(request: Request) {
  try {
    // Get today's date in various formats
    const today = new Date()
    const todayFormatted = format(today, "yyyy-MM-dd")

    // Get database date format
    const dbDateResultQuery = (await db.query("SELECT NOW() as now, CURDATE() as today")) as QueryResult
    const dbDateResult = dbDateResultQuery[0]

    // Get sample dates from cylinders table
    const cylinderDatesQuery = (await db.query(`
      SELECT 
        id, 
        code,
        status,
        created_at,
        updated_at,
        filling_start_time,
        filling_end_time
      FROM cylinders
      LIMIT 5
    `)) as QueryResult
    const cylinderDates = cylinderDatesQuery[0]

    // Get counts by date
    const filledCountsQuery = (await db.query(`
      SELECT 
        DATE(filling_end_time) as date,
        COUNT(*) as count
      FROM cylinders
      WHERE status = 'filled'
      GROUP BY DATE(filling_end_time)
    `)) as QueryResult
    const filledCounts = filledCountsQuery[0]

    const deliveredCountsQuery = (await db.query(`
      SELECT 
        DATE(updated_at) as date,
        COUNT(*) as count
      FROM cylinders
      WHERE status = 'delivered'
      GROUP BY DATE(updated_at)
    `)) as QueryResult
    const deliveredCounts = deliveredCountsQuery[0]

    const returnedCountsQuery = (await db.query(`
      SELECT 
        DATE(updated_at) as date,
        COUNT(*) as count
      FROM cylinders
      WHERE status = 'returned'
      GROUP BY DATE(updated_at)
    `)) as QueryResult
    const returnedCounts = returnedCountsQuery[0]

    return NextResponse.json({
      clientDate: {
        raw: today.toString(),
        formatted: todayFormatted,
        iso: today.toISOString(),
        localeString: today.toLocaleString(),
      },
      databaseDate: dbDateResult[0],
      sampleCylinders: cylinderDates,
      countsByDate: {
        filled: filledCounts,
        delivered: deliveredCounts,
        returned: returnedCounts,
      },
    })
  } catch (error) {
    console.error("Error in debug dates API:", error)
    return NextResponse.json({ error: "Failed to fetch date information" }, { status: 500 })
  }
}
