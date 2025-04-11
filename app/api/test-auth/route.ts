import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { verify } from "jsonwebtoken"

export async function GET(request: Request) {
  try {
    // Try to get token from cookies first
    const token = (await cookies()).get("auth_token")?.value

    // If no cookie, try to get from Authorization header
    const authHeader = request.headers.get("Authorization")
    const headerToken = authHeader?.startsWith("Bearer ") ? authHeader.substring(7) : null

    // Use either token
    const finalToken = token || headerToken

    console.log("Test Auth API - Token:", finalToken ? "Found" : "Not found")

    if (!finalToken) {
      return NextResponse.json({ authenticated: false, message: "No token found" })
    }

    try {
      const jwtSecret = process.env.JWT_SECRET || "your-secret-key"
      const decoded = verify(finalToken, jwtSecret)
      return NextResponse.json({
        authenticated: true,
        user: decoded,
        message: "Authentication successful",
      })
    } catch (error) {
      console.error("Token verification failed:", error)
      return NextResponse.json({
        authenticated: false,
        message: "Invalid token",
      })
    }
  } catch (error) {
    console.error("Test auth error:", error)
    return NextResponse.json({
      authenticated: false,
      message: "Error checking authentication",
    })
  }
}

