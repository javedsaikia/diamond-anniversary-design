import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { verifyJWT } from "./lib/auth"

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Public routes that don't require authentication
  const publicRoutes = ["/", "/events", "/register-user", "/register/1", "/register/2", "/register/3", "/register/4"]

  // Admin routes that require admin authentication
  const adminRoutes = ["/admin"]

  // User routes that require user authentication (users and admins can access)
  const userRoutes = ["/profile", "/register"]

  const registrationRoutes = ["/register/"]

  // Allow public routes
  if (publicRoutes.includes(pathname)) {
    return NextResponse.next()
  }

  // Get auth token from cookies
  const token = request.cookies.get("auth-token")?.value

  if (!token) {
    const loginUrl = new URL("/", request.url)
    loginUrl.searchParams.set("returnUrl", pathname)
    return NextResponse.redirect(loginUrl)
  }

  try {
    const payload = await verifyJWT(token)

    if (!payload) {
      const loginUrl = new URL("/", request.url)
      loginUrl.searchParams.set("returnUrl", pathname)
      return NextResponse.redirect(loginUrl)
    }

    if (adminRoutes.some((route) => pathname.startsWith(route))) {
      if (payload.role !== "admin") {
        const eventsUrl = new URL("/events", request.url)
        eventsUrl.searchParams.set("error", "admin_access_required")
        return NextResponse.redirect(eventsUrl)
      }
    }

    if (
      userRoutes.some((route) => pathname.startsWith(route)) ||
      registrationRoutes.some((route) => pathname.startsWith(route))
    ) {
      if (payload.role !== "user" && payload.role !== "admin") {
        const loginUrl = new URL("/", request.url)
        loginUrl.searchParams.set("returnUrl", pathname)
        return NextResponse.redirect(loginUrl)
      }
    }

    const response = NextResponse.next()
    response.headers.set("X-User-Role", payload.role)
    response.headers.set("X-User-ID", payload.userId)
    return response
  } catch (error) {
    console.log("[v0] Middleware error, redirecting to login")
    const loginUrl = new URL("/", request.url)
    loginUrl.searchParams.set("returnUrl", pathname)
    return NextResponse.redirect(loginUrl)
  }
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|images).*)"],
}
