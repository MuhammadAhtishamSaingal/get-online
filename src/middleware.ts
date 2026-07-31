import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "gizmogrid-super-secret-key-987654321"
);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect admin routes
  if (pathname.startsWith("/admin")) {
    // Exclude login page from interception
    if (pathname === "/admin/login") {
      return NextResponse.next();
    }

    const token = request.cookies.get("gizmogrid_admin_token")?.value;

    if (!token) {
      const loginUrl = new URL("/admin/login", request.url);
      return NextResponse.redirect(loginUrl);
    }

    try {
      // Verify JWT in Edge environment
      await jwtVerify(token, JWT_SECRET);
      return NextResponse.next();
    } catch {
      const loginUrl = new URL("/admin/login", request.url);
      const response = NextResponse.redirect(loginUrl);
      response.cookies.delete("gizmogrid_admin_token");
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
