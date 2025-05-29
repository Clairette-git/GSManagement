import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    console.log("Simple test endpoint called")

    const { searchParams } = new URL(request.url)
    const period = searchParams.get("period") || "day"
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")

    console.log("Parameters:", { period, startDate, endDate })

    // Return mock data for testing
    const mockData = [
      {
        id: 1,
        code: "CYL001",
        size: "Large",
        gas_type: "Oxygen",
        status: "filled",
        created_at: new Date().toISOString(),
      },
      {
        id: 2,
        code: "CYL002",
        size: "Medium",
        gas_type: "Nitrogen",
        status: "filled",
        created_at: new Date().toISOString(),
      },
      {
        id: 3,
        code: "CYL003",
        size: "Small",
        gas_type: "Oxygen",
        status: "filled",
        created_at: new Date().toISOString(),
      },
    ]

    console.log("Returning mock data:", mockData)

    return NextResponse.json({
      success: true,
      data: mockData,
      count: mockData.length,
      message: "Test endpoint working",
    })
  } catch (error) {
    console.error("Error in test endpoint:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Test endpoint failed",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
