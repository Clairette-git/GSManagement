import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import { verify } from "jsonwebtoken"

export default async function Home() {
  // Get the token from cookies - using await since cookies() is async
  const cookieStore = await cookies()
  const token = cookieStore.get("auth_token")?.value

  if (token) {
    try {
      // Verify and decode the token
      const jwtSecret = process.env.JWT_SECRET || "mySecret-key"
      const decoded = verify(token, jwtSecret) as { role: string }
      const userRole = decoded.role

      // Redirect based on role
      if (userRole === "technician") {
        redirect("/supplies")
      } else {
        redirect("/dashboard")
      }
    } catch (error) {
      // If token verification fails, redirect to login
      redirect("/login")
    }
  } else {
    // No token, redirect to login
    redirect("/login")
  }
}
