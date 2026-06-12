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
      const isAuthPage =
        pathname.startsWith("/login") ||
        pathname.startsWith("/recuperar-senha") ||
        pathname.startsWith("/redefinir-senha");
      const isPublicPage =
        pathname.startsWith("/captura") ||
        pathname.startsWith("/vitrine") ||
        pathname.startsWith("/privacidade");

      if (isPublicPage) return true;
      if (isAuthPage) return !isLoggedIn || Response.redirect(new URL("/dashboard", request.url));
      if (!isLoggedIn) return false;
      return true;
    },
    jwt({ token, user }) {
      if (user?.id) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as Role;
      }
      return session;
    },
  },
  providers: [],
};
