import type { Metadata } from "next"
import SupplyForm from "@/components/supplies/supply-form"
import RoleAccessControl from "@/components/auth/role-access-control"

export const metadata: Metadata = {
  title: "Add Supply | Gas Management System",
  description: "Add a new gas supply to the system",
}

export default function AddSupplyPage() {
  return (
    <RoleAccessControl allowedRoles={["admin", "technician"]}>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <SupplyForm />
      </div>
    </RoleAccessControl>
  )
}