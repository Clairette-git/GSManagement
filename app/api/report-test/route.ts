import { NextResponse } from "next/server"

export async function GET() {
  console.log("🧪 Reports test API hit!")
  return NextResponse.json({
    message: "Reports test API is working!",
    timestamp: new Date().toISOString(),
  })
}
