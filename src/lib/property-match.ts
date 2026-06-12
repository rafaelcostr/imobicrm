import type { Property } from "@prisma/client";

type LeadProfile = {
  city?: string | null;
  state?: string | null;
  interest?: string | null;
  priceRange?: string | null;
};

export type PropertyMatch = {
  property: Pick<
    Property,
    "id" | "code" | "title" | "price" | "city" | "state" | "bedrooms" | "bathrooms" | "type" | "status"
  >;
  score: number;
  reasons: string[];
};

/** Extrai faixa de preço de textos como "R$ 400.000 - R$ 600.000" ou "400000-600000". */
export function parsePriceRange(text?: string | null): { min: number; max: number } | null {
  if (!text?.trim()) return null;

  const numbers =
    text.match(/\d[\d.,]*/g)?.map((raw) => {
      const normalized = raw.replace(/\./g, "").replace(",", ".");
      return Number.parseFloat(normalized);
    }).filter((n) => !Number.isNaN(n) && n > 0) ?? [];

  if (numbers.length === 0) return null;
  if (numbers.length === 1) {
    const value = numbers[0];
    return { min: value * 0.85, max: value * 1.15 };
  }

  return { min: Math.min(...numbers), max: Math.max(...numbers) };
}

/** Tenta inferir quartos desejados a partir do campo interesse. */
export function parseBedroomsFromInterest(interest?: string | null): number | undefined {
  if (!interest) return undefined;
  const match = interest.match(/(\d+)\s*quarto/i);
  return match ? Number.parseInt(match[1], 10) : undefined;
}

export function scorePropertyMatch(
  lead: LeadProfile,
  property: Pick<Property, "price" | "city" | "state" | "bedrooms" | "status">,
): { score: number; reasons: string[] } {
  const reasons: string[] = [];
  let score = 0;

  if (property.status !== "DISPONIVEL") {
    return { score: 0, reasons: ["Imóvel indisponível"] };
  }

  if (lead.city && property.city.toLowerCase() === lead.city.toLowerCase()) {
    score += 35;
    reasons.push("Mesma cidade");
  }

  if (lead.state && property.state.toUpperCase() === lead.state.toUpperCase()) {
    score += 15;
    reasons.push("Mesmo estado");
  }

  const range = parsePriceRange(lead.priceRange);
  const price = Number(property.price);
  if (range) {
    if (price >= range.min && price <= range.max) {
      score += 40;
      reasons.push("Preço na faixa");
    } else if (price >= range.min * 0.9 && price <= range.max * 1.1) {
      score += 20;
      reasons.push("Preço próximo da faixa");
    }
  }

  const desiredBedrooms = parseBedroomsFromInterest(lead.interest);
  if (desiredBedrooms !== undefined && property.bedrooms >= desiredBedrooms) {
    score += 25;
    reasons.push(`${property.bedrooms} quartos (pedido: ${desiredBedrooms}+)`);
  } else if (lead.interest && /apartamento|casa|imóvel/i.test(lead.interest)) {
    score += 5;
    reasons.push("Perfil compatível");
  }

  return { score, reasons };
}

export function rankPropertyMatches(
  lead: LeadProfile,
  properties: Array<
    Pick<Property, "id" | "code" | "title" | "price" | "city" | "state" | "bedrooms" | "bathrooms" | "type" | "status">
  >,
  limit = 5,
  minScore = 20,
): PropertyMatch[] {
  return properties
    .map((property) => {
      const { score, reasons } = scorePropertyMatch(lead, property);
      return { property, score, reasons };
    })
    .filter((m) => m.score >= minScore)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}
