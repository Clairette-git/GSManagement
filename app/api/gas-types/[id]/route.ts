import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const [gasTypes] = await db.query("SELECT * FROM gas_types WHERE id = ?", [id])

    if ((gasTypes as any[]).length === 0) {
      return NextResponse.json({ message: "Gas type not found" }, { status: 404 })
    }

    return NextResponse.json({
      data: (gasTypes as any[])[0],
    })
  } catch (error) {
    console.error("Error fetching gas type:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const { name, price_per_liter } = await request.json()

    if (!name || price_per_liter === undefined) {
      return NextResponse.json({ message: "Name and price are required" }, { status: 400 })
    }

    const [result] = await db.query("UPDATE gas_types SET name = ?, price_per_liter = ? WHERE id = ?", [
      name,
      price_per_liter,
      id,
    ])

    if ((result as any).affectedRows === 0) {
      return NextResponse.json({ message: "Gas type not found" }, { status: 404 })
    }

    return NextResponse.json({
      message: "Gas type updated successfully",
      data: { id: Number(id), name, price_per_liter },
    })
  } catch (error) {
    console.error("Error updating gas type:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id

    // Check if gas type is in use
    const [cylinders] = await db.query("SELECT COUNT(*) as count FROM cylinders WHERE gas_type_id = ?", [id])

    if ((cylinders as any[])[0].count > 0) {
      return NextResponse.json({ message: "Cannot delete gas type that is in use by cylinders" }, { status: 400 })
    }

    const [result] = await db.query("DELETE FROM gas_types WHERE id = ?", [id])

    if ((result as any).affectedRows === 0) {
      return NextResponse.json({ message: "Gas type not found" }, { status: 404 })
    }

    return NextResponse.json({
      message: "Gas type deleted successfully",
    })
  } catch (error) {
    console.error("Error deleting gas type:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

