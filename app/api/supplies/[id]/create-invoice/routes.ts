import { NextResponse } from "next/server"
import { db } from "../../../../../lib/db"

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const supplyId = params.id
    console.log(`Creating invoice for supply ID: ${supplyId}`)

    // Check if supply exists
    const [supplies] = await db.query("SELECT * FROM supplies WHERE id = ?", [supplyId])
    const suppliesArray = supplies as any[]

    if (suppliesArray.length === 0) {
      console.error(`Supply not found with ID: ${supplyId}`)
      return NextResponse.json({ message: "Supply not found" }, { status: 404 })
    }

    const supply = suppliesArray[0]
    console.log(`Found supply: ${JSON.stringify(supply)}`)

    // Check if invoice already exists for this supply
    const [existingInvoices] = await db.query("SELECT * FROM invoices WHERE delivery_id = ?", [supplyId])
    const existingInvoicesArray = existingInvoices as any[]

    if (existingInvoicesArray.length > 0) {
      console.log(`Invoice already exists with ID: ${existingInvoicesArray[0].id}`)
      // Invoice already exists, return its ID
      return NextResponse.json({
        message: "Invoice already exists for this supply",
        invoiceId: existingInvoicesArray[0].id,
      })
    }

    // Start a transaction
    console.log("Starting transaction")
    await db.query("START TRANSACTION")

    try {
      // Create a new invoice
      const currentDate = new Date().toISOString().split("T")[0]
      console.log(`Creating invoice with amount: ${supply.total_price}, date: ${currentDate}`)

      const [invoiceResult] = await db.query(
        `INSERT INTO invoices (delivery_id, amount, status, date) VALUES (?, ?, ?, ?)`,
        [supplyId, supply.total_price, "unpaid", currentDate],
      )

      const invoiceId = (invoiceResult as any).insertId
      console.log(`Created invoice with ID: ${invoiceId}`)

      // Commit transaction
      await db.query("COMMIT")
      console.log("Transaction committed")

      return NextResponse.json({
        message: "Invoice created successfully",
        invoiceId: invoiceId,
      })
    } catch (error) {
      // Rollback transaction on error
      console.error("Error in transaction, rolling back:", error)
      await db.query("ROLLBACK")
      throw error
    }
  } catch (error) {
    console.error("Error creating invoice:", error)
    return NextResponse.json(
      {
        message: "Internal server error",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
