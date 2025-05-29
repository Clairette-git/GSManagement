import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { format } from "date-fns"

// Define the type for MySQL query results
type QueryResult = [any[], any]

export async function GET() {
  try {
    const today = format(new Date(), "yyyy-MM-dd")
    console.log("Fetching daily stats for date:", today)

    // Check if cylinder_status_history table exists
    const [tablesResult] = (await db.query(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'cylinder_status_history'
    `)) as QueryResult

    const hasCylinderStatusHistory = tablesResult.length > 0
    console.log("Has cylinder_status_history table:", hasCylinderStatusHistory)

    // Get cylinders filled today
    let filledToday = 0
    if (hasCylinderStatusHistory) {
      const [filledResult] = (await db.query(
        `
        SELECT COUNT(*) as count 
        FROM cylinder_status_history 
        WHERE new_status = 'filled' 
        AND DATE(changed_at) = ?
      `,
        [today],
      )) as QueryResult
      filledToday = filledResult[0]?.count || 0
    } else {
      // Fallback to check if filling_end_time column exists
      const [columnsResult] = (await db.query(`
        SELECT COLUMN_NAME 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'cylinders'
        AND COLUMN_NAME = 'filling_end_time'
      `)) as QueryResult

      if (columnsResult.length > 0) {
        const [filledResult] = (await db.query(
          `
          SELECT COUNT(*) as count 
          FROM cylinders 
          WHERE status = 'filled' 
          AND DATE(filling_end_time) = ?
        `,
          [today],
        )) as QueryResult
        filledToday = filledResult[0]?.count || 0
      } else {
        // No way to determine today's filled cylinders, show 0
        filledToday = 0
      }
    }

    // Get cylinders delivered today
    let deliveredToday = 0
    if (hasCylinderStatusHistory) {
      const [deliveredResult] = (await db.query(
        `
        SELECT COUNT(*) as count 
        FROM cylinder_status_history 
        WHERE new_status = 'delivered' 
        AND DATE(changed_at) = ?
      `,
        [today],
      )) as QueryResult
      deliveredToday = deliveredResult[0]?.count || 0
    } else {
      // No way to determine today's delivered cylinders, show 0
      deliveredToday = 0
    }

    // Get cylinders returned today
    let returnedToday = 0
    if (hasCylinderStatusHistory) {
      const [returnedResult] = (await db.query(
        `
        SELECT COUNT(*) as count 
        FROM cylinder_status_history 
        WHERE new_status = 'returned' 
        AND DATE(changed_at) = ?
      `,
        [today],
      )) as QueryResult
      returnedToday = returnedResult[0]?.count || 0
    } else {
      // No way to determine today's returned cylinders, show 0
      returnedToday = 0
    }

    // Get supplies created today
    const [suppliesResult] = (await db.query(
      `
      SELECT COUNT(*) as count 
      FROM supplies 
      WHERE DATE(date) = ?
    `,
      [today],
    )) as QueryResult
    const suppliesCreated = suppliesResult[0]?.count || 0

    // Get revenue generated today
    const [revenueResult] = (await db.query(
      `
      SELECT SUM(total_price) as total 
      FROM supplies 
      WHERE DATE(date) = ?
    `,
      [today],
    )) as QueryResult
    const revenue = revenueResult[0]?.total || 0

    // Get number of hospitals supplied today
    const [hospitalsResult] = (await db.query(
      `
      SELECT COUNT(DISTINCT hospital_name) as count 
      FROM supplies 
      WHERE DATE(date) = ?
    `,
      [today],
    )) as QueryResult
    const hospitalsSupplied = hospitalsResult[0]?.count || 0

    // Get returned cylinders by hospital - simplified query without the problematic join
    let returnedByHospital: any[] = []
    if (hasCylinderStatusHistory) {
      try {
        // First, let's check what columns exist in cylinder_assignments table
        const [assignmentColumnsResult] = (await db.query(`
          SELECT COLUMN_NAME 
          FROM INFORMATION_SCHEMA.COLUMNS 
          WHERE TABLE_SCHEMA = DATABASE() 
          AND TABLE_NAME = 'cylinder_assignments'
        `)) as QueryResult

        console.log(
          "Cylinder assignments columns:",
          assignmentColumnsResult.map((col) => col.COLUMN_NAME),
        )

        // For now, let's just get the count of returned cylinders without hospital breakdown
        const [returnedByHospitalResult] = (await db.query(
          `
          SELECT 'All Hospitals' as hospital_name, COUNT(*) as count
          FROM cylinder_status_history 
          WHERE new_status = 'returned'
          AND DATE(changed_at) = ?
        `,
          [today],
        )) as QueryResult
        returnedByHospital = returnedByHospitalResult
      } catch (error) {
        console.error("Error fetching returned cylinders by hospital:", error)
      }
    }

    return NextResponse.json({
      filledToday,
      deliveredToday,
      returnedToday,
      suppliesCreated,
      revenue,
      hospitalsSupplied,
      returnedByHospital,
      debug: {
        date: today,
        hasCylinderStatusHistory,
      },
    })
  } catch (error) {
    console.error("Error fetching daily stats:", error)
    return NextResponse.json(
      {
        message: "Failed to fetch daily stats",
        error: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 },
    )
  }
}
