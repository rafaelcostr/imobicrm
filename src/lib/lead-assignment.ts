import { prisma } from "@/lib/prisma";

/** Distribui leads entre corretores ativos em round-robin (último atribuído → próximo da fila). */
export async function assignBrokerRoundRobin(): Promise<string | null> {
  const brokers = await prisma.user.findMany({
    where: { role: "CORRETOR", isActive: true },
    orderBy: { createdAt: "asc" },
    select: { id: true },
  });

  if (brokers.length === 0) return null;
  if (brokers.length === 1) return brokers[0].id;

  const lastLead = await prisma.lead.findFirst({
    where: { brokerId: { in: brokers.map((b) => b.id) } },
    orderBy: { createdAt: "desc" },
    select: { brokerId: true },
  });

  if (!lastLead?.brokerId) return brokers[0].id;

  const currentIndex = brokers.findIndex((b) => b.id === lastLead.brokerId);
  const nextIndex = currentIndex === -1 ? 0 : (currentIndex + 1) % brokers.length;
  return brokers[nextIndex].id;
}

export async function getActiveBrokers() {
  return prisma.user.findMany({
    where: { role: "CORRETOR", isActive: true },
    select: { id: true, name: true, email: true },
    orderBy: { name: "asc" },
  });
}
