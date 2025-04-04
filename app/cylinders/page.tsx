import type { Metadata } from "next"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import Link from "next/link"
import CylindersTable from "@/components/cylinders/cylinders-table"

export const metadata: Metadata = {
  title: "Cylinders | Gas Management System",
  description: "Manage gas cylinders",
}

export default function CylindersPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Cylinders</h2>
        <Link href="/cylinders/add">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Cylinder
          </Button>
        </Link>
      </div>
      <CylindersTable />
    </div>
  )
}

