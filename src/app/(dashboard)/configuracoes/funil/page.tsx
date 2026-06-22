import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { pageMetadata } from "@/lib/metadata";
import { FUNNEL_STAGES, LEAD_STAGE_LABELS } from "@/lib/labels";

export const metadata = pageMetadata("Funil de vendas", "Etapas do pipeline comercial.");

export default function FunnelSettingsPage() {
  return (
    <section className="space-y-6" aria-labelledby="page-title">
      <PageHeader
        title="Funil de vendas"
        description="Etapas atuais do pipeline (customização avançada na Fase 3)"
      />
      <Card>
        <CardHeader>
          <CardTitle>Etapas configuradas</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="space-y-2">
            {FUNNEL_STAGES.map((stage, index) => (
              <li
                key={stage}
                className="flex items-center gap-3 rounded-lg border border-border px-4 py-3 text-sm"
              >
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                  {index + 1}
                </span>
                {LEAD_STAGE_LABELS[stage]}
              </li>
            ))}
          </ol>
          <p className="mt-4 text-sm text-muted-foreground">
            Para renomear ou adicionar etapas customizadas, será necessária uma atualização
            do schema na próxima fase do roadmap.
          </p>
        </CardContent>
      </Card>
    </section>
  );
}
