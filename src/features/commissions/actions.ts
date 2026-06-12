"use server";

import { revalidatePath } from "next/cache";
import { CommissionStatus, Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { requirePermission } from "@/lib/permissions";
import { getBrokerScope } from "@/lib/broker-scope";
import { buildPaginatedResult, parsePagination } from "@/lib/pagination";

export async function getCommissionSummary(filters?: { month?: number; year?: number }) {
  const user = await requireAuth();
  requirePermission(user.role as Role, "commissions:view");

  const now = new Date();
  const month = filters?.month ?? now.getMonth();
  const year = filters?.year ?? now.getFullYear();
  const start = new Date(year, month, 1);
  const end = new Date(year, month + 1, 0, 23, 59, 59);
  const scope = getBrokerScope(user);

  const [pending, paid] = await Promise.all([
    prisma.commission.aggregate({
      where: { ...scope, status: { in: ["PENDENTE", "EM_PROCESSAMENTO"] }, createdAt: { gte: start, lte: end } },
      _sum: { amount: true },
    }),
    prisma.commission.aggregate({
      where: { ...scope, status: "PAGO", paidAt: { gte: start, lte: end } },
      _sum: { amount: true },
    }),
  ]);

  return {
    totalPending: Number(pending._sum.amount ?? 0),
    totalPaid: Number(paid._sum.amount ?? 0),
  };
}

export async function getCommissions(filters?: {
  status?: CommissionStatus;
  month?: number;
  year?: number;
  page?: string;
  pageSize?: string;
}) {
  const user = await requireAuth();
  requirePermission(user.role as Role, "commissions:view");

  const now = new Date();
  const month = filters?.month ?? now.getMonth();
  const year = filters?.year ?? now.getFullYear();
  const start = new Date(year, month, 1);
  const end = new Date(year, month + 1, 0, 23, 59, 59);
  const { page, pageSize, skip } = parsePagination(filters);

  const where = {
    ...getBrokerScope(user),
    ...(filters?.status ? { status: filters.status } : {}),
    createdAt: { gte: start, lte: end },
  };

  const [items, total] = await Promise.all([
    prisma.commission.findMany({
      where,
      include: {
        broker: { select: { name: true } },
        sale: { include: { property: { select: { title: true, code: true } } } },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: pageSize,
    }),
    prisma.commission.count({ where }),
  ]);

  return buildPaginatedResult(items, total, page, pageSize);
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
