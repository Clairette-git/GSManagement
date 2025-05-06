"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { CheckCircle, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { updateInvoiceStatus } from "@/app/actions/invoice-actions"

interface UpdateInvoiceStatusProps {
  invoiceId: number
  currentStatus: "paid" | "unpaid"
}

export function UpdateInvoiceStatus({ invoiceId, currentStatus }: UpdateInvoiceStatusProps) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleUpdateStatus = async () => {
    setIsLoading(true)

    try {
      const newStatus = currentStatus === "paid" ? "unpaid" : "paid"

      console.log(`Client: Updating invoice ${invoiceId} status to ${newStatus} using Server Action`)

      // Call the server action directly
      const result = await updateInvoiceStatus(invoiceId, newStatus)

      console.log("Server action result:", result)

      if (result.success) {
        toast.success(result.message)
        router.refresh()
      } else {
        toast.error(result.message)
      }
    } catch (error) {
      console.error("Error calling server action:", error)
      toast.error("An error occurred while updating the invoice status")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      onClick={handleUpdateStatus}
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
