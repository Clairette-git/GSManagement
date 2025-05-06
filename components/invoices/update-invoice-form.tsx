"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { CheckCircle, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

interface UpdateInvoiceFormProps {
  invoiceId: number
  currentStatus: "paid" | "unpaid"
}

export function UpdateInvoiceForm({ invoiceId, currentStatus }: UpdateInvoiceFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const formData = new FormData()
      formData.append("invoiceId", invoiceId.toString())
      formData.append("status", currentStatus === "paid" ? "unpaid" : "paid")

      console.log(`Submitting form to update invoice ${invoiceId}`)

      const response = await fetch("/api/update-invoice", {
        method: "POST",
        body: formData,
      })

      console.log(`Response status: ${response.status}`)

      if (response.ok) {
        const data = await response.json()
        toast.success(data.message || "Status updated successfully")
        router.refresh()
      } else {
        const text = await response.text()
        console.error("Error response:", text)
        toast.error("Failed to update status")
      }
    } catch (error) {
      console.error("Error updating invoice:", error)
      toast.error("An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input type="hidden" name="invoiceId" value={invoiceId} />
      <input type="hidden" name="status" value={currentStatus === "paid" ? "unpaid" : "paid"} />

      <Button
        type="submit"
        disabled={isLoading}
        variant={currentStatus === "paid" ? "outline" : "default"}
        size="sm"
        className={`gap-1 ${
          currentStatus === "paid"
            ? "text-green-700 border-green-200 bg-green-50 hover:bg-green-100"
            : "bg-green-600 hover:bg-green-700 text-white"
        }`}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <>
            <CheckCircle className="h-4 w-4" />
            {currentStatus === "paid" ? "Mark as Unpaid" : "Mark as Paid"}
          </>
        )}
      </Button>
    </form>
  )
}
