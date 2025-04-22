// // app/api/supplies/exports/actions.ts
// "use server"

// import { auth } from "@/lib/auth"
// import { prisma } from "@/lib/db"

// export async function getSupplyData(supplyId: string) {
//   const session = await auth()
//   if (!session?.user) throw new Error("Unauthorized")

//   const supply = await prisma.supply.findUnique({
//     where: { id: supplyId },
//     include: {
//       technician: true,
//       customer: true,
//       gasType: true,
//     },
//   })

//   if (!supply) throw new Error("Supply not found")
//   return supply
// }

// export async function getAllSuppliesData(filters = {}) {
//   const session = await auth()
//   if (!session?.user) throw new Error("Unauthorized")

//   const userId = session.user.id
//   const isAdmin = session.user.role === "ADMIN"

//   const supplies = await prisma.supply.findMany({
//     where: {
//       ...(isAdmin ? {} : { technicianId: userId }),
//       ...filters,
//     },
//     include: {
//       technician: { select: { name: true } },
//       customer: { select: { name: true, address: true } },
//       gasType: { select: { name: true } },
//     },
//     orderBy: { createdAt: "desc" },
//   })

//   return supplies
// }
