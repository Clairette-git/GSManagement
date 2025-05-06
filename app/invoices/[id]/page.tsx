import { db } from "@/lib/db"
import { formatDate } from "@/lib/utils"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowLeft, Building, Calendar, FileText, Truck, User } from "lucide-react"
import { PrintInvoice } from "@/components/invoices/print-invoice"
import { ExportInvoice } from "@/components/invoices/export-invoice"
import { DirectUpdateButton } from "@/components/invoices/direct-update-button"

export const dynamic = "force-dynamic"

async function getInvoice(id: string) {
  try {
    const [invoiceRows] = (await db.query(
      `SELECT i.*, s.hospital_name, s.date as supply_date, s.vehicle_plate, s.driver_name, s.recipient_name
       FROM invoices i 
       JOIN supplies s ON i.delivery_id = s.id 
       WHERE i.id = ?`,
      [id],
    )) as [any[], any]

    if (invoiceRows.length === 0) {
      return null
    }

    // Get supply details
    const [detailRows] = (await db.query(
      `SELECT sd.*, g.name as gas_name 
       FROM supply_details sd 
       JOIN gas_types g ON sd.gas_type_id = g.id 
       WHERE sd.supply_id = ?`,
      [invoiceRows[0].delivery_id],
    )) as [any[], any]

    return {
      invoice: invoiceRows[0],
      details: detailRows,
    }
  } catch (error) {
    console.error("Failed to fetch invoice:", error)
    return null
  }
}

export default async function InvoiceDetailPage({ params }: { params: { id: string } }) {
  const data = await getInvoice(params.id)

  if (!data) {
    notFound()
  }

  const { invoice, details } = data

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center gap-2">
        <Link href="/invoices">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold tracking-tight">Invoice #{invoice.id.toString().padStart(4, "0")}</h1>
        <div className="ml-auto flex gap-2">
          <DirectUpdateButton invoiceId={invoice.id} currentStatus={invoice.status} />
          <PrintInvoice invoice={invoice} details={details} formattedDate={""} formattedSupplyDate={""} />
          <ExportInvoice invoice={invoice} details={details} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle>Invoice Details</CardTitle>
              <Badge
                variant="outline"
                className={
                  invoice.status === "paid"
                    ? "bg-green-50 text-green-700 border-green-200"
                    : "bg-amber-50 text-amber-700 border-amber-200"
                }
              >
                {invoice.status === "paid" ? "Paid" : "Unpaid"}
              </Badge>
            </div>
            <CardDescription>Invoice for gas supply to {invoice.hospital_name}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item</TableHead>
                      <TableHead>Gas Type</TableHead>
                      <TableHead className="text-right">Liters</TableHead>
                      <TableHead className="text-right">Price</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {details.map((detail: any) => (
                      <TableRow key={detail.id}>
                        <TableCell className="font-medium">Cylinder {detail.cylinder_code}</TableCell>
                        <TableCell>{detail.gas_name}</TableCell>
                        <TableCell className="text-right">{detail.liters}</TableCell>
                        <TableCell className="text-right">${Number(detail.price).toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                  <TableFooter>
                    <TableRow>
                      <TableCell colSpan={3} className="text-right font-medium">
                        Total
                      </TableCell>
                      <TableCell className="text-right font-bold">${Number(invoice.amount).toFixed(2)}</TableCell>
                    </TableRow>
                  </TableFooter>
                </Table>
              </div>

              <div className="flex justify-end gap-2">
                <PrintInvoice invoice={invoice} details={details} formattedDate={""} formattedSupplyDate={""} />
                <ExportInvoice invoice={invoice} details={details} />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Invoice Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-50">
                  <FileText className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium leading-none">Invoice Number</p>
                  <p className="text-sm text-muted-foreground">INV-{invoice.id.toString().padStart(4, "0")}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-50">
                  <Calendar className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium leading-none">Invoice Date</p>
                  <p className="text-sm text-muted-foreground">{formatDate(invoice.date)}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-50">
                  <Truck className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium leading-none">Supply Date</p>
                  <p className="text-sm text-muted-foreground">{formatDate(invoice.supply_date)}</p>
                </div>
              </div>

              <Separator />

              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-50">
                  <Building className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium leading-none">Hospital</p>
                  <p className="text-sm text-muted-foreground">{invoice.hospital_name}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-50">
                  <User className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium leading-none">Recipient</p>
                  <p className="text-sm text-muted-foreground">{invoice.recipient_name}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-50">
                  <Truck className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium leading-none">Vehicle</p>
                  <p className="text-sm text-muted-foreground">{invoice.vehicle_plate}</p>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Link href={`/supplies/${invoice.delivery_id}`} className="w-full">
                <Button variant="outline" className="w-full">
                  View Supply Details
                </Button>
              </Link>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}
