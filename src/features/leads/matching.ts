"use server";

import { revalidatePath } from "next/cache";
import { Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { requirePermission } from "@/lib/permissions";
import { getDataScope } from "@/lib/broker-scope";
import { rankPropertyMatches } from "@/lib/property-match";
import { assertLeadAccess } from "@/lib/access-control";

export async function getPropertyMatchesForLead(leadId: string) {
  const user = await requireAuth();
  requirePermission(user.role as Role, "leads:view");

  const lead = await prisma.lead.findUnique({
    where: { id: leadId },
    select: {
      id: true,
      brokerId: true,
      city: true,
      state: true,
      interest: true,
      priceRange: true,
    },
  });

  if (!lead) return [];
  if (user.role === "CORRETOR" && lead.brokerId !== user.id) {
    throw new Error("Acesso negado");
  }

  const properties = await prisma.property.findMany({
    where: {
      status: "DISPONIVEL",
      ...getDataScope(user),
    },
    select: {
      id: true,
      code: true,
      title: true,
      price: true,
      city: true,
      state: true,
      bedrooms: true,
      bathrooms: true,
      type: true,
      status: true,
    },
    take: 100,
    orderBy: { updatedAt: "desc" },
  });

  return rankPropertyMatches(lead, properties);
}

export async function linkLeadToProperty(leadId: string, propertyId: string) {
  const user = await requireAuth();
  requirePermission(user.role as Role, "leads:edit");

  await assertLeadAccess(leadId, user.id, user.role as Role);

  const property = await prisma.property.findUnique({ where: { id: propertyId } });
  if (!property) throw new Error("Imóvel não encontrado");
  if (user.role === "CORRETOR" && property.brokerId !== user.id) {
    throw new Error("Acesso negado ao imóvel");
  }

  await prisma.$transaction([
    prisma.lead.update({
      where: { id: leadId },
      data: { propertyId, lastContactAt: new Date() },
    }),
    prisma.leadHistory.create({
      data: {
        leadId,
        userId: user.id,
        action: "IMOVEL_VINCULADO",
        description: `Imóvel ${property.code} vinculado ao lead`,
      },
    }),
  ]);

  revalidatePath(`/leads/${leadId}`);
  revalidatePath("/leads");
}
