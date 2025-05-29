// import { NextResponse } from "next/server"
// import { db } from "@/lib/db"
// import type { RowDataPacket } from "mysql2"

// export async function GET() {
//   try {
//     // Get inventory summary with gas type names
//     const [rows] = await db.query<RowDataPacket[]>(`
//       SELECT 
//         i.gas_type_id, 
//         g.name AS gas_name, 
//         i.total_cylinders, 
//         i.total_liters
//       FROM 
//         inventory i
//       JOIN 
//         gas_types g ON i.gas_type_id = g.id
//       ORDER BY 
//         g.name
//     `)

//     // Log the summary for debugging
//     console.log("Inventory summary data:", rows)

//     // If no data, return empty array
//     if (!rows || rows.length === 0) {
//       return NextResponse.json({
//         data: [],
//         message: "No inventory data found",
//       })
//     }

//     return NextResponse.json({
//       data: rows,
//     })
//   } catch (error) {
//     console.error("Error fetching inventory summary:", error)
//     return NextResponse.json(
//       {
//         message: "Internal server error",
//         error: error instanceof Error ? error.message : "Unknown error",
//       },
//       { status: 500 },
//     )
//   }
// }
