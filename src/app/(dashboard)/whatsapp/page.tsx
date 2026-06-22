import Link from "next/link";
import { auth } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import { getWhatsAppData, getLeadWhatsAppMessages } from "@/features/whatsapp/actions";
import { LeadWhatsAppInbox } from "@/features/whatsapp/components/lead-whatsapp-inbox";
import { WhatsAppTemplatesPanel } from "@/features/whatsapp/components/whatsapp-templates-panel";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { pageMetadata } from "@/lib/metadata";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { ExternalLink } from "lucide-react";
import type { Role } from "@prisma/client";
import { cn } from "@/lib/utils";

export const metadata = pageMetadata(
  "WhatsApp",
  "Conversas integradas com WhatsApp Business API.",
);

export default async function WhatsAppPage({
  searchParams,
}: {
  searchParams: Promise<{ lead?: string }>;
}) {
  const { lead: selectedLeadId } = await searchParams;
  const session = await auth();
  const role = session?.user?.role as Role;
  const canManageTemplates = hasPermission(role, "whatsapp:manage");

  const { leads, templates, apiConfigured } = await getWhatsAppData();

  const inboxLeadId = selectedLeadId ?? leads[0]?.id;
  const activeInbox = inboxLeadId
    ? await getLeadWhatsAppMessages(inboxLeadId).catch(() => null)
    : null;

  return (
    <section className="space-y-6" aria-labelledby="page-title">
      <PageHeader
        title="WhatsApp"
        description="Conversas com leads via API Business ou modo manual"
        actions={
          <Badge variant={apiConfigured ? "success" : "warning"}>
            {apiConfigured ? "API Meta conectada" : "Configure WHATSAPP_* no .env"}
          </Badge>
        }
      />

      <section aria-label="Conversas" className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Leads</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {leads.map((lead) => (
              <div
                key={lead.id}
                className={cn(
                  "flex items-center justify-between rounded-lg border border-border p-3",
                  activeInbox?.lead.id === lead.id && "border-primary bg-primary/5",
                )}
              >
                <Link href={`/whatsapp?lead=${lead.id}`} className="min-w-0 flex-1">
                  <p className="font-medium">{lead.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {lead.whatsapp ?? lead.phone}
                  </p>
                </Link>
                <a
                  href={buildWhatsAppUrl(lead.whatsapp ?? lead.phone)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-2 rounded-md border border-border p-2 hover:bg-muted"
                  aria-label={`Abrir WhatsApp de ${lead.name}`}
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            ))}
            {leads.length === 0 && (
              <p className="text-sm text-muted-foreground">Nenhum lead disponível</p>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>
              {activeInbox ? `Conversa — ${activeInbox.lead.name}` : "Selecione um lead"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {activeInbox ? (
              <LeadWhatsAppInbox
                leadId={activeInbox.lead.id}
                leadName={activeInbox.lead.name}
                messages={activeInbox.messages}
                templates={activeInbox.templates}
                apiConfigured={activeInbox.apiConfigured}
                waMeUrl={activeInbox.waMeUrl}
              />
            ) : (
              <p className="text-muted-foreground">Cadastre leads para iniciar conversas.</p>
            )}
          </CardContent>
        </Card>
      </section>

      {canManageTemplates && (
        <section aria-label="Templates de mensagem">
          <Card>
            <CardHeader>
              <CardTitle>Templates de mensagem</CardTitle>
            </CardHeader>
            <CardContent>
              <WhatsAppTemplatesPanel templates={templates} />
            </CardContent>
          </Card>
        </section>
      )}
    </section>
  );
}
