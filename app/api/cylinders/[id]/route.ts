import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const [cylinders] = await db.query("SELECT * FROM cylinders WHERE id = ?", [id])

    if ((cylinders as any[]).length === 0) {
      return NextResponse.json({ message: "Cylinder not found" }, { status: 404 })
    }

    return NextResponse.json({
      data: (cylinders as any[])[0],
    })
  } catch (error) {
    console.error("Error fetching cylinder:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const { code, size, gas_type_id, status, filling_start_time, filling_end_time, is_active } = await request.json()

    // Debug log
    console.log("Cylinder update received:", {
      id,
      code,
      size,
      gas_type_id,
      status,
      filling_start_time,
      filling_end_time,
      is_active,
    })

    if (!code || !size) {
      return NextResponse.json({ message: "Code and size are required" }, { status: 400 })
    }

    // Check if code already exists for other cylinders
    const [existingCylinders] = await db.query("SELECT * FROM cylinders WHERE code = ? AND id != ?", [code, id])

    if ((existingCylinders as any[]).length > 0) {
      return NextResponse.json({ message: "Cylinder code already exists" }, { status: 400 })
    }

    // Get current cylinder to check if status is changing
    const [currentCylinder] = await db.query("SELECT status FROM cylinders WHERE id = ?", [id])
    const currentStatus = (currentCylinder as any[])[0]?.status

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

    // Add this before the UPDATE query
    let updatedFillingEndTime = formattedEndTime
    if (status === "filled" && !filling_end_time) {
      const now = new Date()
      updatedFillingEndTime =
        now.getFullYear() +
        "-" +
        String(now.getMonth() + 1).padStart(2, "0") +
        "-" +
        String(now.getDate()).padStart(2, "0") +
        " " +
        String(now.getHours()).padStart(2, "0") +
        ":" +
        String(now.getMinutes()).padStart(2, "0") +
        ":" +
        String(now.getSeconds()).padStart(2, "0")
    }

    // Removed updated_at from the query since the column doesn't exist
    const [result] = await db.query(
      `UPDATE cylinders SET 
      code = ?, 
      size = ?, 
      gas_type_id = ?, 
      status = ?, 
      filling_start_time = ?, 
      filling_end_time = ?,
      is_active = ?
      WHERE id = ?`,
      [
        code,
        size,
        gas_type_id || null,
        status || "in stock",
        formattedStartTime,
        updatedFillingEndTime,
        is_active !== false,
        id,
      ],
    )

    if ((result as any).affectedRows === 0) {
      return NextResponse.json({ message: "Cylinder not found" }, { status: 404 })
    }

    // If status changed, log it in the cylinder_status_history table
    if (status && status !== currentStatus) {
      try {
        // First check if the table exists
        const [tables] = await db.query(
          "SELECT COUNT(*) as count FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'cylinder_status_history'",
        )

        const tableExists = (tables as any[])[0].count > 0

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

        // Now insert the status change record
        await db.query(
          `INSERT INTO cylinder_status_history (cylinder_id, previous_status, new_status, changed_at)
           VALUES (?, ?, ?, NOW())`,
          [id, currentStatus, status],
        )
      } catch (err) {
        console.error("Error logging cylinder status change:", err)
        // Continue even if logging fails
      }
    }

    return NextResponse.json({
      message: "Cylinder updated successfully",
      data: {
        id: Number(id),
        code,
        size,
        gas_type_id,
        status,
        filling_start_time,
        filling_end_time,
        is_active: is_active !== false,
      },
    })
  } catch (error) {
    console.error("Error updating cylinder:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id

    // Check if cylinder is in use in supply_details
    const [supplyDetails] = await db.query(
      "SELECT COUNT(*) as count FROM supply_details WHERE cylinder_code IN (SELECT code FROM cylinders WHERE id = ?)",
      [id],
    )

    if ((supplyDetails as any[])[0].count > 0) {
      return NextResponse.json({ message: "Cannot delete cylinder that is used in supplies" }, { status: 400 })
    }

    const [result] = await db.query("DELETE FROM cylinders WHERE id = ?", [id])

    if ((result as any).affectedRows === 0) {
      return NextResponse.json({ message: "Cylinder not found" }, { status: 404 })
    }

    return NextResponse.json({
      message: "Cylinder deleted successfully",
    })
  } catch (error) {
    console.error("Error deleting cylinder:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
