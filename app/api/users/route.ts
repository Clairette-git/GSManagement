import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    console.log("🔍 Fetching users from database...")

    // Get users with proper MySQL2 handling
    const result = await db.query(
      "SELECT id, username, email, role, created_at FROM users ORDER BY created_at ASC, id ASC",
    )

    // MySQL2 returns [rows, fields] - we need the first element
    const users = Array.isArray(result) && Array.isArray(result[0]) ? result[0] : result

    console.log(`✅ Raw query returned:`, users)
    console.log(`✅ Users array length: ${users.length}`)

    // Check if users array is empty
    if (!users || users.length === 0) {
      console.log("❌ No users found in database")
      return NextResponse.json({
        success: true,
        users: [],
        count: 0,
        message: "No users found in database",
      })
    }

    // Log each user to see what data we're getting
    users.forEach((user: any, index: number) => {
      console.log(`User ${index + 1} raw data:`, {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        created_at: user.created_at,
      })
    })

    // Map users with proper data handling
    const cleanUsers = users.map((user: any) => ({
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      created_at: user.created_at,
    }))

    console.log("✅ Clean users:", cleanUsers)

    return NextResponse.json({
      success: true,
      users: cleanUsers,
      count: cleanUsers.length,
    })
  } catch (error) {
    console.error("❌ Error fetching users:", error)

    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch users",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
