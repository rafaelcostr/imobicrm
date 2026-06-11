import { headers } from "next/headers";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

export async function assertRateLimit(scope: string, maxRequests: number, windowMs: number): Promise<void> {
  const headerStore = await headers();
  const ip = getClientIp(headerStore);
  const result = checkRateLimit(`${scope}:${ip}`, maxRequests, windowMs);

  if (!result.allowed) {
    throw new Error("Muitas tentativas. Aguarde alguns minutos e tente novamente.");
  }
}
