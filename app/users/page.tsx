"use client"

import { useState, useEffect } from "react"
import UsersTable from "@/components/users/users-table"
import AddUserDialog from "@/components/users/add-user-dialog"
import { useCurrentUser } from "@/components/auth/role-access-control"

export default function UsersPage() {
  const { user, loading } = useCurrentUser()
  const [hasAccess, setHasAccess] = useState(false)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  useEffect(() => {
    if (!loading && user) {
      if (user.role === "admin") {
        setHasAccess(true)
      } else {
        window.location.href = "/dashboard"
      }
    } else if (!loading && !user) {
      window.location.href = "/login"
    }
  }, [user, loading])

  const handleUserAdded = () => {
    setRefreshTrigger((prev) => prev + 1)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
      </div>
    )
  }

  if (!hasAccess) {
    return null
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">User Management</h2>
          <p className="text-gray-600 mt-1">Manage system users and their roles</p>
        </div>
        <AddUserDialog onUserAdded={handleUserAdded} />
      </div>
      <UsersTable key={refreshTrigger} />
    </div>
  )
}
