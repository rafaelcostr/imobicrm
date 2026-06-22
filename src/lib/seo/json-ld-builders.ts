import { PROPERTY_PURPOSE_LABELS, PROPERTY_TYPE_LABELS } from "@/lib/labels";
import { BRAND } from "@/lib/brand";
import { absoluteUrl } from "@/lib/metadata";

type PublicProperty = {
  code: string;
  title: string;
  description: string | null;
  type: keyof typeof PROPERTY_TYPE_LABELS;
  purpose: keyof typeof PROPERTY_PURPOSE_LABELS;
  price: { toString(): string } | number;
  neighborhood: string | null;
  city: string;
  state: string;
  bedrooms: number;
  bathrooms: number;
  garages: number;
  builtArea: { toString(): string } | number | null;
  totalArea: { toString(): string } | number | null;
  media: Array<{ url: string }>;
};

export function buildSoftwareApplicationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: BRAND.product,
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "BRL",
      description: "Trial gratuito de 14 dias",
    },
    description:
      `${BRAND.product} — CRM imobiliário na plataforma ${BRAND.platform}. Leads, funil, vitrine, comissões e relatórios.`,
    url: absoluteUrl("/"),
  };
}

export function buildRealEstateAgentJsonLd(siteName: string, tagline: string) {
  return {
    "@context": "https://schema.org",
    "@type": "RealEstateAgent",
    name: siteName,
    description: tagline,
    url: absoluteUrl("/"),
  };
}

export function buildWebSiteJsonLd(siteName: string, description: string) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteName,
    description,
    url: absoluteUrl("/vitrine"),
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${absoluteUrl("/vitrine")}?search={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export function buildItemListJsonLd(
  items: Array<{ code: string; title: string }>,
  listName: string,
) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: listName,
    numberOfItems: items.length,
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.title,
      url: absoluteUrl(`/vitrine/${item.code}`),
    })),
  };
}

export function buildBreadcrumbJsonLd(items: Array<{ name: string; path?: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      ...(item.path ? { item: absoluteUrl(item.path) } : {}),
    })),
  };
}

export function buildRealEstateListingJsonLd(
  property: PublicProperty,
  siteName: string,
) {
  const cover = property.media[0]?.url;
  const area =
    property.builtArea != null
      ? Number(property.builtArea)
      : property.totalArea != null
        ? Number(property.totalArea)
        : undefined;

  return {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    name: property.title,
    description:
      property.description ??
      `${PROPERTY_TYPE_LABELS[property.type]} para ${PROPERTY_PURPOSE_LABELS[property.purpose].toLowerCase()} em ${property.city}/${property.state}.`,
    url: absoluteUrl(`/vitrine/${property.code}`),
    ...(cover ? { image: [cover] } : {}),
    offers: {
      "@type": "Offer",
      price: Number(property.price),
      priceCurrency: "BRL",
      availability: "https://schema.org/InStock",
    },
    address: {
      "@type": "PostalAddress",
      addressLocality: property.city,
      addressRegion: property.state,
      addressCountry: "BR",
      ...(property.neighborhood ? { addressNeighborhood: property.neighborhood } : {}),
    },
    numberOfRooms: property.bedrooms,
    numberOfBathroomsTotal: property.bathrooms,
    ...(area ? { floorSize: { "@type": "QuantitativeValue", value: area, unitCode: "MTK" } } : {}),
    provider: {
      "@type": "RealEstateAgent",
      name: siteName,
    },
  };
}

export function buildContactPageJsonLd(siteName: string, description: string) {
  return {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    name: `Contato — ${siteName}`,
    description,
    url: absoluteUrl("/captura"),
    isPartOf: {
      "@type": "WebSite",
      name: siteName,
      url: absoluteUrl("/vitrine"),
    },
  };
}
