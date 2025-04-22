import type { Metadata } from "next"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import Link from "next/link"
import SuppliesTable from "@/components/supplies/supplies-table"

export const metadata: Metadata = {
  title: "Supplies | Gas Management System",
  description: "Manage gas supplies to hospitals",
}

export default function SuppliesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">GSIMS</h2>
          <p className="text-gray-400 mt-1"></p>
        </div>
        {/* <Link href="/supplies/add">
          <Button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 border-0">
            <PlusCircle className="mr-2 h-4 w-4" />
            New Supply
          </Button>
        </Link> */}
      </div>
      <SuppliesTable />
    </div>
  )
}
