"use client"

import type React from "react"
import RoleAccessControl from "../../components/auth/role-access-control"

export default function InventoryLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <RoleAccessControl allowedRoles={["admin", "storekeeper"]}>
      {children}
    </RoleAccessControl>
  )
}