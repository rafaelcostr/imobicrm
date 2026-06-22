import { NextRequest, NextResponse } from "next/server";
import { publicLeadSchema } from "@/lib/validations/schemas";
import { ingestInboundLead } from "@/lib/lead-ingestion";
import { LGPD_CONSENT_VERSION } from "@/lib/lgpd";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { getAppBaseUrl } from "@/lib/integrations";
import {
  getDefaultOrganizationId,
  resolveOrganizationIdFromRequest,
} from "@/lib/tenant-context";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

export async function POST(request: NextRequest) {
  const ip = getClientIp(request.headers);
  const rate = checkRateLimit(`public-capture:${ip}`, 10, 60_000);
  if (!rate.allowed) {
    return NextResponse.json(
      { error: "Muitas tentativas. Tente novamente em instantes." },
      { status: 429, headers: corsHeaders },
    );
  }

  try {
    const body = await request.json();

    if (body.website) {
      return NextResponse.json({ ok: true }, { headers: corsHeaders });
    }

    const parsed = publicLeadSchema.parse({
      ...body,
      lgpdConsent: body.lgpdConsent === true || body.lgpdConsent === "true",
    });

    const organizationId =
      (await resolveOrganizationIdFromRequest()) ?? (await getDefaultOrganizationId());
    if (!organizationId) {
      return NextResponse.json(
        { error: "Organização não identificada" },
        { status: 400, headers: corsHeaders },
      );
    }

    const result = await ingestInboundLead({
      organizationId,
      name: parsed.name,
      phone: parsed.phone,
      email: parsed.email || null,
      interest: parsed.interest,
      propertyCode: parsed.propertyCode,
      source: "SITE",
      externalSource: "embed",
      lgpdConsentAt: new Date(),
      historyAction: "CAPTACAO_EMBED",
      historyDescription: `Lead captado via formulário embed (LGPD v${LGPD_CONSENT_VERSION})`,
      automationTrigger: "lead_captured",
    });

    return NextResponse.json(
      { ok: true, leadId: result.leadId, created: result.created },
      { headers: corsHeaders },
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Dados inválidos";
    return NextResponse.json({ error: message }, { status: 400, headers: corsHeaders });
  }
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    endpoint: `${getAppBaseUrl()}/api/public/capture`,
    method: "POST",
  });
}
