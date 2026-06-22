"use server";

import { Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import { getDataScope } from "@/lib/broker-scope";
import { getOrgScope } from "@/lib/organization";

export type SearchResultItem = {
  id: string;
  type: "lead" | "property" | "broker";
  title: string;
  subtitle: string;
  href: string;
};

export type GlobalSearchResults = {
  query: string;
  items: SearchResultItem[];
  total: number;
};

export async function globalSearch(query: string, limit = 12): Promise<GlobalSearchResults> {
  const user = await requireAuth();
  const q = query.trim();

  if (q.length < 2) {
    return { query: q, items: [], total: 0 };
  }

  const dataScope = getDataScope(user);
  const perType = Math.max(4, Math.ceil(limit / 3));

  const [leads, properties, brokers] = await Promise.all([
    hasPermission(user.role as Role, "leads:view")
      ? prisma.lead.findMany({
          where: {
            ...dataScope,
            OR: [
              { name: { contains: q, mode: "insensitive" } },
              { email: { contains: q, mode: "insensitive" } },
              { phone: { contains: q } },
              { whatsapp: { contains: q } },
              { city: { contains: q, mode: "insensitive" } },
            ],
          },
          select: { id: true, name: true, phone: true, city: true },
          take: perType,
          orderBy: { updatedAt: "desc" },
        })
      : [],
    hasPermission(user.role as Role, "properties:view")
      ? prisma.property.findMany({
          where: {
            ...dataScope,
            OR: [
              { title: { contains: q, mode: "insensitive" } },
              { code: { contains: q, mode: "insensitive" } },
              { city: { contains: q, mode: "insensitive" } },
              { neighborhood: { contains: q, mode: "insensitive" } },
            ],
          },
          select: { id: true, title: true, code: true, city: true },
          take: perType,
          orderBy: { updatedAt: "desc" },
        })
      : [],
    user.role !== "CORRETOR" && hasPermission(user.role as Role, "brokers:view")
      ? prisma.user.findMany({
          where: {
            role: "CORRETOR",
            isActive: true,
            ...getOrgScope(user),
            OR: [
              { name: { contains: q, mode: "insensitive" } },
              { email: { contains: q, mode: "insensitive" } },
              { phone: { contains: q } },
              { creci: { contains: q, mode: "insensitive" } },
            ],
          },
          select: { id: true, name: true, email: true, phone: true },
          take: perType,
          orderBy: { name: "asc" },
        })
      : [],
  ]);

  const items: SearchResultItem[] = [
    ...leads.map((lead) => ({
      id: lead.id,
      type: "lead" as const,
      title: lead.name,
      subtitle: `${lead.phone}${lead.city ? ` · ${lead.city}` : ""}`,
      href: `/leads/${lead.id}`,
    })),
    ...properties.map((property) => ({
      id: property.id,
      type: "property" as const,
      title: `${property.code} — ${property.title}`,
      subtitle: property.city,
      href: `/imoveis/${property.id}`,
    })),
    ...brokers.map((broker) => ({
      id: broker.id,
      type: "broker" as const,
      title: broker.name,
      subtitle: broker.email ?? broker.phone ?? "Corretor",
      href: "/corretor",
    })),
  ];

  return {
    query: q,
    items: items.slice(0, limit),
    total: items.length,
  };
}
