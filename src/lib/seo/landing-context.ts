import { prisma } from "@/lib/prisma";
import { getPublicOrganizationId } from "@/lib/tenant-context";

const DEFAULT_TAGLINE =
  "Imóveis para venda e aluguel com atendimento especializado de corretores.";

export type TenantLandingContext = {
  variant: "tenant";
  siteName: string;
  tagline: string;
  captureTitle: string;
  slug: string;
  propertyCount: number;
};

export type SaasLandingContext = {
  variant: "saas";
};

export type LandingContext = TenantLandingContext | SaasLandingContext;

export async function getLandingContext(): Promise<LandingContext> {
  const organizationId = await getPublicOrganizationId();

  if (!organizationId) {
    return { variant: "saas" };
  }

  const org = await prisma.organization.findFirst({
    where: { id: organizationId, isActive: true },
    include: {
      systemConfig: true,
      _count: {
        select: {
          properties: {
            where: { isPublished: true, status: "DISPONIVEL" },
          },
        },
      },
    },
  });

  if (!org) {
    return { variant: "saas" };
  }

  return {
    variant: "tenant",
    siteName: org.systemConfig?.companyName ?? org.name,
    tagline: org.systemConfig?.tagline ?? DEFAULT_TAGLINE,
    captureTitle: org.systemConfig?.capturePageTitle ?? "Encontre seu imóvel ideal",
    slug: org.slug,
    propertyCount: org._count.properties,
  };
}
