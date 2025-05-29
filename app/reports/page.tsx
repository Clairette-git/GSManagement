import RoleAccessControl from "@/components/auth/role-access-control"
import ReportsOverview from "@/components/reports/reports-overview"

export default function ReportsPage() {
  return (
    <RoleAccessControl allowedRoles={["admin"]}>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
            <p className="text-gray-600 mt-2">Comprehensive overview of your gas management operations</p>
          </div>
        </div>
        <ReportsOverview />
      </div>
    </RoleAccessControl>
  )
}
