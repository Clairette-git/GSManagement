import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import bcrypt from "bcryptjs"
import { sign } from "jsonwebtoken"

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()
    console.log("Login attempt for:", email)

    // Find user by email or username
    const [users] = await db.query(
      "SELECT id, username, email, password, role FROM users WHERE username = ? OR email = ?",
      [email, email],
    )

    if (!users || (users as any[]).length === 0) {
      console.log("User not found")
      return NextResponse.json({ success: false, message: "Invalid email or password" }, { status: 401 })
    }

    const user = (users as any[])[0]
    console.log("User found:", user.username)

    // Compare passwords
    const passwordMatch = await bcrypt.compare(password, user.password)
    console.log("Password match:", passwordMatch)

    if (!passwordMatch) {
      return NextResponse.json({ success: false, message: "Invalid email or password" }, { status: 401 })
    }

    // Create JWT token
    const jwtSecret = process.env.JWT_SECRET || "your-secret-key"

    const token = sign(
      {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
      jwtSecret,
      { expiresIn: "1d" },
    )

    console.log("Token generated successfully")

    // Create response with token
    const response = NextResponse.json({
      success: true,
      message: "Login successful",
      token: token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    })

    // Set the cookie in the response
    response.cookies.set({
      name: "auth_token",
      value: token,
      httpOnly: true,
      path: "/",
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24, // 1 day
    })

    console.log("Cookie set successfully")
    return response
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 },
    )
  }
}

