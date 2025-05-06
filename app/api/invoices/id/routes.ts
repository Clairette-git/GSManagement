import { NextResponse } from "next/server"
import { db } from "@/lib/db"

// Add detailed logging for debugging
console.log("API route module loaded: app/api/invoices/[id]/route.ts")

export async function GET(request: Request, { params }: { params: { id: string } }) {
  console.log(`GET request received for invoice ID: ${params.id}`)

  try {
    const [invoices] = (await db.query(
      `SELECT i.*, s.hospital_name, s.date as supply_date 
       FROM invoices i 
       JOIN supplies s ON i.delivery_id = s.id 
       WHERE i.id = ?`,
      [params.id],
    )) as [any[], any]

    if ((invoices as any[]).length === 0) {
      return NextResponse.json({ message: "Invoice not found" }, { status: 404 })
    }

    // Get supply details
    const [details] = (await db.query(
      `SELECT sd.*, g.name as gas_name 
       FROM supply_details sd 
       JOIN gas_types g ON sd.gas_type_id = g.id 
       WHERE sd.supply_id = ?`,
      [invoices[0].delivery_id],
    )) as [any[], any]

    return NextResponse.json({
      data: {
        invoice: invoices[0],
        details: details,
      },
    })
  } catch (error) {
    console.error("Error fetching invoice:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  console.log(`PATCH request received for invoice ID: ${params.id}`)

  try {
    // Parse the request body
    const body = await request.json()
    console.log("Request body:", body)

    const { status } = body

    if (!status || !["paid", "unpaid"].includes(status)) {
      console.log(`Invalid status: ${status}`)
      return NextResponse.json({ message: "Invalid status" }, { status: 400 })
    }

    // Check if invoice exists
    const [invoices] = (await db.query("SELECT * FROM invoices WHERE id = ?", [params.id])) as [any[], any]

    if (invoices.length === 0) {
      console.log(`Invoice not found: ${params.id}`)
      return NextResponse.json({ message: "Invoice not found" }, { status: 404 })
    }

    // Update invoice status
    console.log(`Updating invoice ${params.id} status to ${status}`)
    await db.query("UPDATE invoices SET status = ? WHERE id = ?", [status, params.id])

    return NextResponse.json({
      message: "Invoice status updated successfully",
    })
  } catch (error) {
    console.error("Error updating invoice:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
