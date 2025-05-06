"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { CheckCircle, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { updateInvoice } from "@/app/actions/update-invoice"

interface InvoiceStatusButtonProps {
  invoiceId: number
  currentStatus: "paid" | "unpaid"
}

export function InvoiceStatusButton({ invoiceId, currentStatus }: InvoiceStatusButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null)
  const router = useRouter()

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutId) clearTimeout(timeoutId)
    }
  }, [timeoutId])

  const handleClick = async () => {
    if (isLoading) return

    setIsLoading(true)

    // Set a timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      setIsLoading(false)
      toast.error("Request timed out. Please try again.")
    }, 10000) // 10 second timeout

    setTimeoutId(timeout)

    try {
      console.log(`[Client] Starting update for invoice ${invoiceId}`)
      const newStatus = currentStatus === "paid" ? "unpaid" : "paid"

      // Call the server action
      const result = await updateInvoice(invoiceId, newStatus)

      // Clear the timeout since we got a response
      clearTimeout(timeout)
      setTimeoutId(null)

      console.log(`[Client] Update result:`, result)

      if (result.success) {
        toast.success(`Invoice marked as ${newStatus}`)

        // Force a hard refresh to ensure we get the latest data
        window.location.href = window.location.href
      } else {
        toast.error(`Failed to update: ${result.error || "Unknown error"}`)
      }
    } catch (error) {
      console.error("[Client] Error updating invoice:", error)
      toast.error("An unexpected error occurred")
    } finally {
      // Always reset loading state
      clearTimeout(timeout)
      setTimeoutId(null)
      setIsLoading(false)
    }
  }

  return (
    <Button
      onClick={handleClick}
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
  )
}
