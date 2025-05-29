import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { format } from "date-fns"

// Define the type for MySQL query results
type QueryResult = [any[], any]

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const today = format(new Date(), "yyyy-MM-dd")
    const skipDateFilter = searchParams.get("skipDateFilter") === "true"

    // If status is provided, filter by status
    if (status) {
      // First, check if the cylinders table has an updated_at column
      const [columns] = (await db.query(`
        SELECT COLUMN_NAME
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'cylinders'
      `)) as QueryResult

      const columnNames = columns.map((col) => col.COLUMN_NAME)
      const hasUpdatedAt = columnNames.includes("updated_at")

      // For delivered cylinders, we need to join with cylinder_status_history to get the date
      if (status === "delivered") {
        // For delivered cylinders, we need to check when they were actually delivered
        // This should be based on when the status was changed to 'delivered'
        const query = `
          SELECT 
            c.id, c.code, c.size, c.status,
            gt.name as gas_type,
            csh.changed_at as delivery_date
          FROM 
            cylinders c
          LEFT JOIN 
            gas_types gt ON c.gas_type_id = gt.id
          LEFT JOIN 
            cylinder_status_history csh ON c.id = csh.cylinder_id 
            AND csh.new_status = 'delivered'
          WHERE 
            c.status = ?
            ${!skipDateFilter ? "AND DATE(csh.changed_at) = ?" : ""}
          ORDER BY 
            ${!skipDateFilter ? "csh.changed_at" : "c.code"} DESC
        `

        const params = !skipDateFilter ? [status, today] : [status]
        const [cylinders] = (await db.query(query, params)) as QueryResult
        return NextResponse.json({ data: cylinders })
      } else if (status === "filled") {
        // For filled cylinders, filter by filling_end_time if available and not skipping date filter
        const query = `
          SELECT 
            c.id, c.code, c.size, c.status, c.filling_start_time, c.filling_end_time,
            gt.name as gas_type
          FROM 
            cylinders c
          LEFT JOIN 
            gas_types gt ON c.gas_type_id = gt.id
          WHERE 
            c.status = ?
            ${columnNames.includes("filling_end_time") && !skipDateFilter ? "AND DATE(c.filling_end_time) = ?" : ""}
          ORDER BY 
            ${columnNames.includes("filling_end_time") ? "c.filling_end_time" : "c.code"} DESC
        `

        const params = columnNames.includes("filling_end_time") && !skipDateFilter ? [status, today] : [status]
        const [cylinders] = (await db.query(query, params)) as QueryResult

        return NextResponse.json({ data: cylinders })
      } else if (status === "returned") {
        // For returned cylinders, check when they were marked as returned
        const query = `
          SELECT 
            c.id, c.code, c.size, c.status,
            gt.name as gas_type,
            csh.changed_at as return_date
          FROM 
            cylinders c
          LEFT JOIN 
            gas_types gt ON c.gas_type_id = gt.id
          LEFT JOIN 
            cylinder_status_history csh ON c.id = csh.cylinder_id 
            AND csh.new_status = 'returned'
          WHERE 
            c.status = ?
            ${!skipDateFilter ? "AND DATE(csh.changed_at) = ?" : ""}
          ORDER BY 
            ${!skipDateFilter ? "csh.changed_at" : "c.code"} DESC
        `

        const params = !skipDateFilter ? [status, today] : [status]
        const [cylinders] = (await db.query(query, params)) as QueryResult
        return NextResponse.json({ data: cylinders })
      } else {
        // For other statuses, just filter by status
        const query = `
          SELECT 
            c.*, gt.name as gas_type
          FROM 
            cylinders c
          LEFT JOIN 
            gas_types gt ON c.gas_type_id = gt.id
          WHERE 
            c.status = ?
          ORDER BY 
            c.code
        `

        const [cylinders] = (await db.query(query, [status])) as QueryResult
        return NextResponse.json({ data: cylinders })
      }
    }

    // Otherwise, return all cylinders
    const [cylinders] = (await db.query("SELECT * FROM cylinders ORDER BY code")) as QueryResult

    return NextResponse.json({
      data: cylinders,
    })
  } catch (error) {
    console.error("Error fetching cylinders:", error)
    return NextResponse.json(
      {
        message: "Error fetching cylinders",
        error: error instanceof Error ? error.message : String(error),
        status: "error",
      },
      { status: 500 },
    )
  }
}

