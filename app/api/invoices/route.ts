import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET(request: Request) {
  try {
    const [invoices] = (await db.query(
      `SELECT i.*, s.hospital_name, s.date as supply_date 
       FROM invoices i 
       JOIN supplies s ON i.delivery_id = s.id 
       ORDER BY i.date DESC`,
    )) as [any[], any]

    return NextResponse.json({
      data: invoices,
    })
  } catch (error) {
    console.error("Error fetching invoices:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { delivery_id, amount } = await request.json()

    if (!delivery_id || !amount) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 })
    }

    // Check if invoice already exists for this delivery
    const [existingInvoices] = (await db.query("SELECT * FROM invoices WHERE delivery_id = ?", [delivery_id])) as [
      any[],
      any,
    ]

    if (existingInvoices.length > 0) {
      return NextResponse.json(
        {
          message: "Invoice already exists for this delivery",
          invoiceId: existingInvoices[0].id,
        },
        { status: 409 },
      )
    }

    // Create new invoice
    const [result] = (await db.query(
      "INSERT INTO invoices (delivery_id, date, amount, status) VALUES (?, NOW(), ?, 'unpaid')",
      [delivery_id, amount],
    )) as [any, any]

    return NextResponse.json({
      message: "Invoice created successfully",
      invoiceId: result.insertId,
    })
  } catch (error) {
    console.error("Error creating invoice:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
