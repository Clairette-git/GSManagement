import RoleAccessControl from "@/components/auth/role-access-control"
import CylinderAssignmentForm from "@/components/cylinders/cylinder-assignment-form"

export default function AssignCylindersPage() {
  return (
    <RoleAccessControl allowedRoles={["admin", "storekeeper"]}>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Assign Cylinders</h1>
            <p className="text-gray-600 mt-2">Assign filled cylinders to vehicles and drivers</p>
          </div>
        </div>
        <CylinderAssignmentForm />
      </div>
    </RoleAccessControl>
  )
}