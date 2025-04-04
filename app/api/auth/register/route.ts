import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import bcrypt from "bcrypt"
import { RowDataPacket } from 'mysql2/promise';

export async function POST(request: Request) {
  try {
    const { username, email, password, role } = await request.json()

    // Validate input
    if (!username || !email || !password || !role) {
      return NextResponse.json({ message: "All fields are required" }, { status: 400 })
    }

    // Check if username or email already exists
    const [result] = await db.query(
      'SELECT * FROM users WHERE username = ? OR email = ?',
      [username, email]
    );
    const existingUsers = result as RowDataPacket[];
    if (existingUsers.length > 0) {
      return NextResponse.json({ message: "Username or email already exists" }, { status: 409 })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Insert new user
    await db.query("INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)", [
      username,
      email,
      hashedPassword,
      role,
    ])

    return NextResponse.json({ message: "User registered successfully" })
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

