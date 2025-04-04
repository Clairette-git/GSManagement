import type { Metadata } from "next"
import CylinderForm from "@/components/cylinders/cylinder-form"

export const metadata: Metadata = {
  title: "Edit Cylinder | Gas Management System",
  description: "Edit a gas cylinder in the system",
}

export default function EditCylinderPage({
  params,
}: {
  params: { id: string }
}) {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Edit Cylinder</h2>
      </div>
      <CylinderForm cylinderId={Number.parseInt(params.id)} />
    </div>
  )
}

