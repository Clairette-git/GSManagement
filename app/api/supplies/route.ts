import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = searchParams.get("limit")

    let query = "SELECT * FROM supplies ORDER BY date DESC"
    const params: any[] = []

    if (limit) {
      query += " LIMIT ?"
      params.push(Number.parseInt(limit))
    }

    const [supplies] = await db.query(query, params)

    return NextResponse.json({
      data: supplies,
    })
  } catch (error) {
    console.error("Error fetching supplies:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const {
      date,
      hospital_name,
      vehicle_plate,
      driver_name,
      storekeeper_name,
      technician_name,
      recipient_name,
      recipient_signature,
      deliverer_signature,
      total_price,
      kilometers,
      supply_details,
      create_invoice,
      invoice_status,
      invoice_date,
    } = await request.json()

    // Validate required fields
    if (
      !date ||
      !hospital_name ||
      !vehicle_plate ||
      !driver_name ||
      !storekeeper_name ||
      !technician_name ||
      !recipient_name ||
      !total_price ||
      !supply_details ||
      !Array.isArray(supply_details) ||
      supply_details.length === 0
    ) {
      return NextResponse.json({ message: "All fields are required" }, { status: 400 })
    }

    // Start a transaction
    await db.query("START TRANSACTION")

    try {
      // Insert supply with kilometers field
      const [supplyResult] = await db.query(
        `INSERT INTO supplies 
        (date, hospital_name, vehicle_plate, driver_name, storekeeper_name, 
        technician_name, recipient_name, recipient_signature, deliverer_signature, total_price, kilometers) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          date,
          hospital_name,
          vehicle_plate,
          driver_name,
          storekeeper_name,
          technician_name,
          recipient_name,
          recipient_signature || null,
          deliverer_signature || null,
          total_price,
          kilometers || 0,
        ],
      )

      const supplyId = (supplyResult as any).insertId

      // Insert supply details
      for (const detail of supply_details) {
        // Validate detail
        if (!detail.cylinder_code || !detail.gas_type_id || !detail.liters || !detail.price) {
          await db.query("ROLLBACK")
          return NextResponse.json({ message: "Invalid supply detail" }, { status: 400 })
        }

        // Check if cylinder exists
        const [cylinders] = (await db.query("SELECT * FROM cylinders WHERE code = ?", [detail.cylinder_code])) as [
          any[],
          any,
        ]

        if (cylinders.length === 0) {
          await db.query("ROLLBACK")
          return NextResponse.json({ message: `Cylinder with code ${detail.cylinder_code} not found` }, { status: 400 })
        }

        // Insert detail
        await db.query(
          `INSERT INTO supply_details 
          (supply_id, cylinder_code, gas_type_id, liters, price) 
          VALUES (?, ?, ?, ?, ?)`,
          [supplyId, detail.cylinder_code, detail.gas_type_id, detail.liters, detail.price],
        )

        // Update cylinder status to delivered
        await db.query("UPDATE cylinders SET status = 'delivered', gas_type_id = ? WHERE code = ?", [
          detail.gas_type_id,
          detail.cylinder_code,
        ])
      }

      // Create invoice if requested
      let invoiceId = null
      if (create_invoice) {
        const [invoiceResult] = await db.query(
          `INSERT INTO invoices (delivery_id, amount, status, date) VALUES (?, ?, ?, ?)`,
          [supplyId, total_price, invoice_status || "unpaid", invoice_date || date],
        )

        invoiceId = (invoiceResult as any).insertId
      }

      // Commit transaction
      await db.query("COMMIT")

      return NextResponse.json({
        message: "Supply created successfully",
        data: {
          id: supplyId,
          invoiceId: invoiceId,
        },
      })
    } catch (error) {
      // Rollback transaction on error
      await db.query("ROLLBACK")
      throw error
    }
  } catch (error) {
    console.error("Error creating supply:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
