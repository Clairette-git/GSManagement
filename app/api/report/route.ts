import { NextResponse } from "next/server"

export async function GET() {
  console.log("🚀 Basic reports API hit!")
  return NextResponse.json({
    message: "Reports API is working!",
    timestamp: new Date().toISOString(),
  })
}
