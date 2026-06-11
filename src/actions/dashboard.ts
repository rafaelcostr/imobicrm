"use server";

import { Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import { formatCurrency } from "@/lib/utils";
import { LEAD_SOURCE_LABELS } from "@/lib/labels";

const MONTH_LABELS = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

function buildSalesChart(sales: { closedAt: Date }[]) {
  const counts = new Map<string, number>();
  for (const sale of sales) {
    const key = `${sale.closedAt.getFullYear()}-${sale.closedAt.getMonth()}`;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  const now = new Date();
  const result: { month: string; total: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    result.push({ month: MONTH_LABELS[d.getMonth()] ?? "", total: counts.get(key) ?? 0 });
  }
  return result;
}

export async function getDashboardStats() {
  const user = await requireAuth();
  const role = user.role as Role;
  const isBroker = role === "CORRETOR";
  const brokerFilter = isBroker ? { brokerId: user.id } : {};

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

  const [
    totalLeads,
    leadsThisMonth,
    leadsLastMonth,
    totalProperties,
    scheduledVisits,
    proposalsSent,
    closedSales,
    commissionsPending,
    commissionsPaid,
    leadsBySource,
    salesByMonth,
    brokerRanking,
    funnelData,
  ] = await Promise.all([
    prisma.lead.count({ where: brokerFilter }),
    prisma.lead.count({ where: { ...brokerFilter, createdAt: { gte: startOfMonth } } }),
    prisma.lead.count({
      where: { ...brokerFilter, createdAt: { gte: startOfLastMonth, lte: endOfLastMonth } },
    }),
    prisma.property.count({ where: isBroker ? { brokerId: user.id } : {} }),
    prisma.visit.count({
      where: {
        ...(isBroker ? { brokerId: user.id } : {}),
        scheduledAt: { gte: startOfMonth },
        completed: false,
      },
    }),
    prisma.proposal.count({
      where: { ...(isBroker ? { brokerId: user.id } : {}), sentAt: { gte: startOfMonth } },
    }),
    prisma.sale.count({
      where: { ...(isBroker ? { brokerId: user.id } : {}), closedAt: { gte: startOfMonth } },
    }),
    prisma.commission.aggregate({
      where: { ...(isBroker ? { brokerId: user.id } : {}), status: { in: ["PENDENTE", "EM_PROCESSAMENTO"] } },
      _sum: { amount: true },
    }),
    prisma.commission.aggregate({
      where: { ...(isBroker ? { brokerId: user.id } : {}), status: "PAGO", paidAt: { gte: startOfMonth } },
      _sum: { amount: true },
    }),
    prisma.lead.groupBy({
      by: ["source"],
      where: brokerFilter,
      _count: { id: true },
    }),
    prisma.sale.findMany({
      where: {
        ...(isBroker ? { brokerId: user.id } : {}),
        closedAt: { gte: new Date(now.getFullYear(), now.getMonth() - 5, 1) },
      },
      select: { closedAt: true },
    }),
    hasPermission(role, "brokers:view")
      ? prisma.user.findMany({
          where: { role: "CORRETOR", isActive: true },
          select: {
            id: true,
            name: true,
            _count: { select: { sales: true, leads: true } },
            commissions: {
              where: { status: "PAGO" },
              select: { amount: true },
            },
          },
          take: 5,
        })
      : Promise.resolve([]),
    prisma.lead.groupBy({
      by: ["stage"],
      where: brokerFilter,
      _count: { id: true },
    }),
  ]);

  const leadTrend = leadsLastMonth > 0
    ? Math.round(((leadsThisMonth - leadsLastMonth) / leadsLastMonth) * 100)
    : leadsThisMonth > 0 ? 100 : 0;

  const conversionRate = totalLeads > 0
    ? ((closedSales / totalLeads) * 100).toFixed(1)
    : "0";

  const sourceChart = leadsBySource.map((item) => ({
    name: LEAD_SOURCE_LABELS[item.source],
    value: item._count.id,
  }));

  const ranking = brokerRanking
    .map((b) => ({
      id: b.id,
      name: b.name,
      sales: b._count.sales,
      leads: b._count.leads,
      commission: b.commissions.reduce((s, c) => s + Number(c.amount), 0),
    }))
    .sort((a, b) => b.sales - a.sales);

  const recentLeads = await prisma.lead.findMany({
    where: brokerFilter,
    orderBy: { createdAt: "desc" },
    take: 5,
    include: { broker: { select: { name: true } } },
  });

  const featuredProperties = await prisma.property.findMany({
    where: { status: "DISPONIVEL", ...(isBroker ? { brokerId: user.id } : {}) },
    take: 4,
    include: { media: { take: 1, where: { type: "IMAGE" } } },
    orderBy: { createdAt: "desc" },
  });

  const todayTasks = await prisma.task.findMany({
    where: {
      userId: isBroker ? user.id : undefined,
      startAt: {
        gte: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
        lt: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1),
      },
    },
    include: { lead: { select: { name: true } } },
    orderBy: { startAt: "asc" },
    take: 5,
  });

  return {
    kpis: {
      totalLeads,
      totalProperties,
      scheduledVisits,
      proposalsSent,
      closedSales,
      commissionPending: formatCurrency(Number(commissionsPending._sum.amount ?? 0)),
      commissionPaid: formatCurrency(Number(commissionsPaid._sum.amount ?? 0)),
      conversionRate: `${conversionRate}%`,
      leadTrend,
    },
    sourceChart,
    salesByMonth: buildSalesChart(salesByMonth),
    funnelData,
    brokerRanking: ranking,
    recentLeads,
    featuredProperties,
    todayTasks,
  };
}
