"use server";

import { revalidatePath } from "next/cache";
import { LeadSource, LeadStage, LeadTemperature, Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { requirePermission } from "@/lib/permissions";
import { sanitizeString } from "@/lib/utils";
import { leadSchema, leadUpdateSchema, publicLeadSchema } from "@/lib/validations/schemas";
import { assertRateLimit } from "@/lib/server-rate-limit";
import { buildPaginatedResult, parsePagination } from "@/lib/pagination";
import { getDataScope } from "@/lib/broker-scope";
import { requireOrganizationId, assertOrganizationLimit } from "@/lib/organization";
import { getPublicOrganizationId, getDefaultOrganizationId } from "@/lib/tenant-context";
import { assignBroker } from "@/lib/lead-assignment";
import { ingestInboundLead } from "@/lib/lead-ingestion";
import { runAutomations } from "@/lib/automation/engine";
import { LGPD_CONSENT_VERSION } from "@/lib/lgpd";
import { deleteFileByUrl, isUploadAvailable, uploadFile } from "@/lib/storage";
import type { z } from "zod";

function normalizePhone(phone: string): string {
  return phone.replace(/\D/g, "");
}

function buildLeadWhere(
  user: { id: string; role: Role; organizationId?: string | null },
  filters?: {
    search?: string;
    source?: LeadSource;
    stage?: LeadStage;
    temperature?: LeadTemperature;
    brokerId?: string;
  },
) {
  return {
    ...getDataScope(user),
    ...(filters?.brokerId && user.role !== "CORRETOR"
      ? { brokerId: filters.brokerId }
      : {}),
    ...(filters?.source ? { source: filters.source } : {}),
    ...(filters?.stage ? { stage: filters.stage } : {}),
    ...(filters?.temperature ? { temperature: filters.temperature } : {}),
    ...(filters?.search
      ? {
          OR: [
            { name: { contains: filters.search, mode: "insensitive" as const } },
            { email: { contains: filters.search, mode: "insensitive" as const } },
            { phone: { contains: filters.search } },
          ],
        }
      : {}),
  };
}

export async function getLeads(filters?: {
  search?: string;
  source?: LeadSource;
  stage?: LeadStage;
  temperature?: LeadTemperature;
  brokerId?: string;
  page?: string;
  pageSize?: string;
}) {
  const user = await requireAuth();
  requirePermission(user.role as Role, "leads:view");

  const { page, pageSize, skip } = parsePagination(filters);
  const where = buildLeadWhere(user, filters);

  const [items, total] = await Promise.all([
    prisma.lead.findMany({
      where,
      include: {
        broker: { select: { name: true } },
        _count: { select: { leadNotes: true, attachments: true } },
      },
      orderBy: { updatedAt: "desc" },
      skip,
      take: pageSize,
    }),
    prisma.lead.count({ where }),
  ]);

  return buildPaginatedResult(items, total, page, pageSize);
}

export async function getLeadOptions() {
  const user = await requireAuth();
  requirePermission(user.role as Role, "leads:view");

  return prisma.lead.findMany({
    where: getDataScope(user),
    select: { id: true, name: true, phone: true },
    orderBy: { name: "asc" },
    take: 200,
  });
}

export async function getLeadById(id: string) {
  const user = await requireAuth();
  requirePermission(user.role as Role, "leads:view");

  const lead = await prisma.lead.findUnique({
    where: { id },
    include: {
      broker: true,
      histories: { include: { user: { select: { name: true } } }, orderBy: { createdAt: "desc" } },
      leadNotes: { include: { user: { select: { name: true } } }, orderBy: { createdAt: "desc" } },
      attachments: true,
      property: true,
    },
  });

  if (!lead) return null;
  if (
    user.role !== "SUPER_ADMIN" &&
    user.organizationId &&
    lead.organizationId !== user.organizationId
  ) {
    throw new Error("Acesso negado");
  }
  if (user.role === "CORRETOR" && lead.brokerId !== user.id) {
    throw new Error("Acesso negado");
  }

  return lead;
}

export async function createLead(data: z.infer<typeof leadSchema>) {
  const user = await requireAuth();
  requirePermission(user.role as Role, "leads:create");

  const parsed = leadSchema.parse(data);
  const organizationId = requireOrganizationId(user);
  await assertOrganizationLimit(organizationId, "leads");

  let brokerId = user.role === "CORRETOR" ? user.id : parsed.brokerId;
  if (!brokerId && user.role !== "CORRETOR") {
    brokerId =
      (await assignBroker(organizationId, { city: parsed.city, state: parsed.state })) ?? user.id;
  }

  const lead = await prisma.lead.create({
    data: {
      organizationId,
      name: sanitizeString(parsed.name, 120),
      phone: sanitizeString(parsed.phone, 20),
      whatsapp: parsed.whatsapp ? sanitizeString(parsed.whatsapp, 20) : null,
      email: parsed.email ? parsed.email.toLowerCase() : null,
      city: parsed.city ? sanitizeString(parsed.city, 80) : null,
      state: parsed.state?.toUpperCase() ?? null,
      interest: parsed.interest ? sanitizeString(parsed.interest, 200) : null,
      priceRange: parsed.priceRange ? sanitizeString(parsed.priceRange, 80) : null,
      notes: parsed.notes ? sanitizeString(parsed.notes, 2000) : null,
      source: parsed.source,
      temperature: parsed.temperature ?? "MORNO",
      brokerId: brokerId ?? user.id,
    },
  });

  await prisma.leadHistory.create({
    data: {
      leadId: lead.id,
      userId: user.id,
      action: "LEAD_CRIADO",
      description: brokerId && !parsed.brokerId && user.role !== "CORRETOR"
        ? "Lead cadastrado e distribuído automaticamente"
        : "Lead cadastrado no sistema",
    },
  });

  await runAutomations({
    trigger: "lead_created",
    leadId: lead.id,
    userId: user.id,
    source: lead.source,
  }).catch(() => {});

  revalidatePath("/leads");
  revalidatePath("/funil");
  revalidatePath("/dashboard");
  return lead;
}

export async function updateLead(id: string, data: z.infer<typeof leadUpdateSchema>) {
  const user = await requireAuth();
  requirePermission(user.role as Role, "leads:edit");

  const existing = await getLeadById(id);
  if (!existing) throw new Error("Lead não encontrado");

  const parsed = leadUpdateSchema.parse(data);
  const stageChanged = parsed.stage && parsed.stage !== existing.stage;

  const lead = await prisma.lead.update({
    where: { id },
    data: {
      ...(parsed.name && { name: sanitizeString(parsed.name, 120) }),
      ...(parsed.phone && { phone: sanitizeString(parsed.phone, 20) }),
      ...(parsed.whatsapp !== undefined && {
        whatsapp: parsed.whatsapp ? sanitizeString(parsed.whatsapp, 20) : null,
      }),
      ...(parsed.email !== undefined && {
        email: parsed.email ? parsed.email.toLowerCase() : null,
      }),
      ...(parsed.city !== undefined && {
        city: parsed.city ? sanitizeString(parsed.city, 80) : null,
      }),
      ...(parsed.state !== undefined && { state: parsed.state?.toUpperCase() ?? null }),
      ...(parsed.interest !== undefined && {
        interest: parsed.interest ? sanitizeString(parsed.interest, 200) : null,
      }),
      ...(parsed.priceRange !== undefined && {
        priceRange: parsed.priceRange ? sanitizeString(parsed.priceRange, 80) : null,
      }),
      ...(parsed.notes !== undefined && {
        notes: parsed.notes ? sanitizeString(parsed.notes, 2000) : null,
      }),
      ...(parsed.source && { source: parsed.source }),
      ...(parsed.temperature && { temperature: parsed.temperature }),
      ...(parsed.stage && { stage: parsed.stage }),
      lastContactAt: new Date(),
    },
  });

  await prisma.leadHistory.create({
    data: {
      leadId: id,
      userId: user.id,
      action: stageChanged ? "ETAPA_ALTERADA" : "LEAD_ATUALIZADO",
      ...(stageChanged && { fromStage: existing.stage, toStage: parsed.stage }),
      description: stageChanged
        ? `Lead movido para ${parsed.stage}`
        : "Informações do lead atualizadas",
    },
  });

  if (stageChanged && parsed.stage) {
    await runAutomations({
      trigger: "stage_changed",
      leadId: id,
      userId: user.id,
      fromStage: existing.stage,
      toStage: parsed.stage,
      source: lead.source,
    }).catch(() => {});
  }

  revalidatePath("/leads");
  revalidatePath("/funil");
  revalidatePath("/dashboard");
  revalidatePath(`/leads/${id}`);
  return lead;
}

export async function deleteLead(id: string) {
  const user = await requireAuth();
  requirePermission(user.role as Role, "leads:delete");

  await getLeadById(id);

  await prisma.lead.delete({ where: { id } });
  revalidatePath("/leads");
  revalidatePath("/funil");
  revalidatePath("/dashboard");
}

export async function addLeadNote(leadId: string, content: string) {
  const user = await requireAuth();
  requirePermission(user.role as Role, "leads:edit");

  await getLeadById(leadId);

  const note = await prisma.leadNote.create({
    data: {
      leadId,
      userId: user.id,
      content: sanitizeString(content, 2000),
    },
  });

  revalidatePath(`/leads/${leadId}`);
  return note;
}

export async function moveLeadStage(leadId: string, stage: LeadStage) {
  const user = await requireAuth();
  requirePermission(user.role as Role, "funnel:move");

  const lead = await getLeadById(leadId);
  if (!lead) throw new Error("Lead não encontrado");

  await prisma.$transaction([
    prisma.lead.update({ where: { id: leadId }, data: { stage } }),
    prisma.leadHistory.create({
      data: {
        leadId,
        userId: user.id,
        action: "ETAPA_ALTERADA",
        fromStage: lead.stage,
        toStage: stage,
        description: `Lead movido para ${stage}`,
      },
    }),
  ]);

  await runAutomations({
    trigger: "stage_changed",
    leadId,
    userId: user.id,
    fromStage: lead.stage,
    toStage: stage,
    source: lead.source,
  }).catch(() => {});

  revalidatePath("/funil");
  revalidatePath("/leads");
  revalidatePath("/dashboard");
}

export async function getFunnelLeads() {
  const user = await requireAuth();
  requirePermission(user.role as Role, "funnel:view");

  return prisma.lead.findMany({
    where: getDataScope(user),
    include: { broker: { select: { name: true } } },
    orderBy: { updatedAt: "desc" },
  });
}

export async function assignLeadBroker(leadId: string, brokerId: string) {
  const user = await requireAuth();
  requirePermission(user.role as Role, "leads:assign");

  const lead = await getLeadById(leadId);
  if (!lead) throw new Error("Lead não encontrado");

  const organizationId = requireOrganizationId(user);
  const broker = await prisma.user.findFirst({
    where: { id: brokerId, organizationId, role: "CORRETOR", isActive: true },
  });
  if (!broker) throw new Error("Corretor inválido");

  await prisma.$transaction([
    prisma.lead.update({
      where: { id: leadId },
      data: { brokerId, lastContactAt: new Date() },
    }),
    prisma.leadHistory.create({
      data: {
        leadId,
        userId: user.id,
        action: "CORRETOR_ATRIBUIDO",
        description: `Lead atribuído a ${broker.name}`,
      },
    }),
    prisma.notification.create({
      data: {
        userId: broker.id,
        type: "LEAD",
        title: "Novo lead atribuído",
        message: `${lead.name} foi atribuído a você`,
        link: `/leads/${leadId}`,
      },
    }),
  ]);

  revalidatePath(`/leads/${leadId}`);
  revalidatePath("/leads");
  revalidatePath("/funil");
}

export async function capturePublicLead(data: {
  name: string;
  phone: string;
  email?: string;
  interest?: string;
  propertyCode?: string;
  website?: string;
  lgpdConsent: boolean;
}) {
  if (data.website) {
    return { success: true };
  }

  await assertRateLimit("captura", 5, 60_000);

  const parsed = publicLeadSchema.parse(data);
  const consentAt = new Date();

  const organizationId =
    (await getPublicOrganizationId()) ?? (await getDefaultOrganizationId());
  if (!organizationId) {
    throw new Error("Organização não identificada para captação");
  }

  const result = await ingestInboundLead({
    organizationId,
    name: parsed.name,
    phone: parsed.phone,
    email: parsed.email || null,
    interest: parsed.interest,
    propertyCode: parsed.propertyCode,
    source: "SITE",
    externalSource: parsed.propertyCode ? "captura" : "captura",
    externalId: undefined,
    lgpdConsentAt: consentAt,
    historyAction: "CAPTACAO_PUBLICA",
    historyDescription: parsed.propertyCode
      ? `Lead captado pela vitrine (LGPD v${LGPD_CONSENT_VERSION})`
      : `Lead captado pela página pública (LGPD v${LGPD_CONSENT_VERSION})`,
    automationTrigger: "lead_captured",
  });

  return { success: true, leadId: result.leadId };
}

export async function uploadLeadAttachment(leadId: string, formData: FormData) {
  const user = await requireAuth();
  requirePermission(user.role as Role, "leads:edit");

  if (!isUploadAvailable()) {
    throw new Error("Upload indisponível no momento");
  }

  await getLeadById(leadId);

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    throw new Error("Selecione um arquivo para upload");
  }

  const uploaded = await uploadFile(file, "lead", leadId, { allowPdf: true });

  const attachment = await prisma.leadAttachment.create({
    data: {
      leadId,
      fileName: sanitizeString(file.name, 255),
      fileUrl: uploaded.url,
      mimeType: uploaded.contentType,
      size: uploaded.size,
    },
  });

  await prisma.leadHistory.create({
    data: {
      leadId,
      userId: user.id,
      action: "ANEXO_ADICIONADO",
      description: `Anexo adicionado: ${file.name}`,
    },
  });

  revalidatePath(`/leads/${leadId}`);
  return attachment;
}

