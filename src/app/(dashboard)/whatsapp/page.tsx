import { getWhatsAppData } from "@/features/whatsapp/actions";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { pageMetadata } from "@/lib/metadata";
import { MessageCircle } from "lucide-react";
import { WhatsAppChat } from "@/components/modules/whatsapp/whatsapp-chat";

export const metadata = pageMetadata(
  "WhatsApp",
  "Estrutura preparada para integração com a API do WhatsApp Business.",
);

export default async function WhatsAppPage() {
  const { leads, templates, messages } = await getWhatsAppData();

  return (
    <section className="space-y-6" aria-labelledby="page-title">
      <PageHeader
        title="WhatsApp"
        description="Estrutura preparada para integração futura com a API do WhatsApp Business"
      />

      <section aria-label="Conversas" className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader><CardTitle>Leads</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {leads.map((lead) => (
              <div key={lead.id} className="flex items-center justify-between rounded-lg border border-border p-3">
                <div>
                  <p className="font-medium">{lead.name}</p>
                  <p className="text-xs text-muted-foreground">{lead.whatsapp ?? lead.phone}</p>
                </div>
                <Button size="sm" variant="outline" asChild>
                  <a
                    href={`https://wa.me/55${(lead.whatsapp ?? lead.phone).replace(/\D/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Abrir WhatsApp de ${lead.name}`}
                  >
                    <MessageCircle className="h-4 w-4" />
                  </a>
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Histórico de mensagens</CardTitle></CardHeader>
          <CardContent>
            <WhatsAppChat leads={leads} templates={templates} messages={messages} />
          </CardContent>
        </Card>
      </section>

      <section aria-label="Templates de mensagem">
        <Card>
          <CardHeader><CardTitle>Templates de mensagem</CardTitle></CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            {templates.map((t) => (
              <div key={t.id} className="rounded-lg border border-border p-4">
                <p className="font-medium">{t.name}</p>
                <p className="mt-1 text-sm text-muted-foreground">{t.content}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>
    </section>
  );
}
