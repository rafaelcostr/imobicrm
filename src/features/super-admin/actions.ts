"use server";

import { revalidatePath } from "next/cache";
import { Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { PLAN_DEFAULTS, ORGANIZATION_PLAN_LABELS, slugifyOrganization } from "@/lib/organization";

export async function getSuperAdminOverview() {
  const user = await requireAuth();
  if (user.role !== "SUPER_ADMIN") throw new Error("Acesso negado");

  const organizations = await prisma.organization.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { users: true, leads: true, properties: true } },
    },
  });

  return organizations;
}

export async function toggleOrganizationActive(id: string, isActive: boolean) {
  const user = await requireAuth();
  if (user.role !== "SUPER_ADMIN") throw new Error("Acesso negado");

  await prisma.organization.update({
    where: { id },
    data: { isActive },
  });

  revalidatePath("/super-admin");
}

export async function updateOrganizationPlan(
  id: string,
  plan: keyof typeof PLAN_DEFAULTS,
) {
  const user = await requireAuth();
  if (user.role !== "SUPER_ADMIN") throw new Error("Acesso negado");

  const limits = PLAN_DEFAULTS[plan];

  await prisma.organization.update({
    where: { id },
    data: {
      plan,
      maxUsers: limits.maxUsers,
      maxLeads: limits.maxLeads,
      maxProperties: limits.maxProperties,
      trialEndsAt: plan === "TRIAL" ? new Date(Date.now() + 14 * 86400000) : null,
    },
  });

  revalidatePath("/super-admin");
}

export async function createOrganizationByAdmin(data: {
  name: string;
  slug?: string;
  plan?: keyof typeof PLAN_DEFAULTS;
}) {
  const user = await requireAuth();
  if (user.role !== "SUPER_ADMIN") throw new Error("Acesso negado");

  const slug = slugifyOrganization(data.slug ?? data.name);
  if (!slug) throw new Error("Slug inválido");

  const exists = await prisma.organization.findUnique({ where: { slug } });
  if (exists) throw new Error("Slug já existe");

  const plan = data.plan ?? "STARTER";
  const limits = PLAN_DEFAULTS[plan];

  const org = await prisma.organization.create({
    data: {
      name: data.name,
      slug,
      plan,
      maxUsers: limits.maxUsers,
      maxLeads: limits.maxLeads,
      maxProperties: limits.maxProperties,
    },
  });

  await prisma.systemConfig.create({
    data: { organizationId: org.id, companyName: data.name },
  });

  revalidatePath("/super-admin");
  return org;
}

export { ORGANIZATION_PLAN_LABELS };
