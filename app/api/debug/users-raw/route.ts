import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    console.log("🔍 Debug: Fetching raw users data...")

    // First, let's see the table structure
    const tableInfo = await db.query("DESCRIBE users")
    console.log("Table structure:", tableInfo)

    // Then get all users with all columns
    const result = await db.query("SELECT * FROM users")
    const users = Array.isArray(result) ? result : []

    console.log("Raw users data:", users)
    console.log("Number of users found:", users.length)

    // Check each user individually
    users.forEach((user: any, index: number) => {
      console.log(`Raw User ${index + 1}:`, JSON.stringify(user, null, 2))
    })

    // Count total users - fix TypeScript error
    const countResult = (await db.query("SELECT COUNT(*) as total FROM users")) as any
    const countArray = Array.isArray(countResult) ? countResult : []
    const totalCount = (countArray[0] as any)?.total || 0
    console.log("Total users count:", totalCount)

    return NextResponse.json({
      success: true,
      tableStructure: Array.isArray(tableInfo) ? tableInfo : [],
      rawUsers: users,
      totalCount: totalCount,
      userCount: users.length,
      message: "Check console for detailed logs",
    })
  } catch (error) {
    console.error("❌ Debug error:", error)

    return NextResponse.json(
      {
        success: false,
        error: "Debug failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
