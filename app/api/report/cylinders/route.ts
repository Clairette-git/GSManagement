import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET(request: Request) {
  console.log("🚀 Reports cylinders API called!")

  try {
    const { searchParams } = new URL(request.url)
    const period = searchParams.get("period") || "week"

    console.log(`📊 Fetching real data for period: ${period}`)

    // Calculate date range based on period
    const getDateRange = (period: string) => {
      const now = new Date()
      const startDate = new Date()

      switch (period) {
        case "day":
          startDate.setDate(now.getDate() - 1)
          break
        case "week":
          startDate.setDate(now.getDate() - 7)
          break
        case "month":
          startDate.setMonth(now.getMonth() - 1)
          break
        case "year":
          startDate.setFullYear(now.getFullYear() - 1)
          break
        default:
          startDate.setDate(now.getDate() - 7)
      }

      return {
        startDate: startDate.toISOString().split("T")[0],
        endDate: now.toISOString().split("T")[0],
      }
    }

    const { startDate, endDate } = getDateRange(period)
    console.log(`📅 Date range: ${startDate} to ${endDate}`)

    // Get cylinder status counts
    const cylinderStatusQuery = `
      SELECT 
        status,
        COUNT(*) as count
      FROM cylinders 
      WHERE updated_at >= ? AND updated_at <= ?
      GROUP BY status
    `
    const cylinderStatusData = await db.getMany(cylinderStatusQuery, [startDate, endDate])

    // Get total cylinders by status (for current state)
    const currentCylinderStatusQuery = `
      SELECT 
        status,
        COUNT(*) as count
      FROM cylinders 
      GROUP BY status
    `
    const currentCylinderStatus = await db.getMany(currentCylinderStatusQuery)

    // Get supplies data
    const suppliesQuery = `
      SELECT 
        COUNT(*) as total_supplies,
        COUNT(DISTINCT hospital_name) as unique_hospitals,
        SUM(total_price) as total_revenue
      FROM supplies 
      WHERE date >= ? AND date <= ?
    `
    const suppliesData = await db.getOne(suppliesQuery, [startDate, endDate])

    // Get invoices count
    const invoicesQuery = `
      SELECT COUNT(*) as total_invoices
      FROM invoices 
      WHERE date >= ? AND date <= ?
    `
    const invoicesData = await db.getOne(invoicesQuery, [startDate, endDate])

    // Get top hospitals by supply count
    const topHospitalsQuery = `
      SELECT 
        hospital_name,
        COUNT(*) as count,
        SUM(total_price) as revenue
      FROM supplies 
      WHERE date >= ? AND date <= ?
      GROUP BY hospital_name
      ORDER BY count DESC
      LIMIT 5
    `
    const topHospitals = await db.getMany(topHospitalsQuery, [startDate, endDate])

    // Get daily revenue data
    const dailyRevenueQuery = `
      SELECT 
        DATE(date) as day,
        SUM(total_price) as total
      FROM supplies 
      WHERE date >= ? AND date <= ?
      GROUP BY DATE(date)
      ORDER BY DATE(date)
    `
    const dailyRevenue = await db.getMany(dailyRevenueQuery, [startDate, endDate])

    // Get cylinder counts by status for the period
    const filledCount = currentCylinderStatus.find((s) => s.status === "filled")?.count || 0
    const deliveredCount = currentCylinderStatus.find((s) => s.status === "delivered")?.count || 0
    const returnedCount = currentCylinderStatus.find((s) => s.status === "returned")?.count || 0

    // Prepare response data
    const reportData = {
      data: {
        filled: filledCount,
        delivered: deliveredCount,
        returned: returnedCount,
        hospitals: suppliesData?.unique_hospitals || 0,
        revenue: suppliesData?.total_revenue || 0,
        invoices: invoicesData?.total_invoices || 0,
        statusDistribution: currentCylinderStatus.map((item) => ({
          status: item.status,
          count: item.count,
        })),
        topHospitals: topHospitals.map((hospital) => ({
          hospital_name: hospital.hospital_name,
          count: hospital.count,
          revenue: hospital.revenue,
        })),
        revenueByDay: dailyRevenue.map((day) => ({
          day: day.day,
          total: day.total || 0,
        })),
      },
    }

    console.log(`✅ Real data fetched for ${period}:`, reportData.data)
    return NextResponse.json(reportData)
  } catch (error) {
    console.error("❌ Error fetching real reports data:", error)

    // Return empty data structure on error instead of failing
    const emptyData = {
      data: {
        filled: 0,
        delivered: 0,
        returned: 0,
        hospitals: 0,
        revenue: 0,
        invoices: 0,
        statusDistribution: [],
        topHospitals: [],
        revenueByDay: [],
      },
    }

    return NextResponse.json(emptyData)
  }
}
