import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { BRAND, BRAND_DESCRIPTION } from "@/lib/brand";
import { JsonLd } from "@/components/seo/json-ld";
import { SaasLanding } from "@/features/landing/components/saas-landing";
import { TenantLanding } from "@/features/landing/components/tenant-landing";
import { publicPageMetadata } from "@/lib/metadata";
import {
  buildRealEstateAgentJsonLd,
  buildSoftwareApplicationJsonLd,
  buildWebSiteJsonLd,
} from "@/lib/seo/json-ld-builders";
import { getLandingContext } from "@/lib/seo/landing-context";

const SAAS_TITLE = `${BRAND.products.imoveis} — CRM imobiliário na plataforma ${BRAND.platform}`;

export async function generateMetadata(): Promise<Metadata> {
  const ctx = await getLandingContext();

  if (ctx.variant === "tenant") {
    return publicPageMetadata(
      `${ctx.siteName} — Imóveis e atendimento`,
      `${ctx.tagline} Confira imóveis disponíveis ou fale com nossa equipe.`,
      "/",
      { siteName: ctx.siteName },
    );
  }

  return publicPageMetadata(SAAS_TITLE, BRAND_DESCRIPTION, "/");
}

export default async function HomePage() {
  const session = await auth();

  if (session?.user) {
    redirect(session.user.role === "SUPER_ADMIN" ? "/super-admin" : "/dashboard");
  }

  const ctx = await getLandingContext();

  if (ctx.variant === "tenant") {
    return (
      <>
        <JsonLd
          data={[
            buildRealEstateAgentJsonLd(ctx.siteName, ctx.tagline),
            buildWebSiteJsonLd(ctx.siteName, ctx.tagline),
          ]}
        />
        <TenantLanding ctx={ctx} />
      </>
    );
  }

  return (
    <>
      <JsonLd
        data={[
          buildSoftwareApplicationJsonLd(),
          buildWebSiteJsonLd(
            BRAND.products.imoveis,
            BRAND_DESCRIPTION,
          ),
        ]}
      />
      <SaasLanding />
    </>
  );
}
