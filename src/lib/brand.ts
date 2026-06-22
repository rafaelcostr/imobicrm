/** Identidade Syntra — empresa, plataforma e produtos. */
export const BRAND = {
  company: "Syntra",
  platform: "Syntra CRM",
  product: "Syntra Imóveis",
  products: {
    imoveis: "Syntra Imóveis",
    med: "Syntra Med",
    sales: "Syntra Sales",
    legal: "Syntra Legal",
  },
  /** Prefixo para arquivos exportados (relatórios, etc.) */
  filePrefix: "syntra-imoveis",
  /** ID do container do embed de captação */
  embedTargetId: "syntra-capture",
  /** Compatibilidade com embeds antigos */
  embedTargetIdLegacy: "imobicrm-capture",
  seedPassword: "Syntra@2026",
  seedEmailDomain: "syntra.app",
} as const;

export const BRAND_TAGLINE =
  "Plataforma Syntra CRM para o mercado imobiliário — leads, funil, vitrine e comissões.";

export const BRAND_DESCRIPTION =
  "Syntra Imóveis é o CRM imobiliário da plataforma Syntra CRM. Organize leads, funil de vendas, imóveis, comissões e relatórios em um só lugar.";

export const BRAND_PRODUCTS_LIST = [
  { key: "imoveis", name: BRAND.products.imoveis, emoji: "🏠", active: true },
  { key: "med", name: BRAND.products.med, emoji: "🏥", active: false },
  { key: "sales", name: BRAND.products.sales, emoji: "💼", active: false },
  { key: "legal", name: BRAND.products.legal, emoji: "⚖️", active: false },
] as const;

export function brandLogTag(): string {
  return `[${BRAND.product}]`;
}

export function exportFilename(slug: string, ext: string): string {
  return `${BRAND.filePrefix}-${slug}-${Date.now()}.${ext}`;
}
