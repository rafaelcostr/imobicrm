"use server";

import { revalidatePath } from "next/cache";
import { Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { requirePermission } from "@/lib/permissions";
import { assertLeadAccess } from "@/lib/access-control";
import { getDataScope } from "@/lib/broker-scope";
import { requireOrganizationId } from "@/lib/organization";
import { sanitizeString } from "@/lib/utils";
import {
  buildWhatsAppUrl,
  isWhatsAppConfigured,
  normalizeWhatsAppPhone,
  sendWhatsAppTextMessage,
} from "@/lib/whatsapp";
import { z } from "zod";

const templateSchema = z.object({
  name: z.string().min(2).max(80),
  content: z.string().min(1).max(2000),
  active: z.boolean().optional(),
});

export async function getWhatsAppData() {
  const user = await requireAuth();
  requirePermission(user.role as Role, "whatsapp:view");

  const organizationId = requireOrganizationId(user);

  const [leads, templates, messages] = await Promise.all([
    prisma.lead.findMany({
      where: { organizationId, ...getDataScope(user) },
      select: { id: true, name: true, phone: true, whatsapp: true },
      take: 50,
      orderBy: { updatedAt: "desc" },
    }),
    prisma.whatsAppTemplate.findMany({ orderBy: { name: "asc" } }),
    prisma.whatsAppMessage.findMany({
      where:
        user.role === "CORRETOR"
          ? { lead: { organizationId, brokerId: user.id } }
          : { lead: { organizationId } },
      include: {
        lead: { select: { id: true, name: true } },
        user: { select: { name: true } },
      },
      orderBy: { sentAt: "desc" },
      take: 100,
    }),
  ]);

  return {
    leads,
    templates,
    messages,
    apiConfigured: isWhatsAppConfigured(),
  };
}

export async function getLeadWhatsAppMessages(leadId: string) {
  const user = await requireAuth();
  requirePermission(user.role as Role, "whatsapp:view");
  await assertLeadAccess(leadId, user.id, user.role as Role);

  const lead = await prisma.lead.findUnique({
    where: { id: leadId },
    select: { id: true, name: true, phone: true, whatsapp: true },
  });
  if (!lead) throw new Error("Lead não encontrado");

  const [messages, templates] = await Promise.all([
    prisma.whatsAppMessage.findMany({
      where: { leadId },
      include: { user: { select: { name: true } } },
      orderBy: { sentAt: "asc" },
    }),
    prisma.whatsAppTemplate.findMany({ where: { active: true }, orderBy: { name: "asc" } }),
  ]);

  return {
    lead,
    messages,
    templates,
    apiConfigured: isWhatsAppConfigured(),
    waMeUrl: buildWhatsAppUrl(lead.whatsapp ?? lead.phone),
  };
}

export async function sendWhatsAppMessage(leadId: string, content: string) {
  const user = await requireAuth();
  requirePermission(user.role as Role, "whatsapp:view");

  await assertLeadAccess(leadId, user.id, user.role as Role);

  const lead = await prisma.lead.findUnique({
    where: { id: leadId },
    select: { phone: true, whatsapp: true, brokerId: true, name: true },
  });
  if (!lead) throw new Error("Lead não encontrado");

  const text = sanitizeString(content, 2000);
  const phone = lead.whatsapp ?? lead.phone;
  const normalizedPhone = normalizeWhatsAppPhone(phone);

  let externalId: string | null = null;
  let status = "SENT";
  let sentViaApi = false;

  if (isWhatsAppConfigured()) {
    const result = await sendWhatsAppTextMessage(phone, text);
    externalId = result.externalId;
    status = result.status;
    sentViaApi = true;
  }

  const message = await prisma.$transaction(async (tx) => {
    const created = await tx.whatsAppMessage.create({
      data: {
        leadId,
        userId: user.id,
        direction: "OUTBOUND",
        content: text,
        status,
        externalId,
        phone: normalizedPhone,
      },
    });

    await tx.lead.update({
      where: { id: leadId },
      data: { lastContactAt: new Date() },
    });

    await tx.leadHistory.create({
      data: {
        leadId,
        userId: user.id,
        action: sentViaApi ? "WHATSAPP_ENVIADO" : "WHATSAPP_REGISTRADO",
        description: sentViaApi
          ? "Mensagem enviada via WhatsApp Business API"
          : "Mensagem registrada (API não configurada)",
      },
    });

    return created;
  });

  revalidatePath("/whatsapp");
  revalidatePath(`/leads/${leadId}`);

  return {
    message,
    sentViaApi,
    fallbackUrl: sentViaApi ? undefined : buildWhatsAppUrl(phone),
  };
}

export async function getWhatsAppTemplates() {
  const user = await requireAuth();
  requirePermission(user.role as Role, "whatsapp:view");
  const organizationId = requireOrganizationId(user);
  return prisma.whatsAppTemplate.findMany({
    where: { organizationId },
    orderBy: { name: "asc" },
  });
}

export async function createWhatsAppTemplate(data: z.infer<typeof templateSchema>) {
  const user = await requireAuth();
  requirePermission(user.role as Role, "whatsapp:manage");
  const parsed = templateSchema.parse(data);
  const organizationId = requireOrganizationId(user);

  const template = await prisma.whatsAppTemplate.create({
    data: {
      organizationId,
      name: sanitizeString(parsed.name, 80),
      content: sanitizeString(parsed.content, 2000),
      active: parsed.active ?? true,
    },
  });

  revalidatePath("/whatsapp");
  return template;
}

export async function updateWhatsAppTemplate(
  id: string,
  data: z.infer<typeof templateSchema>,
) {
  const user = await requireAuth();
  requirePermission(user.role as Role, "whatsapp:manage");
  const parsed = templateSchema.parse(data);

  const template = await prisma.whatsAppTemplate.update({
    where: { id },
    data: {
      name: sanitizeString(parsed.name, 80),
      content: sanitizeString(parsed.content, 2000),
      active: parsed.active ?? true,
    },
  });

  revalidatePath("/whatsapp");
  return template;
}

export async function deleteWhatsAppTemplate(id: string) {
  const user = await requireAuth();
  requirePermission(user.role as Role, "whatsapp:manage");

  await prisma.whatsAppTemplate.delete({ where: { id } });
  revalidatePath("/whatsapp");
}

export async function toggleWhatsAppTemplate(id: string, active: boolean) {
  const user = await requireAuth();
  requirePermission(user.role as Role, "whatsapp:manage");

  await prisma.whatsAppTemplate.update({
    where: { id },
    data: { active },
  });

  revalidatePath("/whatsapp");
}
