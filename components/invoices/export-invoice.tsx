"use client"

import { Button } from "@/components/ui/button"
import { FileSpreadsheet } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

interface InvoiceDetail {
  id: number
  gas_name: string
  cylinder_code: string
  liters: number
  price: number
  [key: string]: any
}

interface Invoice {
  id: number
  delivery_id: number
  date: string
  amount: number
  status: "paid" | "unpaid"
  hospital_name: string
  supply_date: string
  [key: string]: any
}

interface ExportInvoiceProps {
  invoice: Invoice
  details: InvoiceDetail[]
}

export function ExportInvoice({ invoice, details }: ExportInvoiceProps) {
  const [isExporting, setIsExporting] = useState(false)

  const handleExport = () => {
    setIsExporting(true)

    try {
      // Create CSV content
      let csvContent = "data:text/csv;charset=utf-8,"

      // Add invoice header
      csvContent += "Invoice #" + invoice.id + "\r\n"
      csvContent += "Hospital," + invoice.hospital_name + "\r\n"
      csvContent += "Invoice Date," + new Date(invoice.date).toLocaleDateString() + "\r\n"
      csvContent += "Supply Date," + new Date(invoice.supply_date).toLocaleDateString() + "\r\n"
      csvContent += "Supply ID," + invoice.delivery_id + "\r\n"
      csvContent += "Status," + invoice.status.toUpperCase() + "\r\n\r\n"

      // Add details header
      csvContent += "Item,Cylinder Code,Liters,Price\r\n"

      // Add details rows
      details.forEach((detail) => {
        csvContent += `${detail.gas_name},${detail.cylinder_code},${detail.liters},$${Number(detail.price).toFixed(2)}\r\n`
      })

      // Add total
      csvContent += `\r\nTotal,,,$${Number(invoice.amount).toFixed(2)}\r\n`

      // Create download link
      const encodedUri = encodeURI(csvContent)
      const link = document.createElement("a")
      link.setAttribute("href", encodedUri)
      link.setAttribute("download", `invoice-${invoice.id}.csv`)
      document.body.appendChild(link)

      // Trigger download
      link.click()
      document.body.removeChild(link)

      toast.success("Invoice exported successfully")
    } catch (error) {
      console.error("Error exporting invoice:", error)
      toast.error("Failed to export invoice")
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <Button onClick={handleExport} disabled={isExporting} variant="outline" size="sm" className="gap-1">
      <FileSpreadsheet className="h-4 w-4" />
      {isExporting ? "Exporting..." : "Export CSV"}
    </Button>
  )
}
