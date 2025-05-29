import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

interface CylinderData {
  id?: number
  code: string
  size?: string | number
  gas_name?: string | null
  gas_type_id?: number
  liters?: number
  price: number
  quantity?: number
}

interface SupplyData {
  id: number
  date: string
  hospital_name: string
  vehicle_plate: string
  driver_name: string
  total_price: number
  recipient_name?: string
  recipient_phone?: string
  delivery_address?: string
  notes?: string
  status?: string
  created_at?: string
  updated_at?: string
  cylinder_count?: number
  delivery_time?: string
  contact_person?: string
  department?: string
  [key: string]: any
}

interface SupplyWithCylinders extends SupplyData {
  cylinders: CylinderData[]
  cylinder_count: number
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id: supplyId } = params

    if (!/^\d+$/.test(supplyId)) {
      return NextResponse.json({ message: "Invalid supply ID", status: "error" }, { status: 400 })
    }

    console.log(`Fetching supply details for ID: ${supplyId}`)

    // Get ALL columns from the supply
    const supplyResult = await db.query("SELECT * FROM supplies WHERE id = ?", [supplyId])
    const supplyRows = Array.isArray(supplyResult[0]) ? supplyResult[0] : []

    if (supplyRows.length === 0) {
      return NextResponse.json({ message: "Supply not found", status: "error" }, { status: 404 })
    }

    const supply = supplyRows[0] as SupplyData
    console.log("Supply data:", supply)

    // Get cylinder details from the supply_details table
    const cylinderResult = await db.query(
      `
      SELECT 
        sd.id,
        sd.cylinder_code as code,
        sd.liters,
        sd.price,
        sd.gas_type_id,
        gt.name as gas_name
      FROM supply_details sd
      LEFT JOIN gas_types gt ON sd.gas_type_id = gt.id
      WHERE sd.supply_id = ?
    `,
      [supplyId],
    )

    const cylinderRows = Array.isArray(cylinderResult[0]) ? cylinderResult[0] : []
    const cylinders = cylinderRows.map((row: any) => ({
      id: row.id,
      code: row.code,
      gas_type_id: row.gas_type_id,
      gas_name: row.gas_name || "Unknown Gas",
      liters: row.liters,
      size: row.liters, // Using liters as size
      price: row.price,
      quantity: 1, // Default quantity
    }))

    const cylinderCount = cylinders.length

    console.log(`Found ${cylinderCount} cylinders for supply ${supplyId}`)

    const result: SupplyWithCylinders = {
      ...supply,
      cylinders: cylinders,
      cylinder_count: cylinderCount,
    }

    return NextResponse.json({
      status: "success",
      data: result,
    })
  } catch (error) {
    console.error("Error fetching supply details:", error)
    return NextResponse.json(
      { message: "Error fetching supply details", error: String(error), status: "error" },
      { status: 500 },
    )
  }
}
