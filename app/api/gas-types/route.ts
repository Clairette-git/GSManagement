import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET() {
  try {
    const [gasTypes] = await db.query("SELECT * FROM gas_types ORDER BY name")

    return NextResponse.json({
      data: gasTypes,
    })
  } catch (error) {
    console.error("Error fetching gas types:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { name, price_per_liter } = await request.json()

    if (!name || price_per_liter === undefined) {
      return NextResponse.json({ message: "Name and price are required" }, { status: 400 })
    }

    const [result] = await db.query("INSERT INTO gas_types (name, price_per_liter) VALUES (?, ?)", [
      name,
      price_per_liter,
    ])

    const id = (result as any).insertId

    return NextResponse.json({
      message: "Gas type created successfully",
      data: { id, name, price_per_liter },
    })
  } catch (error) {
    console.error("Error creating gas type:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

