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

async function assertTaskAccess(taskId: string, user: { id: string; role: Role }) {
  const task = await prisma.task.findUnique({ where: { id: taskId } });
  if (!task) {
    throw new Error("Tarefa não encontrada");
  }
  if (user.role === "CORRETOR" && task.userId !== user.id) {
    throw new Error("Acesso negado");
  }
  return task;
}

export async function getTasks(filters?: {
  from?: Date;
  to?: Date;
  status?: "all" | "pending" | "completed";
}) {
  const user = await requireAuth();
  requirePermission(user.role as Role, "agenda:view");

  const start = filters?.from ?? new Date(new Date().setHours(0, 0, 0, 0));
  const end =
    filters?.to ?? new Date(new Date().setDate(new Date().getDate() + 30));
  const userId = getBrokerUserId(user);

  return prisma.task.findMany({
    where: {
      ...(userId ? { userId } : {}),
      startAt: { gte: start, lte: end },
      ...(filters?.status === "pending" ? { completed: false } : {}),
      ...(filters?.status === "completed" ? { completed: true } : {}),
    },
    include: {
      lead: { select: { id: true, name: true, phone: true } },
      user: { select: { name: true } },
    },
    orderBy: { startAt: "asc" },
  });
}

export async function getTask(id: string) {
  const user = await requireAuth();
  requirePermission(user.role as Role, "agenda:view");

  const task = await assertTaskAccess(id, user);

  return prisma.task.findUnique({
    where: { id: task.id },
    include: {
      lead: { select: { id: true, name: true, phone: true } },
    },
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
      description: parsed.description
        ? sanitizeString(parsed.description, 1000)
        : null,
      type: parsed.type,
      startAt: parsed.startAt,
      endAt: parsed.endAt,
      userId: user.id,
      leadId: parsed.leadId || null,
    },
  });

  revalidatePath("/agenda");
  revalidatePath("/dashboard");
  return task;
}

export async function updateTask(id: string, data: z.infer<typeof taskSchema>) {
  const user = await requireAuth();
  requirePermission(user.role as Role, "agenda:manage");

  await assertTaskAccess(id, user);
  const parsed = taskSchema.parse(data);

  if (parsed.leadId) {
    await assertLeadAccess(parsed.leadId, user.id, user.role as Role);
  }

  const task = await prisma.task.update({
    where: { id },
    data: {
      title: sanitizeString(parsed.title, 200),
      description: parsed.description
        ? sanitizeString(parsed.description, 1000)
        : null,
      type: parsed.type,
      startAt: parsed.startAt,
      endAt: parsed.endAt,
      leadId: parsed.leadId || null,
    },
  });

  revalidatePath("/agenda");
  revalidatePath("/dashboard");
  revalidatePath(`/agenda/${id}/editar`);
  return task;
}

export async function toggleTaskComplete(id: string) {
  const user = await requireAuth();
  requirePermission(user.role as Role, "agenda:manage");

  const task = await assertTaskAccess(id, user);

  await prisma.task.update({
    where: { id },
    data: { completed: !task.completed },
  });

  revalidatePath("/agenda");
  revalidatePath("/dashboard");
}

export async function deleteTask(id: string) {
  const user = await requireAuth();
  requirePermission(user.role as Role, "agenda:manage");

  await assertTaskAccess(id, user);

  await prisma.task.delete({ where: { id } });

  revalidatePath("/agenda");
  revalidatePath("/dashboard");
}
