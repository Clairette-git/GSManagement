import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const period = searchParams.get("period") || "day"

    // Return some sample data for debugging
    return NextResponse.json({
      success: true,
      message: "Debug endpoint working correctly",
      params: {
        period,
        timestamp: new Date().toISOString(),
      },
      sampleData: [
        { id: 1, name: "Sample 1", value: 100 },
        { id: 2, name: "Sample 2", value: 200 },
        { id: 3, name: "Sample 3", value: 300 },
      ],
    })
  } catch (error) {
    console.error("Debug endpoint error:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Debug endpoint error",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
