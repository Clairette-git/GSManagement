import RoleAccessControl from "@/components/auth/role-access-control"
import CylinderAssignmentForm from "@/components/cylinders/cylinder-assignment-form"

export default function AssignCylindersPage() {
  return (
    <RoleAccessControl allowedRoles={["admin", "storekeeper"]}>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            
          </div>
        </div>
        <CylinderAssignmentForm />
      </div>
    </RoleAccessControl>
  )
}