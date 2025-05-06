import type { NextApiRequest, NextApiResponse } from "next"
import { db } from "@/lib/db"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log(`API request received: ${req.method} /api/invoices/${req.query.id}`)

  const { id } = req.query

  if (req.method === "PATCH") {
    try {
      const { status } = req.body

      console.log(`Updating invoice ${id} status to ${status}`)

      if (!status || !["paid", "unpaid"].includes(status)) {
        return res.status(400).json({ message: "Invalid status" })
      }

      // Check if invoice exists
      const [invoices] = (await db.query("SELECT * FROM invoices WHERE id = ?", [id])) as [any[], any]

      if (invoices.length === 0) {
        return res.status(404).json({ message: "Invoice not found" })
      }

      // Update invoice status
      await db.query("UPDATE invoices SET status = ? WHERE id = ?", [status, id])

      return res.status(200).json({ message: "Invoice status updated successfully" })
    } catch (error) {
      console.error("Error updating invoice:", error)
      return res.status(500).json({ message: "Internal server error" })
    }
  } else if (req.method === "GET") {
    try {
      const [invoices] = (await db.query(
        `SELECT i.*, s.hospital_name, s.date as supply_date 
         FROM invoices i 
         JOIN supplies s ON i.delivery_id = s.id 
         WHERE i.id = ?`,
        [id],
      )) as [any[], any]

      if (invoices.length === 0) {
        return res.status(404).json({ message: "Invoice not found" })
      }

      // Get supply details
      const [details] = (await db.query(
        `SELECT sd.*, g.name as gas_name 
         FROM supply_details sd 
         JOIN gas_types g ON sd.gas_type_id = g.id 
         WHERE sd.supply_id = ?`,
        [invoices[0].delivery_id],
      )) as [any[], any]

      return res.status(200).json({
        data: {
          invoice: invoices[0],
          details: details,
        },
      })
    } catch (error) {
      console.error("Error fetching invoice:", error)
      return res.status(500).json({ message: "Internal server error" })
    }
  } else {
    return res.status(405).json({ message: "Method not allowed" })
  }
}
