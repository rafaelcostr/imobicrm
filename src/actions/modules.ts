"use server";

import { revalidatePath } from "next/cache";
import { CommissionStatus, Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { requirePermission } from "@/lib/permissions";
import { assertLeadAccess } from "@/lib/access-control";
import { sanitizeString } from "@/lib/utils";
import { taskSchema } from "@/lib/validations/schemas";
import type { z } from "zod";

export async function getCommissions(filters?: { status?: CommissionStatus; month?: number; year?: number }) {
  const user = await requireAuth();
  requirePermission(user.role as Role, "commissions:view");

  const isBroker = user.role === "CORRETOR";
  const now = new Date();
  const month = filters?.month ?? now.getMonth();
  const year = filters?.year ?? now.getFullYear();
  const start = new Date(year, month, 1);
  const end = new Date(year, month + 1, 0, 23, 59, 59);

  return prisma.commission.findMany({
    where: {
      ...(isBroker ? { brokerId: user.id } : {}),
      ...(filters?.status ? { status: filters.status } : {}),
      createdAt: { gte: start, lte: end },
    },
    include: {
      broker: { select: { name: true } },
      sale: { include: { property: { select: { title: true, code: true } } } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function updateCommissionStatus(id: string, status: CommissionStatus) {
  const user = await requireAuth();
  requirePermission(user.role as Role, "commissions:manage");

  const commission = await prisma.commission.findUnique({ where: { id } });
  if (!commission) {
    throw new Error("Comissão não encontrada");
  }

  await prisma.commission.update({
    where: { id },
    data: {
      status,
      paidAt: status === "PAGO" ? new Date() : null,
    },
  });

  revalidatePath("/comissoes");
}

export async function getTasks(from?: Date, to?: Date) {
  const user = await requireAuth();
  requirePermission(user.role as Role, "agenda:view");

  const start = from ?? new Date(new Date().setHours(0, 0, 0, 0));
  const end = to ?? new Date(new Date().setDate(new Date().getDate() + 30));

  return prisma.task.findMany({
    where: {
      userId: user.role === "CORRETOR" ? user.id : undefined,
      startAt: { gte: start, lte: end },
    },
    include: { lead: { select: { name: true, phone: true } } },
    orderBy: { startAt: "asc" },
  });
}

export async function createTask(data: z.infer<typeof taskSchema>) {
  const user = await requireAuth();
  requirePermission(user.role as Role, "agenda:manage");

  const parsed = taskSchema.parse(data);

  if (parsed.leadId) {
    await assertLeadAccess(parsed.leadId, user.id, user.role as Role);
  }

  const task = await prisma.task.create({
    data: {
      title: sanitizeString(parsed.title, 200),
      description: parsed.description ? sanitizeString(parsed.description, 1000) : null,
      type: parsed.type,
      startAt: parsed.startAt,
      endAt: parsed.endAt,
      userId: user.id,
      leadId: parsed.leadId,
    },
  });

  revalidatePath("/agenda");
  revalidatePath("/dashboard");
  return task;
}

export async function toggleTaskComplete(id: string) {
  const user = await requireAuth();
  requirePermission(user.role as Role, "agenda:manage");

  const task = await prisma.task.findUnique({ where: { id } });
  if (!task || (user.role === "CORRETOR" && task.userId !== user.id)) {
    throw new Error("Acesso negado");
  }

  await prisma.task.update({
    where: { id },
    data: { completed: !task.completed },
  });

  revalidatePath("/agenda");
}

export async function getBrokerProfile(brokerId?: string) {
  const user = await requireAuth();
  requirePermission(user.role as Role, "brokers:view");

  const id = brokerId ?? user.id;
  if (user.role === "CORRETOR" && id !== user.id) {
    throw new Error("Acesso negado");
  }

  const broker = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      creci: true,
      avatarUrl: true,
      monthlyGoal: true,
      role: true,
      isActive: true,
      createdAt: true,
      _count: {
        select: { leads: true, sales: true, visits: true, proposals: true },
      },
      commissions: { select: { amount: true, status: true } },
    },
  });

  if (!broker) return null;

  const convertedLeads = await prisma.lead.count({
    where: { brokerId: id, stage: "VENDA_CONCLUIDA" },
  });

  const commissionTotal = broker.commissions.reduce((s, c) => s + Number(c.amount), 0);

  return {
    ...broker,
    stats: {
      leadsReceived: broker._count.leads,
      leadsConverted: convertedLeads,
      visitsDone: broker._count.visits,
      proposalsSent: broker._count.proposals,
      salesClosed: broker._count.sales,
      commissionGenerated: commissionTotal,
    },
  };
}

export async function getWhatsAppData() {
  const user = await requireAuth();
  requirePermission(user.role as Role, "whatsapp:view");

  const [leads, templates, messages] = await Promise.all([
    prisma.lead.findMany({
      where: user.role === "CORRETOR" ? { brokerId: user.id } : {},
      select: { id: true, name: true, phone: true, whatsapp: true },
      take: 20,
      orderBy: { updatedAt: "desc" },
    }),
    prisma.whatsAppTemplate.findMany({ where: { active: true } }),
    prisma.whatsAppMessage.findMany({
      where: user.role === "CORRETOR" ? { userId: user.id } : {},
      include: { lead: { select: { name: true } } },
      orderBy: { sentAt: "desc" },
      take: 50,
    }),
  ]);

  return { leads, templates, messages };
}

export async function sendWhatsAppMessage(leadId: string, content: string) {
  const user = await requireAuth();
  requirePermission(user.role as Role, "whatsapp:view");

  await assertLeadAccess(leadId, user.id, user.role as Role);

  const message = await prisma.whatsAppMessage.create({
    data: {
      leadId,
      userId: user.id,
      direction: "OUTBOUND",
      content: sanitizeString(content, 2000),
    },
  });

  revalidatePath("/whatsapp");
  return message;
}

export async function generateReport(type: "LEADS" | "VENDAS" | "CORRETORES" | "IMOVEIS" | "COMISSOES") {
  const user = await requireAuth();
  requirePermission(user.role as Role, "reports:export");

  const isBroker = user.role === "CORRETOR";

  if (isBroker && type === "CORRETORES") {
    throw new Error("Acesso negado. Você não possui permissão para este relatório.");
  }

  const brokerFilter = isBroker ? { brokerId: user.id } : {};

  let data: unknown = {};
  let title = "";

  switch (type) {
    case "LEADS":
      title = "Relatório de Leads";
      data = await prisma.lead.findMany({
        where: brokerFilter,
        select: {
          id: true,
          name: true,
          phone: true,
          email: true,
          source: true,
          stage: true,
          temperature: true,
          city: true,
          state: true,
          createdAt: true,
          broker: { select: { name: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 5000,
      });
      break;
    case "VENDAS":
      title = "Relatório de Vendas";
      data = await prisma.sale.findMany({
        where: brokerFilter,
        include: {
          property: { select: { title: true, code: true, city: true, state: true } },
          broker: { select: { name: true } },
        },
        orderBy: { closedAt: "desc" },
        take: 5000,
      });
      break;
    case "CORRETORES":
      title = "Relatório de Corretores";
      data = await prisma.user.findMany({
        where: { role: "CORRETOR" },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          creci: true,
          isActive: true,
          _count: { select: { leads: true, sales: true } },
        },
      });
      break;
    case "IMOVEIS":
      title = "Relatório de Imóveis";
      data = await prisma.property.findMany({
        where: brokerFilter,
        select: {
          id: true,
          code: true,
          title: true,
          type: true,
          purpose: true,
          price: true,
          status: true,
          city: true,
          state: true,
          broker: { select: { name: true } },
        },
        take: 5000,
      });
      break;
    case "COMISSOES":
      title = "Relatório de Comissões";
      data = await prisma.commission.findMany({
        where: brokerFilter,
        select: {
          id: true,
          propertyValue: true,
          percentage: true,
          amount: true,
          status: true,
          paidAt: true,
          createdAt: true,
          broker: { select: { name: true } },
          sale: { include: { property: { select: { title: true, code: true } } } },
        },
        take: 5000,
      });
      break;
  }

  const report = await prisma.report.create({
    data: {
      type,
      title,
      data: JSON.parse(JSON.stringify(data)),
      userId: user.id,
    },
  });

  return report;
}
