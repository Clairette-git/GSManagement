import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Paths that don't require authentication
const publicPaths = ["/login", "/api/auth/login", "/api/auth/register", "/api/test-auth", "/simple-login"]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  console.log("Middleware checking path:", pathname)

  // Check if the path is public
  if (publicPaths.some((path) => pathname.startsWith(path))) {
    console.log("Public path, skipping auth check")
    return NextResponse.next()
  }

  // Get the token from the cookies
  const token = request.cookies.get("auth_token")?.value
  console.log("Auth token in middleware:", token ? "Found" : "Not found")

  // If there's no token, redirect to login
  if (!token) {
    console.log("No token, redirecting to login")
    const url = request.nextUrl.clone()
    url.pathname = "/login"
    return NextResponse.redirect(url)
  }

  // Token exists, proceed without verification in middleware
  // Role-based access will be handled in the layout components
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|public).*)",
  ],
}
