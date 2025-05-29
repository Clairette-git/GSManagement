"use client"

import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import Link from "next/link"
import SuppliesTable from "@/components/supplies/supplies-table"
import { useCurrentUser } from "@/components/auth/role-access-control"

export default function SuppliesPage() {
  const { user } = useCurrentUser()

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">GSIMS</h2>
          <p className="text-sm text-teal-300 mt-2">
            Welcome, {user?.username} ({user?.role})
          </p>
        </div>
        {(user?.role === "admin" || user?.role === "storekeeper") && (
          <Link href="/supplies/add">
            <Button className="bg-teal-600 hover:bg-teal-700">
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Supply
            </Button>
          </Link>
        )}
      </div>
      <SuppliesTable />
    </div>
  )
}
