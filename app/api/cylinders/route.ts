import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET() {
  try {
    const [cylinders] = await db.query("SELECT * FROM cylinders ORDER BY code")

    return NextResponse.json({
      data: cylinders,
    })
  } catch (error) {
    console.error("Error fetching cylinders:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { code, size, gas_type_id, status } = await request.json()

    if (!code || !size) {
      return NextResponse.json({ message: "Code and size are required" }, { status: 400 })
    }

    // Check if code already exists
    const [existingCylinders] = await db.query("SELECT * FROM cylinders WHERE code = ?", [code])

    if ((existingCylinders as any[]).length > 0) {
      return NextResponse.json({ message: "Cylinder code already exists" }, { status: 400 })
    }

    const [result] = await db.query("INSERT INTO cylinders (code, size, gas_type_id, status) VALUES (?, ?, ?, ?)", [
      code,
      size,
      gas_type_id || null,
      status || "in stock",
    ])

    const id = (result as any).insertId

    return NextResponse.json({
      message: "Cylinder created successfully",
      data: { id, code, size, gas_type_id, status: status || "in stock" },
    })
  } catch (error) {
    console.error("Error creating cylinder:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

