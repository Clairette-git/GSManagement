import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function POST(request: Request) {
  try {
    const data = await request.json()
    const { invoiceId, status } = data

    console.log(`[Direct API] Updating invoice ${invoiceId} to ${status}`)

    if (!invoiceId || !status || !["paid", "unpaid"].includes(status)) {
      return NextResponse.json({ success: false, message: "Invalid data" }, { status: 400 })
    }

    // Execute the update directly
    await db.query("UPDATE invoices SET status = ? WHERE id = ?", [status, invoiceId])

    return NextResponse.json({ success: true, message: `Invoice marked as ${status}` })
  } catch (error) {
    console.error("[Direct API] Error:", error)
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 })
  }
}
