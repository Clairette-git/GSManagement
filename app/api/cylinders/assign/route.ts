import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function POST(request: Request) {
  try {
    const { vehicle_plate, driver_name, cylinder_ids } = await request.json()

    // Validate input
    if (!vehicle_plate || !driver_name || !cylinder_ids || !Array.isArray(cylinder_ids) || cylinder_ids.length === 0) {
      return NextResponse.json(
        { message: "Vehicle plate, driver name, and at least one cylinder are required" },
        { status: 400 },
      )
    }

    // Start a transaction
    await db.query("START TRANSACTION")

    try {
      // Check if vehicle_assignments table exists, create if not
      const [tables] = await db.query(
        "SELECT COUNT(*) as count FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'vehicle_assignments'",
      )

      const tableExists = (tables as any[])[0].count > 0

      if (!tableExists) {
        // Create the table if it doesn't exist
        await db.query(`
          CREATE TABLE vehicle_assignments (
            id INT AUTO_INCREMENT PRIMARY KEY,
            vehicle_plate VARCHAR(50) NOT NULL,
            driver_name VARCHAR(100) NOT NULL,
            assignment_date DATETIME NOT NULL,
            is_active BOOLEAN DEFAULT TRUE,
            INDEX (vehicle_plate),
            INDEX (assignment_date)
          )
        `)
      }

      // Check if cylinder_assignments table exists, create if not
      const [cylinderAssignmentTables] = await db.query(
        "SELECT COUNT(*) as count FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'cylinder_assignments'",
      )

      const cylinderAssignmentTableExists = (cylinderAssignmentTables as any[])[0].count > 0

      if (!cylinderAssignmentTableExists) {
        // Create the table if it doesn't exist
        await db.query(`
          CREATE TABLE cylinder_assignments (
            id INT AUTO_INCREMENT PRIMARY KEY,
            vehicle_assignment_id INT NOT NULL,
            cylinder_id INT NOT NULL,
            is_delivered BOOLEAN DEFAULT FALSE,
            is_returned BOOLEAN DEFAULT FALSE,
            INDEX (vehicle_assignment_id),
            INDEX (cylinder_id)
          )
        `)
      }

      // Create a new vehicle assignment
      const [vehicleResult] = await db.query(
        `INSERT INTO vehicle_assignments (vehicle_plate, driver_name, assignment_date) 
         VALUES (?, ?, NOW())`,
        [vehicle_plate, driver_name],
      )

      const vehicleAssignmentId = (vehicleResult as any).insertId

      // Assign cylinders to the vehicle
      for (const cylinderId of cylinder_ids) {
        // Verify cylinder exists and is in filled status
        const [cylinderCheck] = await db.query(
          "SELECT * FROM cylinders WHERE id = ? AND status = 'filled' AND is_active = TRUE",
          [cylinderId],
        )

        if ((cylinderCheck as any[])[0] === undefined) {
          throw new Error(`Cylinder with ID ${cylinderId} is not available or not in filled status`)
        }

        // Create cylinder assignment
        await db.query(
          `INSERT INTO cylinder_assignments (vehicle_assignment_id, cylinder_id) 
           VALUES (?, ?)`,
          [vehicleAssignmentId, cylinderId],
        )

        // Update cylinder status to "to be delivered"
        try {
          await db.query("UPDATE cylinders SET status = 'to be delivered' WHERE id = ?", [cylinderId])
        } catch (error) {
          console.error("Error updating cylinder status:", error)

          // If the status update fails, it might be because the enum doesn't include "to be delivered"
          // Let's try to alter the table to add the new status
          try {
            // Check the current enum values
            const [enumResult] = await db.query(`
              SELECT COLUMN_TYPE 
              FROM INFORMATION_SCHEMA.COLUMNS 
              WHERE TABLE_SCHEMA = DATABASE() 
              AND TABLE_NAME = 'cylinders' 
              AND COLUMN_NAME = 'status'
            `)

            const columnType = (enumResult as any[])[0]?.COLUMN_TYPE

            if (columnType && columnType.includes("enum(")) {
              // Extract current enum values
              const enumValues = columnType.replace(/^enum$$'|'$$$/g, "").split("','")

              // Add new value if it doesn't exist
              if (!enumValues.includes("to be delivered")) {
                enumValues.push("to be delivered")

                // Create new enum definition
                const newEnumDef = `enum('${enumValues.join("','")}')`

                // Alter the table
                await db.query(`
                  ALTER TABLE cylinders 
                  MODIFY COLUMN status ${newEnumDef} NOT NULL
                `)

                // Try the update again
                await db.query("UPDATE cylinders SET status = 'to be delivered' WHERE id = ?", [cylinderId])
              }
            }
          } catch (alterError) {
            console.error("Error altering table:", alterError)
            throw new Error("Failed to update cylinder status. Database schema needs to be updated manually.")
          }
        }

        // Log the status change in history table if it exists
        try {
          const [historyTableCheck] = await db.query(
            "SELECT COUNT(*) as count FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'cylinder_status_history'",
          )

          const historyTableExists = (historyTableCheck as any[])[0].count > 0

          if (historyTableExists) {
            // Get current status before we changed it
            const previousStatus = "filled" // We know it was filled because we checked above

            // Log status change
            await db.query(
              `INSERT INTO cylinder_status_history (cylinder_id, previous_status, new_status, changed_at)
               VALUES (?, ?, 'to be delivered', NOW())`,
              [cylinderId, previousStatus],
            )
          }
        } catch (err) {
          console.error("Error logging cylinder status change:", err)
          // Continue even if logging fails
        }
      }

      // Commit transaction
      await db.query("COMMIT")

      return NextResponse.json({
        message: "Cylinders successfully assigned to vehicle",
        data: {
          vehicle_assignment_id: vehicleAssignmentId,
          vehicle_plate,
          driver_name,
          cylinder_count: cylinder_ids.length,
        },
      })
    } catch (error) {
      // Rollback transaction on error
      await db.query("ROLLBACK")
      throw error
    }
  } catch (error) {
    console.error("Error assigning cylinders:", error)

    // Ensure we always return a properly formatted JSON response
    return NextResponse.json(
      {
        message: error instanceof Error ? error.message : "Internal server error",
        success: false,
      },
      { status: 500 },
    )
  }
}
