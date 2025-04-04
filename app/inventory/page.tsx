import type { Metadata } from "next"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import Link from "next/link"
import InventoryTable from "@/components/inventory/inventory-table"

export const metadata: Metadata = {
  title: "Inventory | Gas Management System",
  description: "Manage gas inventory",
}

export default function InventoryPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Inventory</h2>
        <Link href="/inventory/add-gas-type">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Gas Type
          </Button>
        </Link>
      </div>
      <InventoryTable />
    </div>
  )
}

