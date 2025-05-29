import { NextResponse } from "next/server"

export async function GET() {
  console.log("✅ Basic test API route hit!")
  return NextResponse.json({
    message: "Basic API route is working!",
    timestamp: new Date().toISOString(),
  })
}
