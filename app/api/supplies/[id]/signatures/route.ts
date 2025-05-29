import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id

    if (!id) {
      return NextResponse.json({ message: "Supply ID is required" }, { status: 400 })
    }

    const [supplies] = await db.query(
      `SELECT 
        recipient_name, 
        recipient_signature, 
        driver_name as deliverer_name, 
        deliverer_signature 
      FROM supplies 
      WHERE id = ?`,
      [id],
    )

    if (!(supplies as any[]).length) {
      return NextResponse.json({ message: "Supply not found" }, { status: 404 })
    }

    return NextResponse.json((supplies as any[])[0])
  } catch (error) {
    console.error("Error fetching supply signatures:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
