import { db } from "../../../../lib/db"
import { redirect } from "next/navigation"

export const dynamic = "force-dynamic"

async function createInvoiceForSupply(supplyId: string) {
  try {
    // Check if supply exists
    const [supplies] = (await db.query("SELECT * FROM supplies WHERE id = ?", [supplyId])) as [any[], any]

    if (supplies.length === 0) {
      throw new Error("Supply not found")
    }

    const supply = supplies[0]

    // Check if invoice already exists for this supply
    const [existingInvoices] = (await db.query("SELECT * FROM invoices WHERE delivery_id = ?", [supplyId])) as [
      any[],
      any,
    ]

    if (existingInvoices.length > 0) {
      // Invoice already exists, return its ID
      return existingInvoices[0].id
    }

    // Start a transaction
    await db.query("START TRANSACTION")

    try {
      // Create a new invoice
      const [invoiceResult] = await db.query(
        `INSERT INTO invoices (delivery_id, amount, status, date) VALUES (?, ?, ?, ?)`,
        [supplyId, supply.total_price, "unpaid", new Date().toISOString().split("T")[0]],
      )

      const invoiceId = (invoiceResult as any).insertId

      // Commit transaction
      await db.query("COMMIT")

      return invoiceId
    } catch (error) {
      // Rollback transaction on error
      await db.query("ROLLBACK")
      throw error
    }
  } catch (error) {
    console.error("Error creating invoice:", error)
    throw error
  }
}

export default async function CreateInvoicePage({ params }: { params: { id: string } }) {
  try {
    const invoiceId = await createInvoiceForSupply(params.id)
    redirect(`/invoices/${invoiceId}`)
  } catch (error) {
    redirect("/supplies")
  }
  return null
}
