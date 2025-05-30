import RoleAccessControl from "@/components/auth/role-access-control"
import ReportsOverview from "@/components/reports/reports-overview"

export default function ReportsPage() {
  return (
    <RoleAccessControl allowedRoles={["admin", "storekeeper"]}>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
          </div>
        </div>
        <ReportsOverview />
      </div>
    </RoleAccessControl>
  )
}
