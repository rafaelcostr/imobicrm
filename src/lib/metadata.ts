import type { Metadata } from "next";

const SITE_NAME = "ImobiCRM";
const DEFAULT_DESCRIPTION =
  "Plataforma SaaS de gestão imobiliária para corretores e imobiliárias. Leads, funil de vendas, imóveis, comissões e relatórios em um só lugar.";

export function getMetadataBase(): URL {
  const explicit = process.env.NEXT_PUBLIC_APP_URL;
  if (explicit) return new URL(explicit);

  const vercel = process.env.VERCEL_URL;
  if (vercel) return new URL(`https://${vercel}`);

  return new URL("http://localhost:3000");
}

function buildOpenGraph(
  title: string,
  description: string,
  path = "/",
): NonNullable<Metadata["openGraph"]> {
  const base = getMetadataBase();
  return {
    title,
    description,
    siteName: SITE_NAME,
    locale: "pt_BR",
    type: "website",
    url: new URL(path, base).toString(),
  };
}

function buildTwitter(title: string, description: string): NonNullable<Metadata["twitter"]> {
  return {
    card: "summary_large_image",
    title,
    description,
  };
}

export const rootMetadata: Metadata = {
  metadataBase: getMetadataBase(),
  title: {
    default: `${SITE_NAME} — CRM Imobiliário`,
    template: `%s | ${SITE_NAME}`,
  },
  description: DEFAULT_DESCRIPTION,
  keywords: ["CRM imobiliário", "corretor de imóveis", "gestão de leads", SITE_NAME],
  robots: { index: false, follow: false },
  openGraph: buildOpenGraph(`${SITE_NAME} — CRM Imobiliário`, DEFAULT_DESCRIPTION),
  twitter: buildTwitter(`${SITE_NAME} — CRM Imobiliário`, DEFAULT_DESCRIPTION),
};

export function pageMetadata(title: string, description?: string): Metadata {
  const desc = description ?? DEFAULT_DESCRIPTION;
  return {
    title,
    description: desc,
    openGraph: buildOpenGraph(`${title} | ${SITE_NAME}`, desc),
    twitter: buildTwitter(`${title} | ${SITE_NAME}`, desc),
  };
}

export function publicPageMetadata(
  title: string,
  description: string,
  path: string,
): Metadata {
  return {
    title,
    description,
    robots: { index: true, follow: true },
    openGraph: buildOpenGraph(title, description, path),
    twitter: buildTwitter(title, description),
  };
}
