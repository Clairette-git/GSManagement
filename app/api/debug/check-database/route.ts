import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    console.log("🔍 Checking database connection and data...")

    // Test basic connection
    const connectionTest = (await db.query("SELECT 1 as test")) as any
    console.log("Connection test:", connectionTest)

    // Check if users table exists
    const tableExists = (await db.query("SHOW TABLES LIKE 'users'")) as any
    console.log("Users table exists:", tableExists)

    // Get table structure
    const tableStructure = (await db.query("DESCRIBE users")) as any
    console.log("Table structure:", tableStructure)

    // Count users
    const userCount = (await db.query("SELECT COUNT(*) as count FROM users")) as any
    console.log("User count:", userCount)

    // Get first few users with all data
    const sampleUsers = (await db.query("SELECT * FROM users LIMIT 5")) as any
    console.log("Sample users:", sampleUsers)

    // Check for specific user data
    const userDetails = (await db.query(`
      SELECT 
        id, 
        username, 
        email, 
        role, 
        created_at,
        LENGTH(username) as username_length,
        LENGTH(email) as email_length,
        LENGTH(role) as role_length
      FROM users 
      LIMIT 5
    `)) as any
    console.log("User details with lengths:", userDetails)

    return NextResponse.json({
      success: true,
      connectionTest: connectionTest,
      tableExists: tableExists,
      tableStructure: tableStructure,
      userCount: userCount[0]?.count || 0,
      sampleUsers: sampleUsers,
      userDetails: userDetails,
      message: "Check console for detailed database information",
    })
  } catch (error) {
    console.error("❌ Database check error:", error)

    return NextResponse.json(
      {
        success: false,
        error: "Database check failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
