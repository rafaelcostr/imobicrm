import { notFound } from "next/navigation";
import { getLeadById } from "@/actions/leads";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LEAD_SOURCE_LABELS, LEAD_STAGE_LABELS, LEAD_TEMPERATURE_LABELS } from "@/lib/labels";
import { formatDateTime } from "@/lib/utils";
import { LeadNotesForm } from "@/components/modules/leads/lead-notes-form";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const lead = await getLeadById(id);
  return { title: lead ? `Lead — ${lead.name}` : "Lead" };
}

export default async function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const lead = await getLeadById(id);
  if (!lead) notFound();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{lead.name}</h1>
          <p className="text-muted-foreground">{lead.phone} · {lead.email ?? "Sem e-mail"}</p>
        </div>
        <div className="flex gap-2">
          <Badge variant={lead.temperature === "QUENTE" ? "hot" : lead.temperature === "FRIO" ? "cold" : "warning"}>
            {LEAD_TEMPERATURE_LABELS[lead.temperature]}
          </Badge>
          <Badge variant="secondary">{LEAD_STAGE_LABELS[lead.stage]}</Badge>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
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
            <p><span className="text-muted-foreground">Observações:</span> {lead.notes ?? "—"}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Histórico</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {lead.histories.map((h) => (
                <div key={h.id} className="border-l-2 border-primary/30 pl-3">
                  <p className="text-sm font-medium">{h.description ?? h.action}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDateTime(h.createdAt)} · {h.user?.name ?? "Sistema"}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Notas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <LeadNotesForm leadId={lead.id} />
          {lead.leadNotes.map((note) => (
            <div key={note.id} className="rounded-lg border border-border p-3">
              <p className="text-sm">{note.content}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {note.user.name} · {formatDateTime(note.createdAt)}
              </p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
