import { LeadSource } from "@prisma/client";

const SOURCE_ALIASES: Record<string, LeadSource> = {
  site: "SITE",
  instagram: "INSTAGRAM",
  insta: "INSTAGRAM",
  facebook: "FACEBOOK",
  meta: "FACEBOOK",
  google: "GOOGLE",
  indicacao: "INDICACAO",
  indicação: "INDICACAO",
  olx: "OLX",
  zap: "ZAP_IMOVEIS",
  zap_imoveis: "ZAP_IMOVEIS",
  viva_real: "VIVA_REAL",
  vivareal: "VIVA_REAL",
};

export function isLeadsWebhookConfigured(): boolean {
  return Boolean(process.env.LEADS_WEBHOOK_SECRET);
}

export function isMetaLeadAdsConfigured(): boolean {
  return Boolean(
    process.env.META_LEAD_VERIFY_TOKEN && process.env.META_PAGE_ACCESS_TOKEN,
  );
}

export function parseLeadSource(value?: string | null): LeadSource {
  if (!value) return "SITE";
  const normalized = value.trim().toUpperCase();
  if (normalized in LeadSource) return normalized as LeadSource;
  const alias = SOURCE_ALIASES[value.trim().toLowerCase()];
  return alias ?? "SITE";
}

export function getAppBaseUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
}
