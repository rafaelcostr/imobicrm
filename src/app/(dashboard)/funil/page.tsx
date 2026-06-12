import { getFunnelLeads } from "@/actions/leads";
import { KanbanBoard } from "@/components/modules/funnel/kanban-board";
import { PageHeader } from "@/components/layout/page-header";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata(
  "Funil de Vendas",
  "Arraste os cards para mover leads entre as etapas do funil.",
);

export default async function FunnelPage() {
  const leads = await getFunnelLeads();

  return (
    <section className="space-y-6" aria-labelledby="page-title">
      <PageHeader
        title="Funil de Vendas"
        description="Arraste os cards para mover leads entre as etapas do funil"
      />
      <section aria-label="Quadro Kanban">
        <KanbanBoard leads={leads} />
      </section>
    </section>
  );
}
