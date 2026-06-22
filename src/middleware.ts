import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { applySecurityHeaders, rateLimitRoute } from "@/lib/security";
import { extractTenantSlugFromHost } from "@/lib/organization";

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

  if (pathname.startsWith("/vitrine") || pathname === "/") {
    const limited = rateLimitRoute(
      request,
      pathname === "/" ? "landing-page" : "vitrine-page",
      pathname === "/" ? 40 : 60,
      60_000,
    );
    if (limited) return applySecurityHeaders(limited);
  }

  const token = await getToken({
    req: request,
    secret: process.env.AUTH_SECRET,
  });

  const isLoggedIn = !!token;
  const role = token?.role as string | undefined;

  const publicRoutes = ["/captura", "/vitrine", "/privacidade"];
  const authRoutes = ["/login", "/recuperar-senha", "/redefinir-senha", "/cadastro"];

  let response: NextResponse;

  if (publicRoutes.some((r) => pathname.startsWith(r))) {
    response = NextResponse.next();
  } else if (pathname === "/") {
    if (isLoggedIn) {
      const url = request.nextUrl.clone();
      url.pathname = role === "SUPER_ADMIN" ? "/super-admin" : "/dashboard";
      response = NextResponse.redirect(url);
    } else {
      response = NextResponse.next();
    }
  } else if (authRoutes.some((r) => pathname.startsWith(r))) {
    if (isLoggedIn) {
      const url = request.nextUrl.clone();
      url.pathname = role === "SUPER_ADMIN" ? "/super-admin" : "/dashboard";
      response = NextResponse.redirect(url);
    } else {
      response = NextResponse.next();
    }
  } else if (pathname.startsWith("/super-admin")) {
    if (!isLoggedIn) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("callbackUrl", pathname);
      response = NextResponse.redirect(url);
    } else if (role !== "SUPER_ADMIN") {
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
  } else if (role === "SUPER_ADMIN") {
    const url = request.nextUrl.clone();
    url.pathname = "/super-admin";
    response = NextResponse.redirect(url);
  } else {
    response = NextResponse.next();
  }

  const tenantSlug = extractTenantSlugFromHost(request.headers.get("host") ?? "");
  if (tenantSlug) {
    response.cookies.set("tenant_slug", tenantSlug, {
      path: "/",
      sameSite: "lax",
      httpOnly: true,
    });
  }

  return applySecurityHeaders(response);
}

export const config = {
  matcher: ["/((?!api/auth|api/webhooks|api/public|api/cron|_next/static|_next/image|favicon.ico).*)"],
};
