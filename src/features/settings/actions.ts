"use server";

import { revalidatePath } from "next/cache";
import { Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { requirePermission } from "@/lib/permissions";
import { getSystemConfig } from "@/lib/system-config";
import { requireOrganizationId } from "@/lib/organization";
import { sanitizeString } from "@/lib/utils";
import { systemConfigSchema } from "@/lib/validations/schemas";
import { isStorageConfigured } from "@/lib/storage";
import { isEmailConfigured as smtpConfigured } from "@/lib/email";
import { isWhatsAppConfigured } from "@/lib/whatsapp";
import {
  getAppBaseUrl,
  isLeadsWebhookConfigured,
  isMetaLeadAdsConfigured,
} from "@/lib/integrations";
import type { z } from "zod";

export async function getSettingsOverview() {
  const user = await requireAuth();
  requirePermission(user.role as Role, "settings:view");

  const organizationId = requireOrganizationId(user);
  const config = await getSystemConfig(organizationId);

  return {
    config,
    integrations: {
      smtp: smtpConfigured(),
      storage: isStorageConfigured(),
      whatsapp: isWhatsAppConfigured(),
      leadsWebhook: isLeadsWebhookConfigured(),
      metaLeadAds: isMetaLeadAdsConfigured(),
    },
    appUrl: getAppBaseUrl(),
  };
}

export async function updateSystemConfig(data: z.infer<typeof systemConfigSchema>) {
  const user = await requireAuth();
  requirePermission(user.role as Role, "settings:manage");

  const parsed = systemConfigSchema.parse(data);

  const organizationId = requireOrganizationId(user);

  const config = await prisma.systemConfig.upsert({
    where: { organizationId },
    create: {
      organizationId,
      companyName: sanitizeString(parsed.companyName, 120),
      tagline: parsed.tagline ? sanitizeString(parsed.tagline, 200) : null,
      defaultMonthlyGoal: parsed.defaultMonthlyGoal ?? null,
      capturePageTitle: parsed.capturePageTitle
        ? sanitizeString(parsed.capturePageTitle, 120)
        : null,
    },
    update: {
      companyName: sanitizeString(parsed.companyName, 120),
      tagline: parsed.tagline ? sanitizeString(parsed.tagline, 200) : null,
      defaultMonthlyGoal: parsed.defaultMonthlyGoal ?? null,
      capturePageTitle: parsed.capturePageTitle
        ? sanitizeString(parsed.capturePageTitle, 120)
        : null,
    },
  });

  revalidatePath("/configuracoes");
  revalidatePath("/configuracoes/geral");
  revalidatePath("/captura");
  return config;
}
