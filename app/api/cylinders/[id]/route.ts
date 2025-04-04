import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const [cylinders] = await db.query("SELECT * FROM cylinders WHERE id = ?", [id])

    if ((cylinders as any[]).length === 0) {
      return NextResponse.json({ message: "Cylinder not found" }, { status: 404 })
    }

    return NextResponse.json({
      data: (cylinders as any[])[0],
    })
  } catch (error) {
    console.error("Error fetching cylinder:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const { code, size, gas_type_id, status } = await request.json()

    if (!code || !size) {
      return NextResponse.json({ message: "Code and size are required" }, { status: 400 })
    }

    // Check if code already exists for other cylinders
    const [existingCylinders] = await db.query("SELECT * FROM cylinders WHERE code = ? AND id != ?", [code, id])

    if ((existingCylinders as any[]).length > 0) {
      return NextResponse.json({ message: "Cylinder code already exists" }, { status: 400 })
    }

    const [result] = await db.query(
      "UPDATE cylinders SET code = ?, size = ?, gas_type_id = ?, status = ? WHERE id = ?",
      [code, size, gas_type_id || null, status || "in stock", id],
    )

    if ((result as any).affectedRows === 0) {
      return NextResponse.json({ message: "Cylinder not found" }, { status: 404 })
    }

    return NextResponse.json({
      message: "Cylinder updated successfully",
      data: { id: Number(id), code, size, gas_type_id, status },
    })
  } catch (error) {
    console.error("Error updating cylinder:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id

    // Check if cylinder is in use in supply_details
    const [supplyDetails] = await db.query(
      "SELECT COUNT(*) as count FROM supply_details WHERE cylinder_code IN (SELECT code FROM cylinders WHERE id = ?)",
      [id],
    )

    if ((supplyDetails as any[])[0].count > 0) {
      return NextResponse.json({ message: "Cannot delete cylinder that is used in supplies" }, { status: 400 })
    }

    const [result] = await db.query("DELETE FROM cylinders WHERE id = ?", [id])

    if ((result as any).affectedRows === 0) {
      return NextResponse.json({ message: "Cylinder not found" }, { status: 404 })
    }

    return NextResponse.json({
      message: "Cylinder deleted successfully",
    })
  } catch (error) {
    console.error("Error deleting cylinder:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

