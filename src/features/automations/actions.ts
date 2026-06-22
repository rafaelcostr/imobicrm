"use server";

import { revalidatePath } from "next/cache";
import { Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { requirePermission } from "@/lib/permissions";
import { getSystemConfig } from "@/lib/system-config";
import { requireOrganizationId } from "@/lib/organization";
import { ensureDefaultAutomations } from "@/lib/automation/engine";
import { z } from "zod";

const automationSettingsSchema = z.object({
  leadAssignmentMode: z.enum(["ROUND_ROBIN", "BY_LOAD", "BY_REGION"]),
  coldLeadDays: z.coerce.number().int().min(1).max(90),
});

export async function getAutomationsOverview() {
  const user = await requireAuth();
  requirePermission(user.role as Role, "settings:view");

  const organizationId = requireOrganizationId(user);

  await ensureDefaultAutomations(organizationId);

  const [automations, config, recentLogs] = await Promise.all([
    prisma.automation.findMany({
      where: { organizationId },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    }),
    getSystemConfig(organizationId),
    prisma.automationLog.findMany({
      where: { automation: { organizationId } },
      orderBy: { createdAt: "desc" },
      take: 10,
      include: { automation: { select: { name: true } } },
    }),
  ]);

  return { automations, config, recentLogs };
}

export async function toggleAutomation(id: string, isActive: boolean) {
  const user = await requireAuth();
  requirePermission(user.role as Role, "automations:manage");

  await prisma.automation.update({
    where: { id },
    data: { isActive },
  });

  revalidatePath("/configuracoes/automacoes");
}

export async function updateAutomationSettings(
  data: z.infer<typeof automationSettingsSchema>,
) {
  const user = await requireAuth();
  requirePermission(user.role as Role, "automations:manage");

  const parsed = automationSettingsSchema.parse(data);

  const organizationId = requireOrganizationId(user);

  await prisma.systemConfig.update({
    where: { organizationId },
    data: {
      leadAssignmentMode: parsed.leadAssignmentMode,
      coldLeadDays: parsed.coldLeadDays,
    },
  });

  revalidatePath("/configuracoes/automacoes");
  revalidatePath("/configuracoes");
}
