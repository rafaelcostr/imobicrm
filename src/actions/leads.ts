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
import type { z } from "zod";

function buildLeadWhere(
  user: { id: string; role: Role },
  filters?: {
    search?: string;
    source?: LeadSource;
    stage?: LeadStage;
    temperature?: LeadTemperature;
  },
) {
  return {
    ...(user.role === "CORRETOR" ? { brokerId: user.id } : {}),
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
    where: user.role === "CORRETOR" ? { brokerId: user.id } : {},
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
  if (user.role === "CORRETOR" && lead.brokerId !== user.id) {
    throw new Error("Acesso negado");
  }

  return lead;
}

export async function createLead(data: z.infer<typeof leadSchema>) {
  const user = await requireAuth();
  requirePermission(user.role as Role, "leads:create");

  const parsed = leadSchema.parse(data);

  const lead = await prisma.lead.create({
    data: {
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
      brokerId: user.role === "CORRETOR" ? user.id : parsed.brokerId ?? user.id,
    },
  });

  await prisma.leadHistory.create({
    data: {
      leadId: lead.id,
      userId: user.id,
      action: "LEAD_CRIADO",
      description: "Lead cadastrado no sistema",
    },
  });

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

  revalidatePath("/funil");
  revalidatePath("/leads");
  revalidatePath("/dashboard");
}

export async function getFunnelLeads() {
  const user = await requireAuth();
  requirePermission(user.role as Role, "funnel:view");

  return prisma.lead.findMany({
    where: user.role === "CORRETOR" ? { brokerId: user.id } : {},
    include: { broker: { select: { name: true } } },
    orderBy: { updatedAt: "desc" },
  });
}

export async function capturePublicLead(data: {
  name: string;
  phone: string;
  email?: string;
  interest?: string;
  website?: string;
  lgpdConsent: boolean;
}) {
  if (data.website) {
    return { success: true };
  }

  await assertRateLimit("captura", 5, 60_000);

  const parsed = publicLeadSchema.parse(data);

  const defaultBroker = await prisma.user.findFirst({
    where: { role: "CORRETOR", isActive: true },
    orderBy: { createdAt: "asc" },
  });

  const lead = await prisma.lead.create({
    data: {
      name: sanitizeString(parsed.name, 120),
      phone: sanitizeString(parsed.phone, 20),
      email: parsed.email ? parsed.email.toLowerCase() : null,
      interest: parsed.interest ? sanitizeString(parsed.interest, 200) : null,
      source: "SITE",
      brokerId: defaultBroker?.id,
    },
  });

  await prisma.leadHistory.create({
    data: {
      leadId: lead.id,
      action: "CAPTACAO_PUBLICA",
      description: "Lead captado pela página pública",
    },
  });

  if (defaultBroker) {
    await prisma.notification.create({
      data: {
        userId: defaultBroker.id,
        type: "LEAD",
        title: "Novo lead captado",
        message: `${lead.name} entrou pelo formulário público`,
        link: `/leads/${lead.id}`,
      },
    });
  }

  return { success: true };
}