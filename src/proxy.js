import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";

export async function proxy(req) {
  const { pathname } = req.nextUrl;

  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const isAuthPage = pathname.startsWith("/login");
  const isEmployeeRoute = pathname.startsWith("/employee");
  const isAdminRoute = pathname.startsWith("/admin");

  // If user is logged in and visits /login, redirect to their role dashboard
  if (isAuthPage && token) {
    if (token.role === "admin") {
      return NextResponse.redirect(new URL("/admin/dashboard", req.url));
    }
    return NextResponse.redirect(new URL("/employee/dashboard", req.url));
  }

  // Protect employee routes: requires authentication
  if (isEmployeeRoute) {
    if (!token) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Protect admin routes: requires authentication AND admin role
  if (isAdminRoute) {
    if (!token) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (token.role !== "admin") {
      // Forbidden: redirect employee to their own dashboard
      return NextResponse.redirect(new URL("/employee/dashboard", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/employee/:path*",
    "/login",
  ],
};
