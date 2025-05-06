import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function POST(request: Request) {
  console.log("POST request received for update-invoice-status")

  try {
    const body = await request.json()
    console.log("Request body:", body)

    const { invoiceId, status } = body

    if (!invoiceId || !status || !["paid", "unpaid"].includes(status)) {
      console.log(`Invalid request: invoiceId=${invoiceId}, status=${status}`)
      return NextResponse.json({ message: "Invalid request" }, { status: 400 })
    }

    // Check if invoice exists
    const [invoices] = (await db.query("SELECT * FROM invoices WHERE id = ?", [invoiceId])) as [any[], any]

    if (invoices.length === 0) {
      console.log(`Invoice not found: ${invoiceId}`)
      return NextResponse.json({ message: "Invoice not found" }, { status: 404 })
    }

    // Update invoice status
    console.log(`Updating invoice ${invoiceId} status to ${status}`)
    await db.query("UPDATE invoices SET status = ? WHERE id = ?", [status, invoiceId])

    return NextResponse.json({
      message: "Invoice status updated successfully",
    })
  } catch (error) {
    console.error("Error updating invoice:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
