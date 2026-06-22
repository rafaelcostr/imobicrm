import type { NextAuthConfig } from "next-auth";
import type { Role } from "@prisma/client";

export const authConfig: NextAuthConfig = {
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 8,
  },
  callbacks: {
    authorized({ auth, request }) {
      const isLoggedIn = !!auth?.user;
      const { pathname } = request.nextUrl;
      const role = auth?.user?.role as Role | undefined;

      const isAuthPage =
        pathname.startsWith("/login") ||
        pathname.startsWith("/recuperar-senha") ||
        pathname.startsWith("/redefinir-senha") ||
        pathname.startsWith("/cadastro");
      const isPublicPage =
        pathname.startsWith("/captura") ||
        pathname.startsWith("/vitrine") ||
        pathname.startsWith("/privacidade");

      if (isPublicPage || pathname.startsWith("/cadastro")) return true;

      if (pathname.startsWith("/super-admin")) {
        if (!isLoggedIn) return false;
        return role === "SUPER_ADMIN";
      }

      if (isAuthPage) {
        if (!isLoggedIn) return true;
        const target = role === "SUPER_ADMIN" ? "/super-admin" : "/dashboard";
        return Response.redirect(new URL(target, request.url));
      }

      if (!isLoggedIn) return false;

      if (role === "SUPER_ADMIN") {
        return Response.redirect(new URL("/super-admin", request.url));
      }

      return true;
    },
    jwt({ token, user }) {
      if (user?.id) {
        token.id = user.id;
        token.role = user.role;
        token.organizationId = user.organizationId ?? null;
        token.organizationSlug = user.organizationSlug ?? null;
        token.organizationName = user.organizationName ?? null;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as Role;
        session.user.organizationId = (token.organizationId as string | null) ?? null;
        session.user.organizationSlug = (token.organizationSlug as string | null) ?? null;
        session.user.organizationName = (token.organizationName as string | null) ?? null;
      }
      return session;
    },
  },
  providers: [],
};
