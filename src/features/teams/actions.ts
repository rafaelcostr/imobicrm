"use server";

import { revalidatePath } from "next/cache";
import { Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { requirePermission } from "@/lib/permissions";
import { requireOrganizationId } from "@/lib/organization";
import { sanitizeString } from "@/lib/utils";
import { teamSchema } from "@/lib/validations/schemas";
import type { z } from "zod";

export async function getTeams() {
  const user = await requireAuth();
  requirePermission(user.role as Role, "teams:manage");

  const organizationId = requireOrganizationId(user);

  return prisma.team.findMany({
    where: { organizationId },
    include: {
      _count: { select: { users: true, leads: true } },
      users: {
        select: { id: true, name: true, role: true, isActive: true },
        orderBy: { name: "asc" },
      },
    },
    orderBy: { name: "asc" },
  });
}

export async function getTeamOptions() {
  const user = await requireAuth();
  requirePermission(user.role as Role, "settings:view");

  const organizationId = requireOrganizationId(user);

  return prisma.team.findMany({
    where: { organizationId },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });
}

export async function createTeam(data: z.infer<typeof teamSchema>) {
  const user = await requireAuth();
  requirePermission(user.role as Role, "teams:manage");

  const organizationId = requireOrganizationId(user);

  const parsed = teamSchema.parse(data);

  const team = await prisma.team.create({
    data: { organizationId, name: sanitizeString(parsed.name, 100) },
  });

  revalidatePath("/configuracoes/equipes");
  return team;
}

export async function updateTeam(id: string, data: z.infer<typeof teamSchema>) {
  const user = await requireAuth();
  requirePermission(user.role as Role, "teams:manage");

  const parsed = teamSchema.parse(data);

  const team = await prisma.team.update({
    where: { id },
    data: { name: sanitizeString(parsed.name, 100) },
  });

  revalidatePath("/configuracoes/equipes");
  return team;
}

export async function deleteTeam(id: string) {
  const user = await requireAuth();
  requirePermission(user.role as Role, "teams:manage");

  const members = await prisma.user.count({ where: { teamId: id } });
  if (members > 0) {
    throw new Error("Remova ou realoque os membros antes de excluir a equipe");
  }

  await prisma.team.delete({ where: { id } });
  revalidatePath("/configuracoes/equipes");
}

export async function assignUserToTeam(userId: string, teamId: string | null) {
  const user = await requireAuth();
  requirePermission(user.role as Role, "teams:manage");

  await prisma.user.update({
    where: { id: userId },
    data: { teamId },
  });

  revalidatePath("/configuracoes/equipes");
  revalidatePath("/configuracoes/usuarios");
}
