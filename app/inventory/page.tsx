// import type { Metadata } from "next"
// import { Button } from "@/components/ui/button"
// import { PlusCircle } from "lucide-react"
// import Link from "next/link"
// import InventoryTable from "@/components/inventory/inventory-table"

// export const metadata: Metadata = {
//   title: "Inventory | Gas Management System",
//   description: "Manage gas inventory",
// }

// export default function InventoryPage() {
//   return (
//     <div className="space-y-6">
//       <div className="flex items-center justify-between">
//         <div>
//           <h2 className="text-3xl font-bold tracking-tight">Inventory</h2>
//           <p className="text-gray-400 mt-1">Manage gas types and their prices</p>
//         </div>
//         <Link href="/inventory/add-gas-type">
//           <Button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 border-0">
//             <PlusCircle className="mr-2 h-4 w-4" />
//             Add Gas Type
//           </Button>
//         </Link>
//       </div>
//       <InventoryTable />
//     </div>
//   )
// }
import type { Metadata } from "next"
import InventoryTable from "@/components/inventory/inventory-table"

export const metadata: Metadata = {
  title: "Inventory | Gas Management System",
  description: "Manage gas inventory",
}

export default function InventoryPage() {
  return (
    <div className="space-y-6 p-6">
      <InventoryTable />
    </div>
  )
}