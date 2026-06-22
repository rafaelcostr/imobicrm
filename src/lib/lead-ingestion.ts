import { LeadSource } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { assignBroker } from "@/lib/lead-assignment";
import { LGPD_CONSENT_VERSION } from "@/lib/lgpd";
import { isEmailConfigured, sendLeadCaptureEmail } from "@/lib/email";
import { runAutomations } from "@/lib/automation/engine";
import { getAppBaseUrl } from "@/lib/integrations";
import { assertOrganizationLimit } from "@/lib/organization";
import { sanitizeString } from "@/lib/utils";

export type InboundLeadInput = {
  organizationId: string;
  name: string;
  phone: string;
  email?: string | null;
  interest?: string | null;
  city?: string | null;
  state?: string | null;
  source?: LeadSource;
  propertyCode?: string;
  externalId?: string;
  externalSource?: string;
  brokerId?: string | null;
  lgpdConsentAt?: Date | null;
  historyAction: string;
  historyDescription: string;
  automationTrigger: "lead_created" | "lead_captured";
  notifyBroker?: boolean;
};

export type IngestLeadResult = {
  leadId: string;
  created: boolean;
  name: string;
};

export async function ingestInboundLead(
  input: InboundLeadInput,
): Promise<IngestLeadResult> {
  await assertOrganizationLimit(input.organizationId, "leads");

  const name = sanitizeString(input.name, 120);
  const phone = sanitizeString(input.phone, 20);
  const email = input.email ? input.email.toLowerCase().trim() : null;
  const source = input.source ?? "SITE";

  if (input.externalId && input.externalSource) {
    const existing = await prisma.lead.findFirst({
      where: {
        organizationId: input.organizationId,
        externalSource: input.externalSource,
        externalId: input.externalId,
      },
    });
    if (existing) {
      return { leadId: existing.id, created: false, name: existing.name };
    }
  }

  let brokerId = input.brokerId ?? null;
  let propertyId: string | undefined;

  if (input.propertyCode) {
    const property = await prisma.property.findFirst({
      where: {
        organizationId: input.organizationId,
        code: { equals: input.propertyCode, mode: "insensitive" },
        isPublished: true,
        status: "DISPONIVEL",
      },
      select: { id: true, brokerId: true, city: true },
    });
    if (property) {
      propertyId = property.id;
      if (property.brokerId) brokerId = property.brokerId;
    }
  }

  if (!brokerId) {
    brokerId = await assignBroker(input.organizationId, {
      city: input.city,
      state: input.state,
    });
  }

  const lead = await prisma.lead.create({
    data: {
      organizationId: input.organizationId,
      name,
      phone,
      email,
      interest: input.interest ? sanitizeString(input.interest, 200) : null,
      city: input.city ? sanitizeString(input.city, 80) : null,
      state: input.state?.toUpperCase().slice(0, 2) ?? null,
      source,
      brokerId,
      propertyId,
      externalId: input.externalId ?? null,
      externalSource: input.externalSource ?? null,
      lgpdConsentAt: input.lgpdConsentAt ?? null,
      lgpdConsentVersion: input.lgpdConsentAt ? LGPD_CONSENT_VERSION : null,
    },
  });

  await prisma.leadHistory.create({
    data: {
      leadId: lead.id,
      action: input.historyAction,
      description: input.historyDescription,
    },
  });

  if (input.notifyBroker !== false && brokerId) {
    await prisma.notification.create({
      data: {
        userId: brokerId,
        type: "LEAD",
        title: "Novo lead recebido",
        message: `${lead.name} entrou via ${source}`,
        link: `/leads/${lead.id}`,
      },
    });

    if (isEmailConfigured()) {
      const broker = await prisma.user.findUnique({
        where: { id: brokerId },
        select: { email: true },
      });
      if (broker?.email) {
        await sendLeadCaptureEmail(
          broker.email,
          lead.name,
          `${getAppBaseUrl()}/leads/${lead.id}`,
        ).catch(() => undefined);
      }
    }
  }

  await runAutomations({
    trigger: input.automationTrigger,
    leadId: lead.id,
    source: lead.source,
  }).catch(() => {});

  return { leadId: lead.id, created: true, name: lead.name };
}
