"use server"

import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"

export async function updateInvoice(invoiceId: number, newStatus: "paid" | "unpaid") {
  console.log(`[Server Action] Starting update for invoice ${invoiceId} to ${newStatus}`)

  try {
    // Execute the update directly
    const result = await db.query("UPDATE invoices SET status = ? WHERE id = ?", [newStatus, invoiceId])

    console.log(`[Server Action] Update result:`, result)

    // Revalidate paths to refresh the UI
    revalidatePath(`/invoices/${invoiceId}`)
    revalidatePath("/invoices")

    console.log(`[Server Action] Successfully updated invoice ${invoiceId} to ${newStatus}`)
    return { success: true }
  } catch (error) {
    console.error(`[Server Action] Error updating invoice ${invoiceId}:`, error)
    return { success: false, error: String(error) }
  }
}
