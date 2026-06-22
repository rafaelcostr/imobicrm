import { OrganizationPlan, Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export const PLAN_DEFAULTS: Record<
  OrganizationPlan,
  { maxUsers: number; maxLeads: number; maxProperties: number; trialDays?: number }
> = {
  TRIAL: { maxUsers: 5, maxLeads: 500, maxProperties: 100, trialDays: 14 },
  STARTER: { maxUsers: 10, maxLeads: 2000, maxProperties: 300 },
  PRO: { maxUsers: 30, maxLeads: 10000, maxProperties: 1000 },
  ENTERPRISE: { maxUsers: 200, maxLeads: 100000, maxProperties: 10000 },
};

export type ScopedUser = {
  id: string;
  role: Role;
  organizationId?: string | null;
};

export function slugifyOrganization(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

export function extractTenantSlugFromHost(host: string): string | null {
  const hostname = host.split(":")[0].toLowerCase();
  if (hostname === "localhost" || hostname === "127.0.0.1") return null;

  const parts = hostname.split(".");
  if (parts.length < 2) return null;

  const slug = parts[0];
  if (!slug || slug === "www" || slug === "app") return null;
  return slug;
}

export function getOrgScope(user: ScopedUser): { organizationId: string } | Record<string, never> {
  if (user.role === "SUPER_ADMIN") return {};
  if (!user.organizationId) {
    throw new Error("Organização não definida para este usuário.");
  }
  return { organizationId: user.organizationId };
}

export function requireOrganizationId(user: ScopedUser): string {
  if (user.role === "SUPER_ADMIN") {
    throw new Error("Super-admin não possui organização de tenant.");
  }
  if (!user.organizationId) {
    throw new Error("Organização não definida.");
  }
  return user.organizationId;
}

export async function getOrganizationBySlug(slug: string) {
  return prisma.organization.findFirst({
    where: { slug, isActive: true },
  });
}

export async function assertOrganizationActive(organizationId: string) {
  const org = await prisma.organization.findUnique({ where: { id: organizationId } });
  if (!org || !org.isActive) {
    throw new Error("Organização inativa ou não encontrada.");
  }
  if (org.plan === "TRIAL" && org.trialEndsAt && org.trialEndsAt < new Date()) {
    throw new Error("Período de trial expirado. Entre em contato para upgrade.");
  }
  return org;
}

export async function assertOrganizationLimit(
  organizationId: string,
  resource: "users" | "leads" | "properties",
) {
  const org = await assertOrganizationActive(organizationId);

  const [users, leads, properties] = await Promise.all([
    prisma.user.count({ where: { organizationId, isActive: true } }),
    prisma.lead.count({ where: { organizationId } }),
    prisma.property.count({ where: { organizationId } }),
  ]);

  if (resource === "users" && users >= org.maxUsers) {
    throw new Error(`Limite de usuários do plano atingido (${org.maxUsers}).`);
  }
  if (resource === "leads" && leads >= org.maxLeads) {
    throw new Error(`Limite de leads do plano atingido (${org.maxLeads}).`);
  }
  if (resource === "properties" && properties >= org.maxProperties) {
    throw new Error(`Limite de imóveis do plano atingido (${org.maxProperties}).`);
  }
}

export const ORGANIZATION_PLAN_LABELS: Record<OrganizationPlan, string> = {
  TRIAL: "Trial",
  STARTER: "Starter",
  PRO: "Pro",
  ENTERPRISE: "Enterprise",
};
