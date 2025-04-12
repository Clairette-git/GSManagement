"use client"

import type React from "react"
import RoleAccessControl from "@/components/auth/role-access-control"

export default function CylindersLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <RoleAccessControl>{children}</RoleAccessControl>
}
