import { CaptureForm } from "@/features/captura/components/capture-form";
import { getPublicPropertyByCode } from "@/features/vitrine/actions";
import { JsonLd } from "@/components/seo/json-ld";
import { buildContactPageJsonLd } from "@/lib/seo/json-ld-builders";
import { getPublicSeoContext } from "@/lib/seo/public-context";
import { publicPageMetadata } from "@/lib/metadata";
import type { Metadata } from "next";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ imovel?: string }>;
}): Promise<Metadata> {
  const { imovel } = await searchParams;
  const ctx = await getPublicSeoContext();

  if (imovel) {
    const property = await getPublicPropertyByCode(imovel, ctx.organizationId ?? undefined);
    if (property) {
      return publicPageMetadata(
        `Interesse em ${property.title}`,
        `Solicite informações sobre ${property.title} em ${property.city}/${property.state}. Um corretor da ${ctx.siteName} entrará em contato.`,
        `/captura?imovel=${encodeURIComponent(property.code)}`,
        { siteName: ctx.siteName },
      );
    }
  }

  const description = `${ctx.tagline} Cadastre seu interesse e receba atendimento de um corretor especializado.`;
  return publicPageMetadata(ctx.captureTitle, description, "/captura", {
    siteName: ctx.siteName,
  });
}

export default async function CapturaPage({
  searchParams,
}: {
  searchParams: Promise<{ imovel?: string }>;
}) {
  const { imovel } = await searchParams;
  const ctx = await getPublicSeoContext();
  const property = imovel
    ? await getPublicPropertyByCode(imovel, ctx.organizationId ?? undefined)
    : null;

  const description = property
    ? `Solicite informações sobre ${property.title} (${property.code}).`
    : `${ctx.tagline} Cadastre seu interesse e receba atendimento personalizado.`;

  return (
    <>
      <JsonLd data={buildContactPageJsonLd(ctx.siteName, description)} />

      <section aria-labelledby="captura-heading">
        <CaptureForm
          propertyCode={property?.code}
          propertyTitle={property?.title}
          defaultInterest={
            property ? `${property.title} (${property.code})` : undefined
          }
          pageTitle={property ? undefined : ctx.captureTitle}
        />
      </section>
    </>
  );
}
