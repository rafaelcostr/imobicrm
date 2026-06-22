import { NextRequest, NextResponse } from "next/server";
import { LeadSource } from "@prisma/client";
import { ingestInboundLead } from "@/lib/lead-ingestion";
import { isMetaLeadAdsConfigured } from "@/lib/integrations";
import { getOrganizationBySlug } from "@/lib/organization";

const GRAPH_API_VERSION = "v21.0";

type MetaField = { name: string; values: string[] };

type MetaLeadResponse = {
  id: string;
  field_data?: MetaField[];
};

function getField(fields: MetaField[] | undefined, ...names: string[]): string | undefined {
  if (!fields) return undefined;
  for (const name of names) {
    const field = fields.find((f) => f.name.toLowerCase() === name.toLowerCase());
    if (field?.values[0]) return field.values[0];
  }
  return undefined;
}

async function resolveMetaOrganizationId(): Promise<string | null> {
  const slug = process.env.META_ORGANIZATION_SLUG;
  if (!slug) return null;
  const org = await getOrganizationBySlug(slug);
  return org?.id ?? null;
}

async function fetchMetaLead(leadgenId: string): Promise<MetaLeadResponse | null> {
  const token = process.env.META_PAGE_ACCESS_TOKEN;
  if (!token) return null;

  const response = await fetch(
    `https://graph.facebook.com/${GRAPH_API_VERSION}/${leadgenId}?access_token=${token}`,
  );

  if (!response.ok) return null;
  return response.json() as Promise<MetaLeadResponse>;
}

function inferSource(adId?: string): LeadSource {
  return adId ? "FACEBOOK" : "INSTAGRAM";
}

export async function GET(request: NextRequest) {
  const mode = request.nextUrl.searchParams.get("hub.mode");
  const token = request.nextUrl.searchParams.get("hub.verify_token");
  const challenge = request.nextUrl.searchParams.get("hub.challenge");

  if (
    mode === "subscribe" &&
    token &&
    challenge &&
    token === process.env.META_LEAD_VERIFY_TOKEN
  ) {
    return new NextResponse(challenge, { status: 200 });
  }

  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}

export async function POST(request: NextRequest) {
  if (!isMetaLeadAdsConfigured()) {
    return NextResponse.json({ error: "Meta Lead Ads não configurado" }, { status: 503 });
  }

  try {
    const organizationId = await resolveMetaOrganizationId();
    if (!organizationId) {
      return NextResponse.json(
        { error: "META_ORGANIZATION_SLUG não configurado ou organização inválida" },
        { status: 503 },
      );
    }

    const payload = await request.json();

    if (payload.object !== "page") {
      return NextResponse.json({ ok: true, skipped: true });
    }

    const entries = payload.entry ?? [];

    for (const entry of entries) {
      for (const change of entry.changes ?? []) {
        if (change.field !== "leadgen") continue;

        const leadgenId = change.value?.leadgen_id as string | undefined;
        const adId = change.value?.ad_id as string | undefined;
        if (!leadgenId) continue;

        const metaLead = await fetchMetaLead(leadgenId);
        if (!metaLead?.field_data) continue;

        const name =
          getField(metaLead.field_data, "full_name", "nome", "name") ?? "Lead Meta";
        const phone =
          getField(metaLead.field_data, "phone_number", "telefone", "phone") ?? "";
        const email = getField(metaLead.field_data, "email", "e-mail");

        if (!phone) continue;

        await ingestInboundLead({
          organizationId,
          name,
          phone,
          email: email ?? null,
          interest: getField(metaLead.field_data, "interesse", "interest"),
          source: inferSource(adId),
          externalId: leadgenId,
          externalSource: "meta_lead_ads",
          lgpdConsentAt: new Date(),
          historyAction: "META_LEAD_ADS",
          historyDescription: `Lead recebido via Meta Lead Ads (${leadgenId})`,
          automationTrigger: "lead_captured",
        });
      }
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Erro ao processar webhook" }, { status: 500 });
  }
}
