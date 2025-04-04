import type { Metadata } from "next"
import CylinderForm from "@/components/cylinders/cylinder-form"

export const metadata: Metadata = {
  title: "Add Cylinder | Gas Management System",
  description: "Add a new gas cylinder to the system",
}

export default function AddCylinderPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Add Cylinder</h2>
      </div>
      <CylinderForm />
    </div>
  )
}

