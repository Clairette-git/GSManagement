import type { Metadata } from "next"
import GasTypeForm from "@/components/inventory/gas-type-form"

export const metadata: Metadata = {
  title: "Add Gas Type | Gas Management System",
  description: "Add a new gas type to the system",
}

export default function AddGasTypePage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Add Gas Type</h2>
      </div>
      <GasTypeForm />
    </div>
  )
}

