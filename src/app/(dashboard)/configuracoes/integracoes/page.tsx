import { auth } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import { getSettingsOverview } from "@/features/settings/actions";
import { LeadCsvImportPanel } from "@/features/integrations/components/lead-csv-import-panel";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BRAND } from "@/lib/brand";
import { pageMetadata } from "@/lib/metadata";
import type { Role } from "@prisma/client";

export const metadata = pageMetadata("Integrações", "Status das integrações do sistema.");

export default async function IntegrationsSettingsPage() {
  const session = await auth();
  const role = session?.user?.role as Role;
  const canImport = hasPermission(role, "leads:create");

  const { integrations, appUrl } = await getSettingsOverview();

  const embedSnippet = `<script src="${appUrl}/embed.js" data-base="${appUrl}"></script>
<div id="${BRAND.embedTargetId}"></div>`;

  const webhookExample = `curl -X POST ${appUrl}/api/webhooks/leads \\
  -H "Authorization: Bearer SEU_LEADS_WEBHOOK_SECRET" \\
  -H "Content-Type: application/json" \\
  -d '{"name":"Maria","phone":"11999998888","source":"olx","portal":"olx"}'`;

  return (
    <section className="space-y-6" aria-labelledby="page-title">
      <PageHeader
        title="Integrações"
        description="Webhooks, Meta Lead Ads, embed e importação de portais"
      />

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Webhook genérico de leads</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <Badge variant={integrations.leadsWebhook ? "success" : "warning"}>
              {integrations.leadsWebhook ? "Configurado" : "Não configurado"}
            </Badge>
            <p className="text-muted-foreground">
              POST {appUrl}/api/webhooks/leads
            </p>
            <p className="text-muted-foreground">
              Header: Authorization: Bearer LEADS_WEBHOOK_SECRET
            </p>
            <pre className="overflow-x-auto rounded-md bg-muted p-3 text-xs">{webhookExample}</pre>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Meta Lead Ads</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <Badge variant={integrations.metaLeadAds ? "success" : "warning"}>
              {integrations.metaLeadAds ? "Configurado" : "Não configurado"}
            </Badge>
            <p className="text-muted-foreground">
              META_LEAD_VERIFY_TOKEN, META_PAGE_ACCESS_TOKEN
            </p>
            <p className="text-muted-foreground">
              Webhook: {appUrl}/api/webhooks/meta-leads
            </p>
            <p className="text-muted-foreground">
              Inscreva o app Meta em leadgen na página do Facebook.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">WhatsApp Business API</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <Badge variant={integrations.whatsapp ? "success" : "warning"}>
              {integrations.whatsapp ? "Configurado" : "Não configurado"}
            </Badge>
            <p className="text-muted-foreground">
              Webhook: {appUrl}/api/webhooks/whatsapp
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">E-mail (SMTP)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <Badge variant={integrations.smtp ? "success" : "warning"}>
              {integrations.smtp ? "Ativo" : "Inativo"}
            </Badge>
            <p className="text-muted-foreground">
              SMTP_HOST, SMTP_FROM, SMTP_USER, SMTP_PASSWORD
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Formulário embed (sites externos)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <p className="text-muted-foreground">
            Modo iframe (recomendado) ou formulário JSON via{" "}
            <code className="rounded bg-muted px-1">POST /api/public/capture</code>
          </p>
          <pre className="overflow-x-auto rounded-md bg-muted p-3 text-xs">{embedSnippet}</pre>
          <p className="text-muted-foreground">
            Atributos opcionais: data-mode=&quot;form&quot;, data-property=&quot;COD-001&quot;
          </p>
        </CardContent>
      </Card>

      <LeadCsvImportPanel canImport={canImport} />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">API — campos do webhook</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-1">
          <p><strong>Obrigatórios:</strong> name, phone</p>
          <p><strong>Opcionais:</strong> email, interest, city, state, source, propertyCode, externalId, portal</p>
          <p><strong>Origens:</strong> instagram, facebook, google, olx, zap, site, indicacao</p>
          <p><strong>Portais CSV:</strong> use coluna portal (olx, zap_imoveis) para rastreio</p>
        </CardContent>
      </Card>
    </section>
  );
}
