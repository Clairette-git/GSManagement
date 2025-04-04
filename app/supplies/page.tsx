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
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Supplies</h2>
        <Link href="/supplies/add">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            New Supply
          </Button>
        </Link>
      </div>
      <SuppliesTable />
    </div>
  )
}

