import { db } from "@/lib/db"
import { formatDate } from "@/lib/utils"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { FileText, Plus, ArrowUpDown, ArrowLeft } from 'lucide-react'
import { ExportInvoicesList } from "@/components/invoices/export-invoices-list"
import RoleAccessControl from "@/components/auth/role-access-control"

export const dynamic = "force-dynamic"

async function getInvoices() {
  try {
    const [rows] = await db.query(
      `SELECT i.*, s.hospital_name 
       FROM invoices i 
       JOIN supplies s ON i.delivery_id = s.id 
       ORDER BY i.date DESC`,
    )
    return rows as any[]
  } catch (error) {
    console.error("Failed to fetch invoices:", error)
    return []
  }
}

export default async function InvoicesPage() {
  const invoices = await getInvoices()

  return (
    <RoleAccessControl allowedRoles={["admin", "storekeeper"]}>
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex items-center gap-2">
          <Link href="/dashboard">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold tracking-tight">Invoices</h1>
          <div className="ml-auto flex gap-2">
            {invoices.length > 0 && <ExportInvoicesList invoices={invoices} />}
            <Link href="/supplies/add">
              <Button className="bg-teal-500">
                <Plus className="mr-2 h-4 w-4" />
                New Supply with Invoice
              </Button>
            </Link>
          </div>
        </div>

        <Card className="bg-teal-600 border-teal-600">
          <CardHeader className="pb-3">
            <CardTitle>All Invoices</CardTitle>
            <CardDescription>Manage invoices for gas supplies to hospitals</CardDescription>
          </CardHeader>
          <CardContent>
            {invoices.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="rounded-full bg-blue-50 p-3 mb-4">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-1">No invoices found</h3>
                <p className="text-sm text-gray-500 mb-4 max-w-md">
                  Create a new supply with the invoice option enabled to generate invoices.
                </p>
                <Link href="/supplies/add">
                  <Button variant="outline">Create Supply with Invoice</Button>
                </Link>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[100px]">Invoice #</TableHead>
                      <TableHead>
                        <div className="flex items-center space-x-1">
                          <span>Date</span>
                          <ArrowUpDown className="h-3 w-3" />
                        </div>
                      </TableHead>
                      <TableHead>Hospital</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invoices.map((invoice: any) => (
                      <TableRow key={invoice.id}>
                        <TableCell className="font-medium">INV-{invoice.id.toString().padStart(4, "0")}</TableCell>
                        <TableCell>{formatDate(invoice.date)}</TableCell>
                        <TableCell>{invoice.hospital_name}</TableCell>
                        <TableCell className="text-right font-medium">RWF{Number(invoice.amount).toFixed(2)}</TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={
                              invoice.status === "paid"
                                ? "bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                                : "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100"
                            }
                          >
                            {invoice.status === "paid" ? "Paid" : "Unpaid"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Link href={`/invoices/${invoice.id}`}>
                            <Button className="bg-teal-100" variant="ghost" size="sm">
                              View
                            </Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </RoleAccessControl>
  )
}