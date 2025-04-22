// "use client"

// import type { ColumnDef } from "@tanstack/react-table"
// import { Button } from "@/components/ui/button"
// import { FileText } from "lucide-react"

// // Define the Supply type based on your data structure
// interface Supply {
//   id: string
//   createdAt: string
//   customer: { name: string; address: string }
//   gasType: { name: string }
//   quantity: number
//   unit: string
//   price: number
//   status: string
//   technician: { name: string }
// }

// export const columns = ({ onGenerateInvoice }: { onGenerateInvoice: (id: string) => void }): ColumnDef<Supply>[] => [
//   {
//     accessorKey: "id",
//     header: "ID",
//     cell: ({ row }) => <div>{row.original.id.substring(0, 8)}</div>,
//   },
//   {
//     accessorKey: "createdAt",
//     header: "Date",
//     cell: ({ row }) => <div>{new Date(row.original.createdAt).toLocaleDateString()}</div>,
//   },
//   {
//     accessorKey: "customer.name",
//     header: "Customer",
//   },
//   {
//     accessorKey: "gasType.name",
//     header: "Gas Type",
//   },
//   {
//     accessorKey: "quantity",
//     header: "Quantity",
//   },
//   {
//     accessorKey: "price",
//     header: "Price",
//     cell: ({ row }) => <div>${row.original.price.toFixed(2)}</div>,
//   },
//   {
//     accessorKey: "status",
//     header: "Status",
//   },
//   {
//     id: "actions",
//     cell: ({ row }) => {
//       return (
//         <Button variant="ghost" size="icon" onClick={() => onGenerateInvoice(row.original.id)} title="Generate Invoice">
//           <FileText className="h-4 w-4" />
//         </Button>
//       )
//     },
//   },
// ]
