"use server";

import { revalidatePath } from "next/cache";
import { LeadStage, PropertyStatus, Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { requirePermission } from "@/lib/permissions";
import { assertLeadAccess } from "@/lib/access-control";
import { getVisitScope, getSaleScope } from "@/lib/broker-scope";
import { buildPaginatedResult, parsePagination } from "@/lib/pagination";
import { sanitizeString } from "@/lib/utils";
import { proposalSchema, saleSchema, visitSchema } from "@/lib/validations/schemas";
import { runAutomations } from "@/lib/automation/engine";
import type { z } from "zod";

const visitInclude = {
  lead: { select: { name: true, phone: true } },
  property: { select: { title: true, code: true } },
  broker: { select: { name: true } },
} as const;

const proposalInclude = {
  lead: { select: { name: true } },
  property: { select: { title: true, code: true } },
  broker: { select: { name: true } },
} as const;

const saleInclude = {
  property: { select: { title: true, code: true, city: true } },
  broker: { select: { name: true } },
  commission: { select: { id: true, amount: true, status: true } },
} as const;

export async function getVisits(params?: { page?: string; pageSize?: string }) {
  const user = await requireAuth();
  requirePermission(user.role as Role, "leads:view");

  const { page, pageSize, skip } = parsePagination(params);
  const where = getVisitScope(user);

  const [items, total] = await Promise.all([
    prisma.visit.findMany({
      where,
      include: visitInclude,
      orderBy: { scheduledAt: "desc" },
      skip,
      take: pageSize,
    }),
    prisma.visit.count({ where }),
  ]);

  return buildPaginatedResult(items, total, page, pageSize);
}

export async function createVisit(data: z.infer<typeof visitSchema>) {
  const user = await requireAuth();
  requirePermission(user.role as Role, "leads:edit");

  const parsed = visitSchema.parse(data);
  await assertLeadAccess(parsed.leadId, user.id, user.role as Role);

  const property = await prisma.property.findUnique({ where: { id: parsed.propertyId } });
  if (!property) throw new Error("Imóvel não encontrado");
  if (user.role === "CORRETOR" && property.brokerId !== user.id) {
    throw new Error("Acesso negado ao imóvel");
  }

  const visit = await prisma.visit.create({
    data: {
      leadId: parsed.leadId,
      propertyId: parsed.propertyId,
      brokerId: user.id,
      scheduledAt: parsed.scheduledAt,
      notes: parsed.notes ? sanitizeString(parsed.notes, 1000) : null,
    },
  });

  await prisma.$transaction([
    prisma.lead.update({
      where: { id: parsed.leadId },
      data: { stage: LeadStage.VISITA_AGENDADA, lastContactAt: new Date() },
    }),
    prisma.leadHistory.create({
      data: {
        leadId: parsed.leadId,
        userId: user.id,
        action: "VISITA_AGENDADA",
        description: `Visita agendada para ${parsed.scheduledAt.toLocaleString("pt-BR")}`,
      },
    }),
  ]);

  revalidatePath("/negocios");
  revalidatePath("/funil");
  revalidatePath("/dashboard");
  return visit;
}

export async function toggleVisitComplete(id: string) {
  const user = await requireAuth();
  requirePermission(user.role as Role, "leads:edit");

  const visit = await prisma.visit.findUnique({ where: { id } });
  if (!visit) throw new Error("Visita não encontrada");
  if (user.role === "CORRETOR" && visit.brokerId !== user.id) {
    throw new Error("Acesso negado");
  }

  const markingComplete = !visit.completed;

  await prisma.visit.update({
    where: { id },
    data: { completed: markingComplete },
  });

  if (markingComplete) {
    await runAutomations({
      trigger: "visit_completed",
      leadId: visit.leadId,
      visitId: id,
      userId: user.id,
    }).catch(() => {});
  }

  revalidatePath("/negocios");
}

export async function getProposals(params?: { page?: string; pageSize?: string }) {
  const user = await requireAuth();
  requirePermission(user.role as Role, "leads:view");

  const { page, pageSize, skip } = parsePagination(params);
  const where = getVisitScope(user);

  const [items, total] = await Promise.all([
    prisma.proposal.findMany({
      where,
      include: proposalInclude,
      orderBy: { sentAt: "desc" },
      skip,
      take: pageSize,
    }),
    prisma.proposal.count({ where }),
  ]);

  return buildPaginatedResult(items, total, page, pageSize);
}

export async function createProposal(data: z.infer<typeof proposalSchema>) {
  const user = await requireAuth();
  requirePermission(user.role as Role, "leads:edit");

  const parsed = proposalSchema.parse(data);
  await assertLeadAccess(parsed.leadId, user.id, user.role as Role);

  const property = await prisma.property.findUnique({ where: { id: parsed.propertyId } });
  if (!property) throw new Error("Imóvel não encontrado");
  if (user.role === "CORRETOR" && property.brokerId !== user.id) {
    throw new Error("Acesso negado ao imóvel");
  }

  const proposal = await prisma.proposal.create({
    data: {
      leadId: parsed.leadId,
      propertyId: parsed.propertyId,
      brokerId: user.id,
      amount: parsed.amount,
      notes: parsed.notes ? sanitizeString(parsed.notes, 1000) : null,
    },
  });

  await prisma.$transaction([
    prisma.lead.update({
      where: { id: parsed.leadId },
      data: { stage: LeadStage.PROPOSTA, lastContactAt: new Date() },
    }),
    prisma.leadHistory.create({
      data: {
        leadId: parsed.leadId,
        userId: user.id,
        action: "PROPOSTA_ENVIADA",
        description: `Proposta de R$ ${parsed.amount.toLocaleString("pt-BR")} enviada`,
      },
    }),
  ]);

  revalidatePath("/negocios");
  revalidatePath("/funil");
  revalidatePath("/dashboard");
  return proposal;
}

export async function getSales(params?: { page?: string; pageSize?: string }) {
  const user = await requireAuth();
  requirePermission(user.role as Role, "leads:view");

  const { page, pageSize, skip } = parsePagination(params);
  const where = getSaleScope(user);

  const [items, total] = await Promise.all([
    prisma.sale.findMany({
      where,
      include: saleInclude,
      orderBy: { closedAt: "desc" },
      skip,
      take: pageSize,
    }),
    prisma.sale.count({ where }),
  ]);

  return buildPaginatedResult(items, total, page, pageSize);
}

export async function createSale(data: z.infer<typeof saleSchema>) {
  const user = await requireAuth();
  requirePermission(user.role as Role, "leads:edit");

  const parsed = saleSchema.parse(data);

  const property = await prisma.property.findUnique({ where: { id: parsed.propertyId } });
  if (!property) throw new Error("Imóvel não encontrado");
  if (user.role === "CORRETOR" && property.brokerId !== user.id) {
    throw new Error("Acesso negado ao imóvel");
  }
  if (property.status === PropertyStatus.VENDIDO) {
    throw new Error("Este imóvel já foi vendido");
  }

  if (parsed.leadId) {
    await assertLeadAccess(parsed.leadId, user.id, user.role as Role);
  }

  const commissionAmount = (parsed.amount * parsed.commissionPercentage) / 100;

  const sale = await prisma.$transaction(async (tx) => {
    const created = await tx.sale.create({
      data: {
        propertyId: parsed.propertyId,
        brokerId: user.id,
        amount: parsed.amount,
        commission: {
          create: {
            brokerId: user.id,
            propertyValue: parsed.amount,
            percentage: parsed.commissionPercentage,
            amount: commissionAmount,
          },
        },
      },
      include: saleInclude,
    });

    await tx.property.update({
      where: { id: parsed.propertyId },
      data: { status: PropertyStatus.VENDIDO },
    });

    if (parsed.leadId) {
      await tx.lead.update({
        where: { id: parsed.leadId },
        data: { stage: LeadStage.VENDA_CONCLUIDA, lastContactAt: new Date() },
      });
      await tx.leadHistory.create({
        data: {
          leadId: parsed.leadId,
          userId: user.id,
          action: "VENDA_CONCLUIDA",
          description: `Venda registrada — ${formatCurrencyLabel(parsed.amount)}`,
        },
      });
    }

    return created;
  });

  if (parsed.leadId) {
    await runAutomations({
      trigger: "sale_closed",
      leadId: parsed.leadId,
      saleId: sale.id,
      userId: user.id,
    }).catch(() => {});
  }

  revalidatePath("/negocios");
  revalidatePath("/imoveis");
  revalidatePath("/comissoes");
  revalidatePath("/funil");
  revalidatePath("/dashboard");
  return sale;
}

function formatCurrencyLabel(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}
