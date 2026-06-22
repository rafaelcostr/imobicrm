import { prisma } from "@/lib/prisma";
import { getSystemConfig } from "@/lib/system-config";

export type AssignmentLeadContext = {
  city?: string | null;
  state?: string | null;
};

async function getActiveBrokerIds(organizationId: string): Promise<string[]> {
  const brokers = await prisma.user.findMany({
    where: { organizationId, role: "CORRETOR", isActive: true },
    orderBy: { createdAt: "asc" },
    select: { id: true },
  });
  return brokers.map((b) => b.id);
}

async function assignRoundRobin(
  organizationId: string,
  brokerIds: string[],
): Promise<string | null> {
  if (brokerIds.length === 0) return null;
  if (brokerIds.length === 1) return brokerIds[0];

  const lastLead = await prisma.lead.findFirst({
    where: { organizationId, brokerId: { in: brokerIds } },
    orderBy: { createdAt: "desc" },
    select: { brokerId: true },
  });

  if (!lastLead?.brokerId) return brokerIds[0];

  const currentIndex = brokerIds.findIndex((id) => id === lastLead.brokerId);
  const nextIndex = currentIndex === -1 ? 0 : (currentIndex + 1) % brokerIds.length;
  return brokerIds[nextIndex];
}

async function assignByLoad(organizationId: string, brokerIds: string[]): Promise<string | null> {
  if (brokerIds.length === 0) return null;

  const counts = await prisma.lead.groupBy({
    by: ["brokerId"],
    where: {
      organizationId,
      brokerId: { in: brokerIds },
      stage: { notIn: ["VENDA_CONCLUIDA", "PERDIDO"] },
    },
    _count: { id: true },
  });

  const countMap = new Map(counts.map((c) => [c.brokerId, c._count.id]));

  let selected = brokerIds[0];
  let minCount = countMap.get(selected) ?? 0;

  for (const id of brokerIds) {
    const count = countMap.get(id) ?? 0;
    if (count < minCount) {
      minCount = count;
      selected = id;
    }
  }

  return selected;
}

async function assignByRegion(
  organizationId: string,
  brokerIds: string[],
  lead?: AssignmentLeadContext,
): Promise<string | null> {
  if (brokerIds.length === 0) return null;
  if (!lead?.city) return assignRoundRobin(organizationId, brokerIds);

  const city = lead.city.trim();
  const matching = await prisma.property.findMany({
    where: {
      organizationId,
      brokerId: { in: brokerIds },
      city: { equals: city, mode: "insensitive" },
      status: "DISPONIVEL",
    },
    select: { brokerId: true },
    distinct: ["brokerId"],
  });

  const regionalBrokers = matching
    .map((p) => p.brokerId)
    .filter((id): id is string => Boolean(id));

  if (regionalBrokers.length === 0) {
    return assignRoundRobin(organizationId, brokerIds);
  }

  return assignByLoad(organizationId, regionalBrokers);
}

/** Distribui leads entre corretores da organização. */
export async function assignBroker(
  organizationId: string,
  lead?: AssignmentLeadContext,
): Promise<string | null> {
  const brokerIds = await getActiveBrokerIds(organizationId);
  if (brokerIds.length === 0) return null;

  const config = await getSystemConfig(organizationId);
  const mode = config.leadAssignmentMode ?? "ROUND_ROBIN";

  switch (mode) {
    case "BY_LOAD":
      return assignByLoad(organizationId, brokerIds);
    case "BY_REGION":
      return assignByRegion(organizationId, brokerIds, lead);
    case "ROUND_ROBIN":
    default:
      return assignRoundRobin(organizationId, brokerIds);
  }
}

export async function getActiveBrokers(organizationId: string) {
  return prisma.user.findMany({
    where: { organizationId, role: "CORRETOR", isActive: true },
    select: { id: true, name: true, email: true },
    orderBy: { name: "asc" },
  });
}
