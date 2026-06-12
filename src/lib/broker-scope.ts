import type { Role } from "@prisma/client";

type ScopedUser = { id: string; role: Role };

/** Filtro Prisma para restringir dados ao corretor logado. */
export function getBrokerScope(user: ScopedUser): { brokerId: string } | Record<string, never> {
  if (user.role === "CORRETOR") {
    return { brokerId: user.id };
  }
  return {};
}

/** Filtro Prisma por userId (agenda, WhatsApp). */
export function getBrokerUserId(user: ScopedUser): string | undefined {
  return user.role === "CORRETOR" ? user.id : undefined;
}
