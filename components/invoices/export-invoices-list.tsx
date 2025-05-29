"use client"

import { Button } from "@/components/ui/button"
import { FileSpreadsheet } from "lucide-react"
import { formatDate } from "@/lib/utils"
import { toast } from "sonner"

interface ExportInvoicesListProps {
  invoices: any[]
}

export function ExportInvoicesList({ invoices }: ExportInvoicesListProps) {
  const handleExport = () => {
    try {
      // Create CSV content
      let csvContent = "data:text/csv;charset=utf-8,"

      // Add headers
      csvContent += "Invoice Number,Date,Hospital,Amount,Status\n"

      // Add data rows
      invoices.forEach((invoice) => {
        csvContent += `INV-${invoice.id.toString().padStart(4, "0")}",`;
        csvContent += `${formatDate(invoice.date)}",`;
        csvContent += `"${invoice.hospital_name.trim()}",`;
        csvContent += `$${Number(invoice.amount).toFixed(2)}",`;
        csvContent += `${invoice.status}"\n`;
      })

      // Create download link
      const encodedUri = encodeURI(csvContent)
      const link = document.createElement("a")
      link.setAttribute("href", encodedUri)
      link.setAttribute("download", `invoices_${new Date().toISOString().split("T")[0]}.csv`)
      document.body.appendChild(link)

      // Trigger download
      link.click()
      document.body.removeChild(link)

      toast.success("Invoices exported successfully")
    } catch (error) {
      console.error("Error exporting invoices:", error)
      toast.error("Failed to export invoices")
    }
  }

  return (
    <Button variant="outline" onClick={handleExport}>
      <FileSpreadsheet className="mr-2 h-4 w-4" />
      Export All
    </Button>
  )
}
