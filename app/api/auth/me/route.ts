import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { verify } from "jsonwebtoken"

export async function GET() {
  try {
    const token = cookies().get("auth_token")?.value

    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const decoded = verify(token, process.env.JWT_SECRET || "your-secret-key")

    return NextResponse.json({
      user: decoded,
    })
  } catch (error) {
    console.error("Auth error:", error)
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }
}

