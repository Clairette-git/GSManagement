import { NextResponse, type NextRequest } from 'next/server';
import { ResponseCookies, RequestCookies } from 'next/dist/server/web/spec-extension/cookies';

function applySetCookie(req: NextRequest, res: NextResponse): void {

  const setCookies = new ResponseCookies(res.headers);
  const newReqHeaders = new Headers(req.headers);
  const newReqCookies = new RequestCookies(newReqHeaders);
  setCookies.getAll().forEach((cookie) => newReqCookies.set(cookie));
  
  // Update the request headers in the response
  NextResponse.next({
    request: { headers: newReqHeaders },
  }).headers.forEach((value, key) => {
    if (key === 'x-middleware-override-headers' || key.startsWith('x-middleware-request-')) {
      res.headers.set(key, value);
    }
  });
}

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Your logic to set cookies, e.g., authentication token
  response.cookies.set('auth_token', 'your_token_value', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24, // 1 day
  });

  // Apply Set-Cookie headers to the request
  applySetCookie(request, response);

  return response;
}

// import { NextResponse } from "next/server"
// import type { NextRequest } from "next/server"
// import { verify } from "jsonwebtoken"

// // Paths that don't require authentication
// const publicPaths = ["/login", "/api/auth/login", "/api/auth/register", "/api/test-auth"]

// export function middleware(request: NextRequest) {
//   const { pathname } = request.nextUrl
//   console.log("Middleware checking path:", pathname)

//   // Check if the path is public
//   if (publicPaths.some((path) => pathname.startsWith(path))) {
//     console.log("Public path, skipping auth check")
//     return NextResponse.next()
//   }

//   // Get the token from the cookies
//   const token = request.cookies.get("auth_token")?.value
//   console.log("Auth token in middleware:", token ? "Found" : "Not found")

//   // If there's no token, redirect to login
//   if (!token) {
//     console.log("No token, redirecting to login")
//     const url = request.nextUrl.clone()
//     url.pathname = "/login"
//     return NextResponse.redirect(url)
//   }

//   try {
//     // Verify the token
//     const jwtSecret = process.env.JWT_SECRET || "your-secret-key"

//     const decoded = verify(token, jwtSecret)
//     console.log("Token verified successfully")
//     return NextResponse.next()
//   } catch (error) {
//     // If token is invalid, redirect to login
//     console.error("Token verification failed:", error)
//     const url = request.nextUrl.clone()
//     url.pathname = "/login"
//     return NextResponse.redirect(url)
//   }
// }

// export const config = {
//   matcher: [
//     /*
//      * Match all request paths except:
//      * - _next/static (static files)
//      * - _next/image (image optimization files)
//      * - favicon.ico (favicon file)
//      * - public folder
//      */
//     "/((?!_next/static|_next/image|favicon.ico|public).*)",
//   ],
// }

