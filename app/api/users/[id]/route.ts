import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = Number.parseInt(params.id)
    const { username, email, role } = await request.json()

    console.log(`🔄 Updating user ${userId}:`, { username, email, role })

    // Validate role
    const validRoles = ["admin", "storekeeper", "technician", "filler"]
    if (!validRoles.includes(role)) {
      return NextResponse.json({ success: false, error: "Invalid role" }, { status: 400 })
    }

    // Update user in database
    await db.query("UPDATE users SET username = ?, email = ?, role = ? WHERE id = ?", [username, email, role, userId])

    console.log(`✅ User ${userId} updated successfully`)

    return NextResponse.json({
      success: true,
      message: "User updated successfully",
    })
  } catch (error) {
    console.error("❌ Error updating user:", error)

    return NextResponse.json(
      {
        success: false,
        error: "Failed to update user",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = Number.parseInt(params.id)

    console.log(`🗑️ Deleting user ${userId}`)

    // Delete user from database
    await db.query("DELETE FROM users WHERE id = ?", [userId])

    console.log(`✅ User ${userId} deleted successfully`)

    return NextResponse.json({
      success: true,
      message: "User deleted successfully",
    })
  } catch (error) {
    console.error("❌ Error deleting user:", error)

    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete user",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
