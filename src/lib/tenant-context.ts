import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { extractTenantSlugFromHost, getOrganizationBySlug } from "@/lib/organization";

export async function getPublicOrganizationId(): Promise<string | null> {
  const cookieStore = await cookies();
  const slug = cookieStore.get("tenant_slug")?.value;
  if (!slug) return null;

  const org = await getOrganizationBySlug(slug);
  return org?.id ?? null;
}

export async function resolveOrganizationIdFromRequest(options?: {
  slug?: string | null;
  organizationId?: string | null;
}): Promise<string | null> {
  if (options?.organizationId) return options.organizationId;
  if (options?.slug) {
    const org = await getOrganizationBySlug(options.slug);
    return org?.id ?? null;
  }
  return getPublicOrganizationId();
}

export function resolveSlugFromHost(host: string | null): string | null {
  if (!host) return null;
  return extractTenantSlugFromHost(host);
}

export async function getDefaultOrganizationId(): Promise<string | null> {
  const org = await prisma.organization.findFirst({
    where: { isActive: true },
    orderBy: { createdAt: "asc" },
    select: { id: true },
  });
  return org?.id ?? null;
}
