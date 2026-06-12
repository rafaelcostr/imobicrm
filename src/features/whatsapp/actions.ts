"use server";

import { revalidatePath } from "next/cache";
import { Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { requirePermission } from "@/lib/permissions";
import { assertLeadAccess } from "@/lib/access-control";
import { getBrokerScope, getBrokerUserId } from "@/lib/broker-scope";
import { sanitizeString } from "@/lib/utils";

export async function getWhatsAppData() {
  const user = await requireAuth();
  requirePermission(user.role as Role, "whatsapp:view");

  const userId = getBrokerUserId(user);

  const [leads, templates, messages] = await Promise.all([
    prisma.lead.findMany({
      where: getBrokerScope(user),
      select: { id: true, name: true, phone: true, whatsapp: true },
      take: 20,
      orderBy: { updatedAt: "desc" },
    }),
    prisma.whatsAppTemplate.findMany({ where: { active: true } }),
    prisma.whatsAppMessage.findMany({
      where: userId ? { userId } : {},
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
