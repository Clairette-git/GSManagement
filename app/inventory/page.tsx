import RoleAccessControl from "@/components/auth/role-access-control"
import InventoryTable from "@/components/inventory/inventory-table"

export default function InventoryPage() {
  return (
    <RoleAccessControl allowedRoles={["admin", "storekeeper"]}>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            
          </div>
        </div>
        <InventoryTable />
      </div>
    </RoleAccessControl>
  )
}