export async function deleteLeadAttachment(attachmentId: string) {
  const user = await requireAuth();
  requirePermission(user.role as Role, "leads:edit");

  const attachment = await prisma.leadAttachment.findUnique({
    where: { id: attachmentId },
  });
  if (!attachment) throw new Error("Anexo não encontrado");

  await getLeadById(attachment.leadId);

  if (attachment.fileUrl.startsWith("http") || attachment.fileUrl.startsWith("/uploads/")) {
    await deleteFileByUrl(attachment.fileUrl).catch(() => undefined);
  }

  await prisma.$transaction([
    prisma.leadAttachment.delete({ where: { id: attachmentId } }),
    prisma.leadHistory.create({
      data: {
        leadId: attachment.leadId,
        userId: user.id,
        action: "ANEXO_REMOVIDO",
        description: `Anexo removido: ${attachment.fileName}`,
      },
    }),
  ]);

  revalidatePath(`/leads/${attachment.leadId}`);
}

export async function findLeadDuplicates(
  params: { leadId?: string; phone?: string; email?: string },
  limit = 5,
) {
  const user = await requireAuth();
  requirePermission(user.role as Role, "leads:view");

  const phone = params.phone ? normalizePhone(params.phone) : "";
  const email = params.email?.toLowerCase().trim() || "";

  if (!phone && !email) return [];

  const candidates = await prisma.lead.findMany({
    where: {
      ...getDataScope(user),
      ...(params.leadId ? { NOT: { id: params.leadId } } : {}),
      OR: [
        ...(phone.length >= 8
          ? [{ phone: { contains: phone.slice(-8) } }, { whatsapp: { contains: phone.slice(-8) } }]
          : []),
        ...(email ? [{ email }] : []),
      ],
    },
    select: { id: true, name: true, phone: true, email: true },
    take: limit,
  });

  return candidates.filter((lead) => {
    if (email && lead.email?.toLowerCase() === email) return true;
    if (phone && normalizePhone(lead.phone).endsWith(phone.slice(-8))) return true;
    return false;
  });
}