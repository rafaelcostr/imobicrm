import type { Role } from "@prisma/client";
import { getOrgScope, type ScopedUser } from "@/lib/organization";

type BrokerScopedUser = ScopedUser;

/** Filtro Prisma para restringir dados ao corretor logado. */
export function getBrokerScope(user: BrokerScopedUser): { brokerId: string } | Record<string, never> {
  if (user.role === "CORRETOR") {
    return { brokerId: user.id };
  }
  return {};
}

/** Filtro combinado: organização + corretor. */
export function getDataScope(user: BrokerScopedUser) {
  return {
    ...getOrgScope(user),
    ...getBrokerScope(user),
  };
}

/** Filtro para visitas e propostas (via lead). */
export function getVisitScope(user: BrokerScopedUser) {
  const org = getOrgScope(user);
  const broker = getBrokerScope(user);
  return {
    ...(broker.brokerId ? { brokerId: broker.brokerId } : {}),
    ...(org.organizationId ? { lead: { organizationId: org.organizationId } } : {}),
  };
}

/** Filtro para vendas e comissões (via imóvel). */
export function getSaleScope(user: BrokerScopedUser) {
  const org = getOrgScope(user);
  const broker = getBrokerScope(user);
  return {
    ...(broker.brokerId ? { brokerId: broker.brokerId } : {}),
    ...(org.organizationId ? { property: { organizationId: org.organizationId } } : {}),
  };
}

/** Filtro para comissões (via venda/imóvel). */
export function getCommissionScope(user: BrokerScopedUser) {
  const sale = getSaleScope(user);
  return {
    ...(sale.brokerId ? { brokerId: sale.brokerId } : {}),
    ...(sale.property ? { sale: { property: sale.property } } : {}),
  };
}

/** Filtro Prisma por userId (agenda, WhatsApp). */
export function getBrokerUserId(user: { role: Role; id: string }): string | undefined {
  return user.role === "CORRETOR" ? user.id : undefined;
}
