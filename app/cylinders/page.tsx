"use client"

import RoleAccessControl from "@/components/auth/role-access-control"
import CylindersTable from "@/components/cylinders/cylinders-table"

export default function CylindersPage() {
  return (
    <RoleAccessControl allowedRoles={["admin", "storekeeper", "filler"]}>
      <div className="space-y-6 p-6">
        <div className="flex justify-between items-center">
          
        </div>
        <CylindersTable />
      </div>
    </RoleAccessControl>
  )
}
