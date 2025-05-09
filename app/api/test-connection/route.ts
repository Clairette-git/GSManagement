import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET() {
  try {
    // Simple query to test connection
    const [result] = await db.query("SELECT 1 as test")

    return NextResponse.json({
      success: true,
      message: "Database connection successful",
      result,
    })
  } catch (error) {
    console.error("Database connection test failed:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Database connection failed",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
