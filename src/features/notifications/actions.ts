"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function getNotifications(limit = 20) {
  const user = await requireAuth();

  const [items, unreadCount] = await Promise.all([
    prisma.notification.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: limit,
    }),
    prisma.notification.count({
      where: { userId: user.id, read: false },
    }),
  ]);

  return { items, unreadCount };
}

export async function markNotificationRead(id: string) {
  const user = await requireAuth();

  await prisma.notification.updateMany({
    where: { id, userId: user.id },
    data: { read: true },
  });

  revalidatePath("/", "layout");
}

export async function markAllNotificationsRead() {
  const user = await requireAuth();

  await prisma.notification.updateMany({
    where: { userId: user.id, read: false },
    data: { read: true },
  });

  revalidatePath("/", "layout");
}

export async function getUnreadNotificationCount() {
  const user = await requireAuth();

  return prisma.notification.count({
    where: { userId: user.id, read: false },
  });
}
