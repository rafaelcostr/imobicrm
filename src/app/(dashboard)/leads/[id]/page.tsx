import Link from "next/link";
import { notFound } from "next/navigation";
import { getLeadById, findLeadDuplicates } from "@/actions/leads";
import { getLeadTimeline } from "@/features/leads/timeline";
import {
  LeadDuplicateAlert,
  LeadTimeline,
} from "@/features/leads/components/lead-timeline";
import { auth } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import { getActiveBrokers } from "@/lib/lead-assignment";
import { getPropertyMatchesForLead } from "@/features/leads/matching";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LeadActions } from "@/features/leads/components/lead-actions";
import { LeadAssignBroker } from "@/features/leads/components/lead-assign-broker";
import { LeadPropertyMatches } from "@/features/leads/components/lead-property-matches";
import { LeadAttachments } from "@/features/leads/components/lead-attachments";
import { LeadNotesForm } from "@/components/modules/leads/lead-notes-form";
import { LEAD_SOURCE_LABELS, LEAD_STAGE_LABELS, LEAD_TEMPERATURE_LABELS } from "@/lib/labels";
import { formatDateTime } from "@/lib/utils";
import { getLeadWhatsAppMessages } from "@/features/whatsapp/actions";
import { LeadWhatsAppInbox } from "@/features/whatsapp/components/lead-whatsapp-inbox";
import { getLeadEmails } from "@/features/email/actions";
import { LeadEmailPanel } from "@/features/email/components/lead-email-panel";
import type { Role } from "@prisma/client";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const lead = await getLeadById(id);
  return { title: lead ? `Lead — ${lead.name}` : "Lead" };
}

