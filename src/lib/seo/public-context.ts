import { prisma } from "@/lib/prisma";
import { BRAND } from "@/lib/brand";
import { getDefaultOrganizationId, getPublicOrganizationId } from "@/lib/tenant-context";

const DEFAULT_TAGLINE =
  "Imóveis para venda e aluguel com atendimento especializado de corretores.";

export type PublicSeoContext = {
  siteName: string;
  tagline: string;
  captureTitle: string;
  organizationId: string | null;
};

export async function getPublicSeoContext(): Promise<PublicSeoContext> {
  let organizationId = await getPublicOrganizationId();
  if (!organizationId) {
    organizationId = await getDefaultOrganizationId();
  }

  if (!organizationId) {
    return {
      siteName: BRAND.product,
      tagline: DEFAULT_TAGLINE,
      captureTitle: "Encontre seu imóvel ideal",
      organizationId: null,
    };
  }

  const org = await prisma.organization.findUnique({
    where: { id: organizationId },
    include: { systemConfig: true },
  });

  const siteName = org?.systemConfig?.companyName ?? org?.name ?? BRAND.product;
  const tagline = org?.systemConfig?.tagline ?? DEFAULT_TAGLINE;
  const captureTitle =
    org?.systemConfig?.capturePageTitle ?? "Encontre seu imóvel ideal";

  return { siteName, tagline, captureTitle, organizationId };
}
