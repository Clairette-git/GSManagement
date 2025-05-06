import { db } from "@/lib/db"

export async function directUpdateInvoiceStatus(invoiceId: number, newStatus: "paid" | "unpaid") {
  try {
    console.log(`[Direct DB] Updating invoice ${invoiceId} to ${newStatus}`)

    // Execute the update directly
    await db.query("UPDATE invoices SET status = ? WHERE id = ?", [newStatus, invoiceId])

    console.log(`[Direct DB] Successfully updated invoice ${invoiceId}`)
    return true
  } catch (error) {
    console.error(`[Direct DB] Error updating invoice ${invoiceId}:`, error)
    return false
  }
}
