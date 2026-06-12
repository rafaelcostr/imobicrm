import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { applySecurityHeaders, rateLimitRoute } from "@/lib/security";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/login") || pathname.startsWith("/recuperar-senha")) {
    const limited = rateLimitRoute(request, "auth-page", 30, 60_000);
    if (limited) return applySecurityHeaders(limited);
  }

  if (pathname.startsWith("/captura")) {
    const limited = rateLimitRoute(request, "captura-page", 20, 60_000);
    if (limited) return applySecurityHeaders(limited);
  }

  if (pathname.startsWith("/vitrine")) {
    const limited = rateLimitRoute(request, "vitrine-page", 60, 60_000);
    if (limited) return applySecurityHeaders(limited);
  }

  const token = await getToken({
    req: request,
    secret: process.env.AUTH_SECRET,
  });

  const isLoggedIn = !!token;

  const publicRoutes = ["/captura", "/vitrine", "/privacidade"];
  const authRoutes = ["/login", "/recuperar-senha", "/redefinir-senha"];

  let response: NextResponse;

  if (publicRoutes.some((r) => pathname.startsWith(r))) {
    response = NextResponse.next();
  } else if (pathname === "/") {
    const url = request.nextUrl.clone();
    url.pathname = isLoggedIn ? "/dashboard" : "/login";
    response = NextResponse.redirect(url);
  } else if (authRoutes.some((r) => pathname.startsWith(r))) {
    if (isLoggedIn) {
      const url = request.nextUrl.clone();
      url.pathname = "/dashboard";
      response = NextResponse.redirect(url);
    } else {
      response = NextResponse.next();
    }
  } else if (!isLoggedIn) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("callbackUrl", pathname);
    response = NextResponse.redirect(url);
  } else {
    response = NextResponse.next();
  }

  return applySecurityHeaders(response);
}

export const config = {
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico).*)"],
};
