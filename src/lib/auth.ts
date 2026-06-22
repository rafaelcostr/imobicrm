import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { authConfig } from "@/lib/auth.config";
import { loginSchema } from "@/lib/validations/schemas";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  secret: process.env.AUTH_SECRET,
  trustHost: true,
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "E-mail", type: "email" },
        password: { label: "Senha", type: "password" },
        organizationSlug: { label: "Organização", type: "text" },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const email = parsed.data.email.toLowerCase();
        const organizationSlug = parsed.data.organizationSlug?.trim();

        let user = null;

        if (organizationSlug) {
          const org = await prisma.organization.findFirst({
            where: { slug: organizationSlug, isActive: true },
          });

          if (org) {
            user = await prisma.user.findFirst({
              where: { email, organizationId: org.id },
              include: { organization: { select: { slug: true, name: true } } },
            });
          }
        }

        if (!user) {
          user = await prisma.user.findFirst({
            where: { email, role: "SUPER_ADMIN" },
            include: { organization: { select: { slug: true, name: true } } },
          });
        }

        if (!user) {
          user = await prisma.user.findFirst({
            where: { email },
            include: { organization: { select: { slug: true, name: true } } },
          });
        }

        if (!user || !user.isActive) return null;

        const valid = await compare(parsed.data.password, user.passwordHash);
        if (!valid) return null;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          organizationId: user.organizationId,
          organizationSlug: user.organization?.slug ?? null,
          organizationName: user.organization?.name ?? null,
        };
      },
    }),
  ],
});

export async function getSessionUser() {
  const session = await auth();
  if (!session?.user?.id) return null;
  return session.user;
}

export async function requireAuth() {
  const user = await getSessionUser();
  if (!user) {
    throw new Error("Não autenticado");
  }
  return user;
}
