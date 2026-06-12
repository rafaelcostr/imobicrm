"use server";

import { revalidatePath } from "next/cache";
import { Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { requirePermission } from "@/lib/permissions";
import { assertLeadAccess } from "@/lib/access-control";
import { getBrokerUserId } from "@/lib/broker-scope";
import { sanitizeString } from "@/lib/utils";
import { taskSchema } from "@/lib/validations/schemas";
import type { z } from "zod";

export async function getTasks(from?: Date, to?: Date) {
  const user = await requireAuth();
  requirePermission(user.role as Role, "agenda:view");

  const start = from ?? new Date(new Date().setHours(0, 0, 0, 0));
  const end = to ?? new Date(new Date().setDate(new Date().getDate() + 30));
  const userId = getBrokerUserId(user);

  return prisma.task.findMany({
    where: {
      ...(userId ? { userId } : {}),
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
