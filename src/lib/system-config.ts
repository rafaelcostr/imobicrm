import { prisma } from "@/lib/prisma";

export async function getSystemConfig(organizationId: string) {
  return prisma.systemConfig.upsert({
    where: { organizationId },
    create: { organizationId },
    update: {},
  });
}