export default async function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const lead = await getLeadById(id);
  if (!lead) notFound();

  const session = await auth();
  const role = session?.user?.role as Role | undefined;
  const canEdit = role ? hasPermission(role, "leads:edit") : false;
  const canDelete = role ? hasPermission(role, "leads:delete") : false;
  const canAssign = role ? hasPermission(role, "leads:assign") : false;
  const organizationId = session?.user?.organizationId;

  const [matches, brokers, timeline, duplicates, whatsappInbox, emailData] =
    await Promise.all([
    getPropertyMatchesForLead(id).catch(() => []),
    canAssign && organizationId ? getActiveBrokers(organizationId) : Promise.resolve([]),
    getLeadTimeline(id),
    findLeadDuplicates({
      leadId: id,
      phone: lead.phone,
      email: lead.email ?? undefined,
    }),
    getLeadWhatsAppMessages(id).catch(() => null),
    getLeadEmails(id).catch(() => null),
  ]);

  return (
    <section className="space-y-6" aria-labelledby="page-title">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 id="page-title" className="text-2xl font-bold">{lead.name}</h1>
          <p className="text-muted-foreground">{lead.phone} · {lead.email ?? "Sem e-mail"}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={lead.temperature === "QUENTE" ? "hot" : lead.temperature === "FRIO" ? "cold" : "warning"}>
            {LEAD_TEMPERATURE_LABELS[lead.temperature]}
          </Badge>
          <Badge variant="secondary">{LEAD_STAGE_LABELS[lead.stage]}</Badge>
          <LeadActions leadId={lead.id} canEdit={canEdit} canDelete={canDelete} />
        </div>
      </header>

      <LeadDuplicateAlert duplicates={duplicates} currentId={lead.id} />

      {canAssign && brokers.length > 0 && (
        <section aria-label="Atribuição de corretor">
          <Card>
            <CardHeader>
              <CardTitle>Roleta / Atribuição</CardTitle>
            </CardHeader>
            <CardContent>
              <LeadAssignBroker
                leadId={lead.id}
                currentBrokerId={lead.brokerId}
                brokers={brokers}
              />
            </CardContent>
          </Card>
        </section>
      )}

      <section aria-label="Detalhes do lead">
        <Card>
          <CardHeader>
            <CardTitle>Dados do lead</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p><span className="text-muted-foreground">Origem:</span> {LEAD_SOURCE_LABELS[lead.source]}</p>
            <p><span className="text-muted-foreground">Cidade:</span> {lead.city ?? "—"} / {lead.state ?? "—"}</p>
            <p><span className="text-muted-foreground">Interesse:</span> {lead.interest ?? "—"}</p>
            <p><span className="text-muted-foreground">Faixa de preço:</span> {lead.priceRange ?? "—"}</p>
            <p><span className="text-muted-foreground">Corretor:</span> {lead.broker?.name ?? "—"}</p>
            {lead.property && (
              <p>
                <span className="text-muted-foreground">Imóvel vinculado:</span>{" "}
                <Link href={`/imoveis/${lead.property.id}`} className="text-primary hover:underline">
                  {lead.property.code} — {lead.property.title}
                </Link>
              </p>
            )}
            <p>
              <span className="text-muted-foreground">Consentimento LGPD:</span>{" "}
              {lead.lgpdConsentAt ? (
                <>
                  Aceito em {formatDateTime(lead.lgpdConsentAt)}
                  {lead.lgpdConsentVersion ? ` (v${lead.lgpdConsentVersion})` : ""}
                </>
              ) : (
                "Não registrado"
              )}
            </p>
            <p><span className="text-muted-foreground">Observações:</span> {lead.notes ?? "—"}</p>
          </CardContent>
        </Card>
      </section>

      <section aria-label="Linha do tempo">
        <Card>
          <CardHeader>
            <CardTitle>Linha do tempo</CardTitle>
          </CardHeader>
          <CardContent>
            <LeadTimeline entries={timeline} />
          </CardContent>
        </Card>
      </section>

      <section aria-label="WhatsApp">
        <Card>
          <CardHeader>
            <CardTitle>WhatsApp</CardTitle>
          </CardHeader>
          <CardContent>
            {whatsappInbox ? (
              <LeadWhatsAppInbox
                leadId={whatsappInbox.lead.id}
                leadName={whatsappInbox.lead.name}
                messages={whatsappInbox.messages}
                templates={whatsappInbox.templates}
                apiConfigured={whatsappInbox.apiConfigured}
                waMeUrl={whatsappInbox.waMeUrl}
                compact
              />
            ) : (
              <p className="text-sm text-muted-foreground">
                Sem permissão para visualizar WhatsApp.
              </p>
            )}
          </CardContent>
        </Card>
      </section>

      <section aria-label="E-mail">
        <Card>
          <CardHeader>
            <CardTitle>E-mail</CardTitle>
          </CardHeader>
          <CardContent>
            {emailData ? (
              <LeadEmailPanel
                leadId={emailData.lead.id}
                leadName={emailData.lead.name}
                leadEmail={emailData.lead.email}
                emails={emailData.emails}
                smtpConfigured={emailData.smtpConfigured}
                canSend={canEdit}
                compact
              />
            ) : (
              <p className="text-sm text-muted-foreground">
                Sem permissão para visualizar e-mails.
              </p>
            )}
          </CardContent>
        </Card>
      </section>

      <section aria-label="Imóveis sugeridos">
        <Card>
          <CardHeader>
            <CardTitle>Imóveis sugeridos</CardTitle>
          </CardHeader>
          <CardContent>
            <LeadPropertyMatches
              leadId={lead.id}
              matches={matches}
              linkedPropertyId={lead.propertyId}
              canEdit={canEdit}
            />
          </CardContent>
        </Card>
      </section>

      <section aria-label="Anexos do lead">
        <Card>
          <CardHeader>
            <CardTitle>Anexos</CardTitle>
          </CardHeader>
          <CardContent>
            <LeadAttachments
              leadId={lead.id}
              attachments={lead.attachments}
              canEdit={canEdit}
            />
          </CardContent>
        </Card>
      </section>

      <section aria-label="Notas do lead">
        <Card>
          <CardHeader>
            <CardTitle>Adicionar nota</CardTitle>
          </CardHeader>
          <CardContent>
            <LeadNotesForm leadId={lead.id} />
          </CardContent>
        </Card>
      </section>
    </section>
  );
}
