"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { CheckCircle, Loader2 } from "lucide-react"
import { toast } from "sonner"

interface InvoiceStatusFormProps {
  invoiceId: number
  currentStatus: "paid" | "unpaid"
}

export function InvoiceStatusForm({ invoiceId, currentStatus }: InvoiceStatusFormProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const newStatus = currentStatus === "paid" ? "unpaid" : "paid"

      // Create a simple form submission
      const formData = new FormData()
      formData.append("id", invoiceId.toString())
      formData.append("status", newStatus)

      // Submit directly to a PHP script or other server-side handler
      const response = await fetch("/update-invoice-status.php", {
        method: "POST",
        body: formData,
      })

      if (response.ok) {
        toast.success(`Invoice marked as ${newStatus}`)
        window.location.reload()
      } else {
        toast.error("Failed to update invoice status")
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
      <input type="hidden" name="id" value={invoiceId} />
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
