"use server";

import { revalidatePath } from "next/cache";
import { CommissionStatus, Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { requirePermission } from "@/lib/permissions";
import { getBrokerScope } from "@/lib/broker-scope";

export async function getCommissions(filters?: { status?: CommissionStatus; month?: number; year?: number }) {
  const user = await requireAuth();
  requirePermission(user.role as Role, "commissions:view");

  const now = new Date();
  const month = filters?.month ?? now.getMonth();
  const year = filters?.year ?? now.getFullYear();
  const start = new Date(year, month, 1);
  const end = new Date(year, month + 1, 0, 23, 59, 59);

  return prisma.commission.findMany({
    where: {
      ...getBrokerScope(user),
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
