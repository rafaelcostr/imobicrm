import { ReportsPanel } from "@/components/modules/reports/reports-panel";
import { PageHeader } from "@/components/layout/page-header";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata(
  "Relatórios",
  "Gere e exporte relatórios de leads, vendas, corretores e comissões.",
);

export default function ReportsPage() {
  return (
    <section className="space-y-6" aria-labelledby="page-title">
      <PageHeader
        title="Relatórios"
        description="Gere e exporte relatórios de leads, vendas, corretores e comissões"
      />
      <section aria-label="Painel de relatórios">
        <ReportsPanel />
      </section>
    </section>
  );
}
