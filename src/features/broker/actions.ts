"use server";

import { Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { requirePermission } from "@/lib/permissions";

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
