import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import type { RowDataPacket } from "mysql2"

interface StatusDistribution {
  status: string
  count: number
}

interface TopHospital {
  hospital_name: string
  count: number
  revenue: number
}

interface RevenueByDay {
  day: string
  total: number
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const period = searchParams.get("period") || "day"

    console.log("🔍 Fetching reports overview for period:", period)

    try {
      // Test basic database connection
      await db.query("SELECT 1")
      console.log("✅ Database connection successful")

      // Build date conditions based on your actual table structure
      let cylinderDateCondition = ""
      let suppliesDateCondition = ""

      switch (period) {
        case "day":
          cylinderDateCondition = "DATE(filling_start_time) = CURDATE()"
          suppliesDateCondition = "DATE(date) = CURDATE()"
          break
        case "week":
          cylinderDateCondition = "filling_start_time >= DATE_SUB(NOW(), INTERVAL 1 WEEK)"
          suppliesDateCondition = "date >= DATE_SUB(NOW(), INTERVAL 1 WEEK)"
          break
        case "month":
          cylinderDateCondition = "filling_start_time >= DATE_SUB(NOW(), INTERVAL 1 MONTH)"
          suppliesDateCondition = "date >= DATE_SUB(NOW(), INTERVAL 1 MONTH)"
          break
        case "year":
          cylinderDateCondition = "filling_start_time >= DATE_SUB(NOW(), INTERVAL 1 YEAR)"
          suppliesDateCondition = "date >= DATE_SUB(NOW(), INTERVAL 1 YEAR)"
          break
        default:
          cylinderDateCondition = "1=1"
          suppliesDateCondition = "1=1"
      }

      console.log("📅 Cylinder date condition:", cylinderDateCondition)
      console.log("📅 Supplies date condition:", suppliesDateCondition)

      // Get cylinder counts by status with date filtering
      let filledCount = 0
      let deliveredCount = 0
      let returnedCount = 0

      try {
        const [filledResult] = (await db.query(
          `SELECT COUNT(*) as count FROM cylinders WHERE status = 'filled' AND ${cylinderDateCondition}`,
        )) as RowDataPacket[][]
        filledCount = filledResult[0]?.count || 0
        console.log(`📦 ${period} filled cylinders:`, filledCount)
      } catch (e) {
        console.log("❌ Error counting filled cylinders:", e)
      }

      try {
        const [deliveredResult] = (await db.query(
          `SELECT COUNT(*) as count FROM cylinders WHERE status = 'delivered' AND ${cylinderDateCondition}`,
        )) as RowDataPacket[][]
        deliveredCount = deliveredResult[0]?.count || 0
        console.log(`🚚 ${period} delivered cylinders:`, deliveredCount)
      } catch (e) {
        console.log("❌ Error counting delivered cylinders:", e)
      }

      try {
        const [returnedResult] = (await db.query(
          `SELECT COUNT(*) as count FROM cylinders WHERE status = 'returned' AND ${cylinderDateCondition}`,
        )) as RowDataPacket[][]
        returnedCount = returnedResult[0]?.count || 0
        console.log(`🔄 ${period} returned cylinders:`, returnedCount)
      } catch (e) {
        console.log("❌ Error counting returned cylinders:", e)
      }

      // Get supplies data with date filtering
      let hospitalsCount = 0
      let totalRevenue = 0
      let invoicesCount = 0

      try {
        const [hospitalsResult] = (await db.query(
          `SELECT COUNT(DISTINCT hospital_name) as count FROM supplies WHERE ${suppliesDateCondition}`,
        )) as RowDataPacket[][]
        hospitalsCount = hospitalsResult[0]?.count || 0
        console.log(`🏥 ${period} hospitals served:`, hospitalsCount)
      } catch (e) {
        console.log("❌ Error counting hospitals:", e)
      }

      try {
        const [revenueResult] = (await db.query(
          `SELECT COALESCE(SUM(total_price), 0) as total FROM supplies WHERE ${suppliesDateCondition}`,
        )) as RowDataPacket[][]
        totalRevenue = revenueResult[0]?.total || 0
        console.log(`💰 ${period} total revenue:`, totalRevenue)
      } catch (e) {
        console.log("❌ Error calculating revenue:", e)
      }

      try {
        const [invoicesResult] = (await db.query(
          `SELECT COUNT(*) as count FROM supplies WHERE ${suppliesDateCondition}`,
        )) as RowDataPacket[][]
        invoicesCount = invoicesResult[0]?.count || 0
        console.log(`📄 ${period} invoices count:`, invoicesCount)
      } catch (e) {
        console.log("❌ Error counting invoices:", e)
      }

      // Get status distribution for chart (with date filtering)
      let statusDistribution: StatusDistribution[] = []
      try {
        const [statusResult] = (await db.query(
          `SELECT status, COUNT(*) as count FROM cylinders WHERE ${cylinderDateCondition} GROUP BY status`,
        )) as RowDataPacket[][]
        statusDistribution = statusResult.map((row) => ({
          status: row.status,
          count: row.count,
        }))
        console.log("📊 Status distribution:", statusDistribution)
      } catch (e) {
        console.log("❌ Error getting status distribution:", e)
        statusDistribution = [
          { status: "filled", count: filledCount },
          { status: "delivered", count: deliveredCount },
          { status: "returned", count: returnedCount },
        ]
      }

      // Get top hospitals for chart (with date filtering)
      let topHospitals: TopHospital[] = []
      try {
        const [hospitalsResult] = (await db.query(`
          SELECT 
            hospital_name, 
            COUNT(*) as count, 
            COALESCE(SUM(total_price), 0) as revenue 
          FROM supplies 
          WHERE ${suppliesDateCondition}
          GROUP BY hospital_name 
          ORDER BY count DESC 
          LIMIT 5
        `)) as RowDataPacket[][]
        topHospitals = hospitalsResult.map((row) => ({
          hospital_name: row.hospital_name,
          count: row.count,
          revenue: row.revenue,
        }))
        console.log("🏆 Top hospitals:", topHospitals)
      } catch (e) {
        console.log("❌ Error getting top hospitals:", e)
        topHospitals = []
      }

      // Get revenue by day for chart (with date filtering)
      let revenueByDay: RevenueByDay[] = []
      try {
        const [revenueResult] = (await db.query(`
          SELECT 
            DATE(date) as day, 
            COALESCE(SUM(total_price), 0) as total 
          FROM supplies 
          WHERE ${suppliesDateCondition}
          GROUP BY DATE(date) 
          ORDER BY DATE(date) DESC
          LIMIT 30
        `)) as RowDataPacket[][]
        revenueByDay = revenueResult.map((row) => ({
          day: row.day,
          total: row.total,
        }))
        console.log("📈 Revenue by day:", revenueByDay)
      } catch (e) {
        console.log("❌ Error getting revenue by day:", e)
        revenueByDay = []
      }

      const responseData = {
        filled: filledCount,
        delivered: deliveredCount,
        returned: returnedCount,
        hospitals: hospitalsCount,
        revenue: totalRevenue,
        invoices: invoicesCount,
        statusDistribution: statusDistribution,
        topHospitals: topHospitals,
        revenueByDay: revenueByDay,
        period: period,
      }

      console.log("✅ Final response data:", responseData)

      return NextResponse.json({
        success: true,
        data: responseData,
      })
    } catch (dbError) {
      console.error("❌ Database error:", dbError)

      return NextResponse.json({
        success: true,
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
          period: period,
          message: "Using fallback data due to database error",
        },
      })
    }
  } catch (error) {
    console.error("❌ Error fetching reports overview:", error)

    return NextResponse.json({
      success: true,
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
        period: "day",
        message: "Using fallback data due to system error",
      },
    })
  }
}
