import { getFunnelLeads } from "@/actions/leads";
import { KanbanBoard } from "@/components/modules/funnel/kanban-board";

export const metadata = { title: "Funil de Vendas" };

export default async function FunnelPage() {
  const leads = await getFunnelLeads();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Funil de Vendas</h1>
        <p className="text-muted-foreground">Arraste os cards para mover leads entre as etapas do funil</p>
      </div>
      <KanbanBoard leads={leads} />
    </div>
  );
}
