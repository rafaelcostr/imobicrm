"use server";

import { randomBytes } from "crypto";
import { revalidatePath } from "next/cache";
import { hash } from "bcryptjs";
import { Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { requirePermission } from "@/lib/permissions";
import { requireOrganizationId, assertOrganizationLimit } from "@/lib/organization";
import { sanitizeString } from "@/lib/utils";
import { userCreateSchema, userUpdateSchema } from "@/lib/validations/schemas";
import { generateSecureToken, hashToken } from "@/lib/tokens";
import { isEmailConfigured, sendUserInviteEmail } from "@/lib/email";
import type { z } from "zod";

export async function getUsers() {
  const user = await requireAuth();
  requirePermission(user.role as Role, "users:manage");

  const organizationId = requireOrganizationId(user);

  return prisma.user.findMany({
    where: { organizationId },
    include: {
      team: { select: { id: true, name: true } },
      _count: { select: { leads: true } },
    },
    orderBy: [{ isActive: "desc" }, { name: "asc" }],
  });
}

export async function getUserById(id: string) {
  const user = await requireAuth();
  requirePermission(user.role as Role, "users:manage");

  const organizationId = requireOrganizationId(user);

  const found = await prisma.user.findFirst({
    where: { id, organizationId },
    include: { team: { select: { id: true, name: true } } },
  });
  return found;
}

export async function createUser(data: z.infer<typeof userCreateSchema>) {
  const current = await requireAuth();
  requirePermission(current.role as Role, "users:manage");

  const organizationId = requireOrganizationId(current);
  await assertOrganizationLimit(organizationId, "users");

  const parsed = userCreateSchema.parse(data);
  const email = parsed.email.toLowerCase();

  const exists = await prisma.user.findFirst({
    where: { email, organizationId },
  });
  if (exists) throw new Error("E-mail já cadastrado");

  if (parsed.role === "ADMIN" && current.role !== "ADMIN") {
    throw new Error("Apenas administradores podem criar outros administradores");
  }

  const tempPassword = randomBytes(9).toString("base64url");
  const passwordHash = await hash(tempPassword, 12);

  const created = await prisma.user.create({
    data: {
      organizationId,
      name: sanitizeString(parsed.name, 120),
      email,
      passwordHash,
      role: parsed.role,
      phone: parsed.phone ? sanitizeString(parsed.phone, 20) : null,
      creci: parsed.creci ? sanitizeString(parsed.creci, 30) : null,
      teamId: parsed.teamId || null,
      monthlyGoal: parsed.monthlyGoal ?? null,
    },
  });

  const token = generateSecureToken();
  await prisma.passwordResetToken.create({
    data: {
      userId: created.id,
      token: hashToken(token),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const setupUrl = `${appUrl}/redefinir-senha?token=${token}`;

  if (isEmailConfigured()) {
    await sendUserInviteEmail(created.email, created.name, setupUrl);
  }

  revalidatePath("/configuracoes/usuarios");
  return {
    user: created,
    setupUrl: isEmailConfigured() ? undefined : setupUrl,
    tempPassword: isEmailConfigured() ? undefined : tempPassword,
  };
}

export async function updateUser(id: string, data: z.infer<typeof userUpdateSchema>) {
  const current = await requireAuth();
  requirePermission(current.role as Role, "users:manage");

  const organizationId = requireOrganizationId(current);

  const existing = await prisma.user.findFirst({
    where: { id, organizationId },
  });
  if (!existing) throw new Error("Usuário não encontrado");

  const parsed = userUpdateSchema.parse(data);

  if (parsed.role === "ADMIN" && current.role !== "ADMIN") {
    throw new Error("Apenas administradores podem promover administradores");
  }

  if (parsed.email) {
    const email = parsed.email.toLowerCase();
    const conflict = await prisma.user.findFirst({
      where: { email, organizationId, NOT: { id } },
    });
    if (conflict) throw new Error("E-mail já em uso");
  }

  if (id === current.id && parsed.isActive === false) {
    throw new Error("Você não pode desativar sua própria conta");
  }

  const updated = await prisma.user.update({
    where: { id },
    data: {
      ...(parsed.name && { name: sanitizeString(parsed.name, 120) }),
      ...(parsed.email && { email: parsed.email.toLowerCase() }),
      ...(parsed.role && { role: parsed.role }),
      ...(parsed.phone !== undefined && {
        phone: parsed.phone ? sanitizeString(parsed.phone, 20) : null,
      }),
      ...(parsed.creci !== undefined && {
        creci: parsed.creci ? sanitizeString(parsed.creci, 30) : null,
      }),
      ...(parsed.teamId !== undefined && { teamId: parsed.teamId || null }),
      ...(parsed.monthlyGoal !== undefined && { monthlyGoal: parsed.monthlyGoal ?? null }),
      ...(parsed.isActive !== undefined && { isActive: parsed.isActive }),
      ...(parsed.replyToEmail !== undefined && {
        replyToEmail: parsed.replyToEmail ? parsed.replyToEmail.toLowerCase() : null,
      }),
      ...(parsed.emailSignature !== undefined && {
        emailSignature: parsed.emailSignature
          ? sanitizeString(parsed.emailSignature, 500)
          : null,
      }),
    },
  });

  revalidatePath("/configuracoes/usuarios");
  revalidatePath(`/configuracoes/usuarios/${id}/editar`);
  return updated;
}

export async function toggleUserActive(id: string) {
  const current = await requireAuth();
  requirePermission(current.role as Role, "users:manage");

  if (id === current.id) throw new Error("Você não pode desativar sua própria conta");

  const organizationId = requireOrganizationId(current);

  const user = await prisma.user.findFirst({ where: { id, organizationId } });
  if (!user) throw new Error("Usuário não encontrado");

  await prisma.user.update({
    where: { id },
    data: { isActive: !user.isActive },
  });

  revalidatePath("/configuracoes/usuarios");
}
