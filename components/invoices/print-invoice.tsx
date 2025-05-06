"use client"

import { Button } from "@/components/ui/button"
import { Printer } from "lucide-react"
import { useState } from "react"

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

interface PrintInvoiceProps {
  invoice: Invoice
  details: InvoiceDetail[]
  formattedDate: string
  formattedSupplyDate: string
}

export function PrintInvoice({ invoice, details, formattedDate, formattedSupplyDate }: PrintInvoiceProps) {
  const [isPrinting, setIsPrinting] = useState(false)

  const handlePrint = () => {
    setIsPrinting(true)

    // Create a new window for printing
    const printWindow = window.open("", "_blank")

    if (!printWindow) {
      alert("Please allow pop-ups to print the invoice")
      setIsPrinting(false)
      return
    }

    // Generate the print content
    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Invoice #${invoice.id}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
            color: #333;
          }
          .invoice-header {
            display: flex;
            justify-content: space-between;
            margin-bottom: 30px;
          }
          .company-info {
            font-weight: bold;
            font-size: 24px;
          }
          .invoice-title {
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 20px;
            text-align: center;
          }
          .invoice-details {
            display: flex;
            justify-content: space-between;
            margin-bottom: 30px;
          }
          .invoice-to, .invoice-info {
            width: 48%;
          }
          .invoice-to h3, .invoice-info h3 {
            margin-top: 0;
            color: #666;
            border-bottom: 1px solid #eee;
            padding-bottom: 5px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
          }
          th {
            background-color: #f5f5f5;
            text-align: left;
            padding: 10px;
            border-bottom: 2px solid #ddd;
          }
          td {
            padding: 10px;
            border-bottom: 1px solid #eee;
          }
          .text-right {
            text-align: right;
          }
          .total-row {
            font-weight: bold;
          }
          .notes {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #eee;
          }
          .status {
            display: inline-block;
            padding: 5px 10px;
            border-radius: 15px;
            font-size: 12px;
            font-weight: bold;
            text-transform: uppercase;
          }
          .status-paid {
            background-color: #e6f7e6;
            color: #2e7d32;
          }
          .status-unpaid {
            background-color: #fff8e1;
            color: #ff8f00;
          }
          @media print {
            body {
              padding: 0;
              margin: 0;
            }
            button {
              display: none;
            }
          }
        </style>
      </head>
      <body>
        <div class="invoice-header">
          <div class="company-info">Gas Management System</div>
          <div>
            <span class="status ${invoice.status === "paid" ? "status-paid" : "status-unpaid"}">
              ${invoice.status.toUpperCase()}
            </span>
          </div>
        </div>
        
        <div class="invoice-title">INVOICE #${invoice.id}</div>
        
        <div class="invoice-details">
          <div class="invoice-to">
            <h3>Invoice To:</h3>
            <p>${invoice.hospital_name}</p>
          </div>
          <div class="invoice-info">
            <h3>Invoice Details:</h3>
            <p><strong>Invoice Number:</strong> #${invoice.id}</p>
            <p><strong>Invoice Date:</strong> ${formattedDate}</p>
            <p><strong>Supply Date:</strong> ${formattedSupplyDate}</p>
            <p><strong>Supply ID:</strong> #${invoice.delivery_id}</p>
          </div>
        </div>
        
        <table>
          <thead>
            <tr>
              <th>Item</th>
              <th>Cylinder Code</th>
              <th>Liters</th>
              <th class="text-right">Price</th>
            </tr>
          </thead>
          <tbody>
            ${details
              .map(
                (detail) => `
              <tr>
                <td>${detail.gas_name}</td>
                <td>${detail.cylinder_code}</td>
                <td>${detail.liters}</td>
                <td class="text-right">$${Number(detail.price).toFixed(2)}</td>
              </tr>
            `,
              )
              .join("")}
          </tbody>
          <tfoot>
            <tr class="total-row">
              <td colspan="3" class="text-right">Total:</td>
              <td class="text-right">$${Number(invoice.amount).toFixed(2)}</td>
            </tr>
          </tfoot>
        </table>
        
        <div class="notes">
          <h3>Notes:</h3>
          <p>Thank you for your business. Payment is due within 30 days of invoice date.</p>
        </div>
        
        <script>
          // Auto print and close
          window.onload = function() {
            window.print();
            // Don't close the window automatically to allow the user to see any print errors
          }
        </script>
      </body>
      </html>
    `

    // Write to the new window and print
    printWindow.document.open()
    printWindow.document.write(printContent)
    printWindow.document.close()

    // Reset the printing state after a delay
    setTimeout(() => {
      setIsPrinting(false)
    }, 1000)
  }

  return (
    <Button onClick={handlePrint} disabled={isPrinting} variant="outline" size="sm" className="gap-1">
      <Printer className="h-4 w-4" />
      {isPrinting ? "Preparing..." : "Print"}
    </Button>
  )
}
