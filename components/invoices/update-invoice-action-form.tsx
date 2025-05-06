"use client"

import { useTransition } from "react"
import { Button } from "@/components/ui/button"
import { CheckCircle, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { updateInvoiceStatus } from "@/app/actions/invoice-actions"

interface UpdateInvoiceActionFormProps {
  invoiceId: number
  currentStatus: "paid" | "unpaid"
}

export function UpdateInvoiceActionForm({ invoiceId, currentStatus }: UpdateInvoiceActionFormProps) {
  const [isPending, startTransition] = useTransition()

  const handleAction = () => {
    const newStatus = currentStatus === "paid" ? "unpaid" : "paid"

    startTransition(async () => {
      try {
        console.log(`Starting transition to update invoice ${invoiceId} to ${newStatus}`)
        const result = await updateInvoiceStatus(invoiceId, newStatus)

        if (result.success) {
          toast.success(result.message)
        } else {
          toast.error(result.message)
        }
      } catch (error) {
        console.error("Error in server action:", error)
        toast.error("Failed to update invoice status")
      }
    })
  }

  return (
    <Button
      onClick={handleAction}
      disabled={isPending}
      variant={currentStatus === "paid" ? "outline" : "default"}
      size="sm"
      className={`gap-1 ${
        currentStatus === "paid"
          ? "text-green-700 border-green-200 bg-green-50 hover:bg-green-100"
          : "bg-green-600 hover:bg-green-700 text-white"
      }`}
    >
      {isPending ? (
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
