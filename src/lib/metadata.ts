import type { Metadata } from "next";
import { BRAND, BRAND_DESCRIPTION } from "@/lib/brand";

export function getMetadataBase(): URL {
  const explicit = process.env.NEXT_PUBLIC_APP_URL;
  if (explicit) return new URL(explicit);

  const vercel = process.env.VERCEL_URL;
  if (vercel) return new URL(`https://${vercel}`);

  return new URL("http://localhost:3000");
}

export function absoluteUrl(path: string): string {
  return new URL(path.startsWith("/") ? path : `/${path}`, getMetadataBase()).toString();
}

function buildOpenGraph(
  title: string,
  description: string,
  path = "/",
  options?: { image?: string; type?: "website" | "article" },
): NonNullable<Metadata["openGraph"]> {
  const url = absoluteUrl(path);
  return {
    title,
    description,
    siteName: BRAND.product,
    locale: "pt_BR",
    type: options?.type ?? "website",
    url,
    ...(options?.image
      ? { images: [{ url: options.image, alt: title, width: 1200, height: 630 }] }
      : {}),
  };
}

function buildTwitter(
  title: string,
  description: string,
  image?: string,
): NonNullable<Metadata["twitter"]> {
  return {
    card: "summary_large_image",
    title,
    description,
    ...(image ? { images: [image] } : {}),
  };
}

const DEFAULT_TITLE = `${BRAND.product} — ${BRAND.platform}`;

export const rootMetadata: Metadata = {
  metadataBase: getMetadataBase(),
  title: {
    default: DEFAULT_TITLE,
    template: `%s | ${BRAND.product}`,
  },
  description: BRAND_DESCRIPTION,
  keywords: [
    BRAND.company,
    BRAND.platform,
    BRAND.product,
    "CRM imobiliário",
    "corretor de imóveis",
    "gestão de leads",
  ],
  robots: { index: false, follow: false },
  openGraph: buildOpenGraph(DEFAULT_TITLE, BRAND_DESCRIPTION),
  twitter: buildTwitter(DEFAULT_TITLE, BRAND_DESCRIPTION),
  alternates: { canonical: absoluteUrl("/") },
};

export function pageMetadata(title: string, description?: string): Metadata {
  const desc = description ?? BRAND_DESCRIPTION;
  const ogTitle = `${title} | ${BRAND.product}`;
  return {
    title,
    description: desc,
    robots: { index: false, follow: false, nocache: true },
    openGraph: buildOpenGraph(ogTitle, desc),
    twitter: buildTwitter(ogTitle, desc),
  };
}

export type PublicMetadataOptions = {
  siteName?: string;
  image?: string;
  type?: "website" | "article";
  noIndex?: boolean;
};

export function publicPageMetadata(
  title: string,
  description: string,
  path: string,
  options?: PublicMetadataOptions,
): Metadata {
  const canonical = absoluteUrl(path);
  const ogTitle = options?.siteName ? `${title} | ${options.siteName}` : title;

  return {
    title,
    description,
    alternates: { canonical },
    robots: options?.noIndex
      ? { index: false, follow: false }
      : {
          index: true,
          follow: true,
          googleBot: { index: true, follow: true, "max-image-preview": "large" },
        },
    openGraph: buildOpenGraph(ogTitle, description, path, {
      image: options?.image,
      type: options?.type,
    }),
    twitter: buildTwitter(ogTitle, description, options?.image),
  };
}

/** @deprecated use BRAND.product from @/lib/brand */
export const SITE_NAME = BRAND.product;
