import { NextRequest, NextResponse } from "next/server";
import { webhookLeadSchema } from "@/lib/validations/schemas";
import { ingestInboundLead } from "@/lib/lead-ingestion";
import { parseLeadSource } from "@/lib/integrations";
import { getOrganizationBySlug } from "@/lib/organization";
import { getDefaultOrganizationId } from "@/lib/tenant-context";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

function unauthorized() {
  return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
}

function verifyToken(request: NextRequest): boolean {
  const secret = process.env.LEADS_WEBHOOK_SECRET;
  if (!secret) return false;

  const auth = request.headers.get("authorization");
  if (auth === `Bearer ${secret}`) return true;

  const headerToken = request.headers.get("x-webhook-token");
  return headerToken === secret;
}

export async function POST(request: NextRequest) {
  if (!process.env.LEADS_WEBHOOK_SECRET) {
    return NextResponse.json(
      { error: "LEADS_WEBHOOK_SECRET não configurado" },
      { status: 503 },
    );
  }

  if (!verifyToken(request)) {
    return unauthorized();
  }

  const ip = getClientIp(request.headers);
  const rate = checkRateLimit(`webhook-leads:${ip}`, 60, 60_000);
  if (!rate.allowed) {
    return NextResponse.json({ error: "Rate limit excedido" }, { status: 429 });
  }

  try {
    const orgSlug = request.headers.get("X-Organization-Slug")?.trim();
    let organizationId: string | null = null;

    if (orgSlug) {
      const org = await getOrganizationBySlug(orgSlug);
      if (!org) {
        return NextResponse.json({ error: "Organização não encontrada" }, { status: 400 });
      }
      organizationId = org.id;
    } else {
      organizationId = await getDefaultOrganizationId();
    }

    if (!organizationId) {
      return NextResponse.json({ error: "Organização não identificada" }, { status: 400 });
    }

    const body = await request.json();
    const parsed = webhookLeadSchema.parse(body);
    const source = parseLeadSource(parsed.source);
    const externalSource = parsed.portal ?? "webhook";

    const result = await ingestInboundLead({
      organizationId,
      name: parsed.name,
      phone: parsed.phone,
      email: parsed.email || null,
      interest: parsed.interest,
      city: parsed.city,
      state: parsed.state,
      source,
      propertyCode: parsed.propertyCode,
      externalId: parsed.externalId,
      externalSource,
      lgpdConsentAt: new Date(),
      historyAction: "WEBHOOK_LEAD",
      historyDescription: `Lead recebido via webhook (${externalSource})`,
      automationTrigger: "lead_captured",
    });

    return NextResponse.json({
      ok: true,
      leadId: result.leadId,
      created: result.created,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Payload inválido";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
