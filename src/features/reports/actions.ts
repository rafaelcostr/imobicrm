"use server";

import { Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { requirePermission } from "@/lib/permissions";
import { getBrokerScope } from "@/lib/broker-scope";

export async function generateReport(type: "LEADS" | "VENDAS" | "CORRETORES" | "IMOVEIS" | "COMISSOES") {
  const user = await requireAuth();
  requirePermission(user.role as Role, "reports:export");

  if (user.role === "CORRETOR" && type === "CORRETORES") {
    throw new Error("Acesso negado. Você não possui permissão para este relatório.");
  }

  const brokerFilter = getBrokerScope(user);

  let data: unknown = {};
  let title = "";

  switch (type) {
    case "LEADS":
      title = "Relatório de Leads";
      data = await prisma.lead.findMany({
        where: brokerFilter,
        select: {
          id: true,
          name: true,
          phone: true,
          email: true,
          source: true,
          stage: true,
          temperature: true,
          city: true,
          state: true,
          createdAt: true,
          broker: { select: { name: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 5000,
      });
      break;
    case "VENDAS":
      title = "Relatório de Vendas";
      data = await prisma.sale.findMany({
        where: brokerFilter,
        include: {
          property: { select: { title: true, code: true, city: true, state: true } },
          broker: { select: { name: true } },
        },
        orderBy: { closedAt: "desc" },
        take: 5000,
      });
      break;
    case "CORRETORES":
      title = "Relatório de Corretores";
      data = await prisma.user.findMany({
        where: { role: "CORRETOR" },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          creci: true,
          isActive: true,
          _count: { select: { leads: true, sales: true } },
        },
      });
      break;
    case "IMOVEIS":
      title = "Relatório de Imóveis";
      data = await prisma.property.findMany({
        where: brokerFilter,
        select: {
          id: true,
          code: true,
          title: true,
          type: true,
          purpose: true,
          price: true,
          status: true,
          city: true,
          state: true,
          broker: { select: { name: true } },
        },
        take: 5000,
      });
      break;
    case "COMISSOES":
      title = "Relatório de Comissões";
      data = await prisma.commission.findMany({
        where: brokerFilter,
        select: {
          id: true,
          propertyValue: true,
          percentage: true,
          amount: true,
          status: true,
          paidAt: true,
          createdAt: true,
          broker: { select: { name: true } },
          sale: { include: { property: { select: { title: true, code: true } } } },
        },
        take: 5000,
      });
      break;
  }

  const report = await prisma.report.create({
    data: {
      type,
      title,
      data: JSON.parse(JSON.stringify(data)),
      userId: user.id,
    },
  });

  return report;
}
