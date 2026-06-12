import Link from "next/link";
import { getLeadOptions } from "@/actions/leads";
import { getPropertyOptions } from "@/actions/properties";
import { getVisits, getProposals, getSales } from "@/features/deals/actions";
import { PageHeader } from "@/components/layout/page-header";
import { Pagination } from "@/components/layout/pagination";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { VisitForm, ProposalForm, SaleForm } from "@/features/deals/components/deal-forms";
import { VisitCompleteToggle } from "@/features/deals/components/visit-complete-toggle";
import { pageMetadata } from "@/lib/metadata";
import { COMMISSION_STATUS_LABELS } from "@/lib/labels";
import { formatCurrency, formatDateTime, cn } from "@/lib/utils";

export const metadata = pageMetadata(
  "Negociações",
  "Visitas, propostas e vendas do pipeline comercial.",
);

const TABS = [
  { id: "visitas", label: "Visitas" },
  { id: "propostas", label: "Propostas" },
  { id: "vendas", label: "Vendas" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export default async function NegociosPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; page?: string }>;
}) {
  const { tab: rawTab, page } = await searchParams;
  const tab: TabId = TABS.some((t) => t.id === rawTab) ? (rawTab as TabId) : "visitas";

  const [leads, properties, visits, proposals, sales] = await Promise.all([
    getLeadOptions(),
    getPropertyOptions(true),
    tab === "visitas" ? getVisits({ page }) : null,
    tab === "propostas" ? getProposals({ page }) : null,
    tab === "vendas" ? getSales({ page }) : null,
  ]);

  const paginationParams = { tab, page: page && page !== "1" ? page : undefined };

  return (
    <section className="space-y-6" aria-labelledby="page-title">
      <PageHeader
        title="Negociações"
        description="Gerencie visitas, propostas e vendas do pipeline comercial"
      />

      <nav className="flex gap-1 rounded-lg border border-border p-1" aria-label="Abas de negociações">
        {TABS.map((t) => (
          <Link
            key={t.id}
            href={`/negocios?tab=${t.id}`}
            className={cn(
              "flex-1 rounded-md px-4 py-2 text-center text-sm font-medium transition-colors",
              tab === t.id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted",
            )}
            aria-current={tab === t.id ? "page" : undefined}
          >
            {t.label}
          </Link>
        ))}
      </nav>

      {tab === "visitas" && visits && (
        <section aria-labelledby="visitas-heading" className="space-y-4">
          <h2 id="visitas-heading" className="sr-only">Visitas agendadas</h2>
          <VisitForm leads={leads} properties={properties} />
          <Card>
            <CardHeader><CardTitle>Visitas agendadas</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {visits.items.map((v) => (
                <div key={v.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border p-4">
                  <div>
                    <p className="font-medium">{v.lead.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {v.property.code} — {v.property.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDateTime(v.scheduledAt)} · {v.broker.name}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={v.completed ? "success" : "secondary"}>
                      {v.completed ? "Concluída" : "Pendente"}
                    </Badge>
                    <VisitCompleteToggle visitId={v.id} completed={v.completed} />
                  </div>
                </div>
              ))}
              {visits.items.length === 0 && (
                <p className="py-6 text-center text-muted-foreground">Nenhuma visita agendada</p>
              )}
              <Pagination
                page={visits.page}
                totalPages={visits.totalPages}
                total={visits.total}
                basePath="/negocios"
                params={paginationParams}
              />
            </CardContent>
          </Card>
        </section>
      )}

      {tab === "propostas" && proposals && (
        <section aria-labelledby="propostas-heading" className="space-y-4">
          <h2 id="propostas-heading" className="sr-only">Propostas enviadas</h2>
          <ProposalForm leads={leads} properties={properties} />
          <Card>
            <CardHeader><CardTitle>Propostas enviadas</CardTitle></CardHeader>
            <CardContent className="overflow-x-auto">
              <table className="w-full text-sm">
                <caption className="sr-only">Lista de propostas comerciais</caption>
                <thead>
                  <tr className="border-b border-border text-left text-muted-foreground">
                    <th scope="col" className="pb-3 pr-4">Lead</th>
                    <th scope="col" className="pb-3 pr-4">Imóvel</th>
                    <th scope="col" className="pb-3 pr-4">Valor</th>
                    <th scope="col" className="pb-3 pr-4">Corretor</th>
                    <th scope="col" className="pb-3">Enviada em</th>
                  </tr>
                </thead>
                <tbody>
                  {proposals.items.map((p) => (
                    <tr key={p.id} className="border-b border-border/50">
                      <td className="py-3 pr-4">{p.lead.name}</td>
                      <td className="py-3 pr-4">{p.property.title}</td>
                      <td className="py-3 pr-4 font-semibold">{formatCurrency(Number(p.amount))}</td>
                      <td className="py-3 pr-4">{p.broker.name}</td>
                      <td className="py-3">{formatDateTime(p.sentAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {proposals.items.length === 0 && (
                <p className="py-6 text-center text-muted-foreground">Nenhuma proposta registrada</p>
              )}
              <Pagination
                page={proposals.page}
                totalPages={proposals.totalPages}
                total={proposals.total}
                basePath="/negocios"
                params={paginationParams}
              />
            </CardContent>
          </Card>
        </section>
      )}

      {tab === "vendas" && sales && (
        <section aria-labelledby="vendas-heading" className="space-y-4">
          <h2 id="vendas-heading" className="sr-only">Vendas fechadas</h2>
          <SaleForm leads={leads} properties={properties} />
          <Card>
            <CardHeader><CardTitle>Vendas fechadas</CardTitle></CardHeader>
            <CardContent className="overflow-x-auto">
              <table className="w-full text-sm">
                <caption className="sr-only">Lista de vendas registradas</caption>
                <thead>
                  <tr className="border-b border-border text-left text-muted-foreground">
                    <th scope="col" className="pb-3 pr-4">Imóvel</th>
                    <th scope="col" className="pb-3 pr-4">Valor</th>
                    <th scope="col" className="pb-3 pr-4">Corretor</th>
                    <th scope="col" className="pb-3 pr-4">Comissão</th>
                    <th scope="col" className="pb-3">Fechamento</th>
                  </tr>
                </thead>
                <tbody>
                  {sales.items.map((s) => (
                    <tr key={s.id} className="border-b border-border/50">
                      <td className="py-3 pr-4">
                        <p className="font-medium">{s.property.title}</p>
                        <p className="text-xs text-muted-foreground">{s.property.code}</p>
                      </td>
                      <td className="py-3 pr-4 font-semibold">{formatCurrency(Number(s.amount))}</td>
                      <td className="py-3 pr-4">{s.broker.name}</td>
                      <td className="py-3 pr-4">
                        {s.commission ? (
                          <>
                            <span>{formatCurrency(Number(s.commission.amount))}</span>
                            <Badge variant="secondary" className="ml-2">
                              {COMMISSION_STATUS_LABELS[s.commission.status]}
                            </Badge>
                          </>
                        ) : "—"}
                      </td>
                      <td className="py-3">{formatDateTime(s.closedAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {sales.items.length === 0 && (
                <p className="py-6 text-center text-muted-foreground">Nenhuma venda registrada</p>
              )}
              <Pagination
                page={sales.page}
                totalPages={sales.totalPages}
                total={sales.total}
                basePath="/negocios"
                params={paginationParams}
              />
            </CardContent>
          </Card>
        </section>
      )}
    </section>
  );
}
