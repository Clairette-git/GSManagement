"use server"

import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"

export async function updateInvoiceStatus(invoiceId: number, newStatus: "paid" | "unpaid") {
  console.log(`Server Action: Updating invoice ${invoiceId} status to ${newStatus}`)

  try {
    // Check if invoice exists
    const [invoices] = (await db.query("SELECT * FROM invoices WHERE id = ?", [invoiceId])) as [any[], any]

    if (invoices.length === 0) {
      console.log(`Invoice not found: ${invoiceId}`)
      return { success: false, message: "Invoice not found" }
    }

    // Update invoice status
    console.log(`Executing update query for invoice ${invoiceId}`)
    await db.query("UPDATE invoices SET status = ? WHERE id = ?", [newStatus, invoiceId])

    // Revalidate the invoices pages
    revalidatePath("/invoices")
    revalidatePath(`/invoices/${invoiceId}`)

    console.log(`Successfully updated invoice ${invoiceId} to ${newStatus}`)
    return { success: true, message: `Invoice marked as ${newStatus}` }
  } catch (error) {
    console.error("Error updating invoice:", error)
    return { success: false, message: "An error occurred while updating the invoice status" }
  }
}
