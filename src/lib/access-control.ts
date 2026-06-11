import { Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export async function assertLeadAccess(leadId: string, userId: string, role: Role): Promise<void> {
  const lead = await prisma.lead.findUnique({
    where: { id: leadId },
    select: { brokerId: true },
  });

  if (!lead) {
    throw new Error("Lead não encontrado");
  }

  if (role === "CORRETOR" && lead.brokerId !== userId) {
    throw new Error("Acesso negado");
  }
}

export async function assertPropertyAccess(propertyId: string, userId: string, role: Role): Promise<void> {
  const property = await prisma.property.findUnique({
    where: { id: propertyId },
    select: { brokerId: true },
  });

  if (!property) {
    throw new Error("Imóvel não encontrado");
  }

  if (role === "CORRETOR" && property.brokerId !== userId) {
    throw new Error("Acesso negado");
  }
}
