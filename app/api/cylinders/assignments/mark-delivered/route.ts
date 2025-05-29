import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function POST(request: Request) {
  try {
    const { assignment_id, cylinder_id } = await request.json()

    if (!assignment_id || !cylinder_id) {
      return NextResponse.json({ message: "Assignment ID and cylinder ID are required" }, { status: 400 })
    }

    // Start a transaction
    await db.query("START TRANSACTION")

    try {
      // Update the cylinder assignment
      await db.query(
        "UPDATE cylinder_assignments SET is_delivered = TRUE WHERE vehicle_assignment_id = ? AND cylinder_id = ?",
        [assignment_id, cylinder_id],
      )

      // Update the cylinder status to "delivered"
      await db.query("UPDATE cylinders SET status = 'delivered' WHERE id = ?", [cylinder_id])

      // Log the status change in history table if it exists
      try {
        const [historyTableCheck] = await db.query(
          "SELECT COUNT(*) as count FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'cylinder_status_history'",
        )

        const historyTableExists = (historyTableCheck as any[])[0].count > 0

        if (historyTableExists) {
          // Get current status before we changed it
          const [currentStatus] = await db.query("SELECT status FROM cylinders WHERE id = ?", [cylinder_id])
          const previousStatus = (currentStatus as any[])[0]?.status || "unknown"

          // Log status change
          await db.query(
            `INSERT INTO cylinder_status_history (cylinder_id, previous_status, new_status, changed_at)
             VALUES (?, ?, 'delivered', NOW())`,
            [cylinder_id, previousStatus],
          )
        }
      } catch (err) {
        console.error("Error logging cylinder status change:", err)
        // Continue even if logging fails
      }

      // Commit transaction
      await db.query("COMMIT")

      return NextResponse.json({
        message: "Cylinder marked as delivered successfully",
      })
    } catch (error) {
      // Rollback transaction on error
      await db.query("ROLLBACK")
      throw error
    }
  } catch (error) {
    console.error("Error marking cylinder as delivered:", error)
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 },
    )
  }
}
