import { NextResponse } from "next/server"

export const runtime = "edge"

export async function GET() {
  return NextResponse.json({
    message: "This is running on the Edge Runtime!",
    timestamp: new Date().toISOString(),
  })
}