export async function POST(request: Request) {
  try {
    const { code, size, gas_type_id, status, filling_start_time, filling_end_time, is_active } = await request.json()

    if (!code || !size) {
      return NextResponse.json({ message: "Code and size are required" }, { status: 400 })
    }

    // Check if code already exists
    const [existingCylinders] = (await db.query("SELECT * FROM cylinders WHERE code = ?", [code])) as QueryResult

    if (existingCylinders.length > 0) {
      return NextResponse.json({ message: "Cylinder code already exists" }, { status: 400 })
    }

    // Format datetime values for MySQL - using a more explicit approach
    let formattedStartTime = null
    let formattedEndTime = null

    if (filling_start_time) {
      const date = new Date(filling_start_time)
      formattedStartTime =
        date.getFullYear() +
        "-" +
        String(date.getMonth() + 1).padStart(2, "0") +
        "-" +
        String(date.getDate()).padStart(2, "0") +
        " " +
        String(date.getHours()).padStart(2, "0") +
        ":" +
        String(date.getMinutes()).padStart(2, "0") +
        ":" +
        String(date.getSeconds()).padStart(2, "0")

      console.log("Original start time:", filling_start_time)
      console.log("Formatted start time:", formattedStartTime)
    }

    if (filling_end_time) {
      const date = new Date(filling_end_time)
      formattedEndTime =
        date.getFullYear() +
        "-" +
        String(date.getMonth() + 1).padStart(2, "0") +
        "-" +
        String(date.getDate()).padStart(2, "0") +
        " " +
        String(date.getHours()).padStart(2, "0") +
        ":" +
        String(date.getMinutes()).padStart(2, "0") +
        ":" +
        String(date.getSeconds()).padStart(2, "0")
    }

    // Removed updated_at from the query since the column doesn't exist
    const result = await db.query(
      `INSERT INTO cylinders 
      (code, size, gas_type_id, status, filling_start_time, filling_end_time, is_active) 
      VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        code,
        size,
        gas_type_id || null,
        status || "in stock",
        formattedStartTime,
        formattedEndTime,
        is_active !== false,
      ],
    )

    // Access insertId from the first element of the result
    const id = (result as any)[0].insertId

    // Log the initial status in the history table
    try {
      // First check if the table exists
      const [tables] = (await db.query(
        "SELECT COUNT(*) as count FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'cylinder_status_history'",
      )) as QueryResult

      const tableExists = tables[0].count > 0

      if (!tableExists) {
        // Create the table if it doesn't exist
        await db.query(`
          CREATE TABLE cylinder_status_history (
            id INT AUTO_INCREMENT PRIMARY KEY,
            cylinder_id INT NOT NULL,
            previous_status VARCHAR(50),
            new_status VARCHAR(50) NOT NULL,
            changed_at DATETIME NOT NULL,
            INDEX (cylinder_id),
            INDEX (changed_at)
          )
        `)
      }

      // Now insert the initial status record
      await db.query(
        `INSERT INTO cylinder_status_history (cylinder_id, previous_status, new_status, changed_at)
         VALUES (?, NULL, ?, NOW())`,
        [id, status || "in stock"],
      )
    } catch (err) {
      console.error("Error logging initial cylinder status:", err)
      // Continue even if logging fails
    }

    return NextResponse.json({
      message: "Cylinder created successfully",
      data: {
        id,
        code,
        size,
        gas_type_id,
        status: status || "in stock",
        filling_start_time,
        filling_end_time,
        is_active: is_active !== false,
      },
    })
  } catch (error) {
    console.error("Error creating cylinder:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
