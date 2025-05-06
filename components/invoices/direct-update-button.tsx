"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { CheckCircle, Loader2 } from "lucide-react"
import { toast } from "sonner"

interface DirectUpdateButtonProps {
  invoiceId: number
  currentStatus: "paid" | "unpaid"
}

export function DirectUpdateButton({ invoiceId, currentStatus }: DirectUpdateButtonProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleClick = async () => {
    setIsLoading(true)

    try {
      const newStatus = currentStatus === "paid" ? "unpaid" : "paid"

      console.log(`[Client] Sending direct update for invoice ${invoiceId} to ${newStatus}`)

      const response = await fetch("/api/direct-update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          invoiceId,
          status: newStatus,
        }),
      })

      const data = await response.json()

      if (data.success) {
        toast.success(data.message)
        window.location.reload()
      } else {
        toast.error(data.message || "Failed to update")
      }
    } catch (error) {
      console.error("Error:", error)
      toast.error("An error occurred")
    } finally {
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
