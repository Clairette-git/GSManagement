import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get("email")

    if (!email) {
      return NextResponse.json({ error: "Email required" }, { status: 400 })
    }

    // Check what's actually in the database
    const [users] = await db.query(
      "SELECT id, username, email, role, created_at FROM users WHERE email = ? OR username = ?",
      [email, email],
    )

    return NextResponse.json({
      found: (users as any[]).length > 0,
      user: (users as any[])[0] || null,
      query: "SELECT id, username, email, role, created_at FROM users WHERE email = ? OR username = ?",
      params: [email, email],
    })
  } catch (error) {
    console.error("Debug user check error:", error)
    return NextResponse.json(
      { error: "Database error", details: error instanceof Error ? error.message : String(error) },
      { status: 500 },
    )
  }
}
