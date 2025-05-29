import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { format } from "date-fns"

// Define the type for MySQL query results
type QueryResult = [any[], any]

export async function GET(request: Request) {
  try {
    // Get today's date in MySQL format (YYYY-MM-DD)
    const today = format(new Date(), "yyyy-MM-dd")

    // Get all columns in the cylinders table
    const columnsResult = (await db.query(
      `
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'cylinders'
      `,
    )) as QueryResult

    const columns = columnsResult[0].map((row: any) => row.COLUMN_NAME)

    // Get sample data from cylinders table
    const sampleResult = (await db.query(
      `
      SELECT * FROM cylinders LIMIT 10
      `,
    )) as QueryResult

    const sampleData = sampleResult[0]

    // Get counts by status
    const statusCountResult = (await db.query(
      `
      SELECT status, COUNT(*) as count 
      FROM cylinders 
      GROUP BY status
      `,
    )) as QueryResult

    const statusCounts = statusCountResult[0]

    // Check if there are any cylinders with today's date in various date columns
    const dateChecks: Record<string, any> = {}

    // Check each potential date column
    const dateColumns = ["created_at", "updated_at", "filling_start_time", "filling_end_time"]

    for (const column of dateColumns) {
      if (columns.includes(column)) {
        const result = (await db.query(
          `
          SELECT COUNT(*) as count 
          FROM cylinders 
          WHERE DATE(${column}) = ?
          `,
          [today],
        )) as QueryResult

        dateChecks[column] = result[0][0].count
      } else {
        dateChecks[column] = "Column does not exist"
      }
    }

    // Get cylinders modified today
    let cylindersModifiedToday: any[] = []

    try {
      if (columns.includes("updated_at")) {
        const result = (await db.query(
          `
          SELECT * 
          FROM cylinders 
          WHERE DATE(updated_at) = ?
          LIMIT 10
          `,
          [today],
        )) as QueryResult

        cylindersModifiedToday = result[0]
      }
    } catch (error) {
      console.error("Error getting cylinders modified today:", error)
    }

    return NextResponse.json({
      today,
      columns,
      sampleData,
      statusCounts,
      dateChecks,
      cylindersModifiedToday,
    })
  } catch (error) {
    console.error("Error in debug cylinders API:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch debug cylinder data",
      },
      { status: 500 },
    )
  }
}
