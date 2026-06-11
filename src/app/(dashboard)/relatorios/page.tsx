import { ReportsPanel } from "@/components/modules/reports/reports-panel";

export const metadata = { title: "Relatórios" };

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Relatórios</h1>
        <p className="text-muted-foreground">Gere e exporte relatórios de leads, vendas, corretores e comissões</p>
      </div>
      <ReportsPanel />
    </div>
  );
}
