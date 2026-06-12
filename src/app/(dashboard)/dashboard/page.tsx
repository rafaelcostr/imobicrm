import { getDashboardStats } from "@/actions/dashboard";
import { KpiCard } from "@/components/modules/dashboard/kpi-card";
import { SalesChart, SourceChart, ConversionFunnel, BrokerRankingChart } from "@/components/modules/dashboard/charts";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { pageMetadata } from "@/lib/metadata";
import { LEAD_SOURCE_LABELS, LEAD_TEMPERATURE_LABELS, TASK_TYPE_LABELS } from "@/lib/labels";
import {
  Users,
  Building2,
  CalendarCheck,
  FileText,
  TrendingUp,
  Wallet,
  DollarSign,
  Percent,
} from "lucide-react";

export const metadata = pageMetadata(
  "Dashboard",
  "Visão geral do desempenho da sua operação imobiliária.",
);

export default async function DashboardPage() {
  const stats = await getDashboardStats();

  return (
    <section className="space-y-6" aria-labelledby="page-title">
      <PageHeader
        title="Dashboard"
        description="Visão geral do desempenho da sua operação imobiliária"
      />

      <section aria-labelledby="kpis-heading">
        <h2 id="kpis-heading" className="sr-only">Indicadores principais</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4">
          <KpiCard title="Total de Leads" value={stats.kpis.totalLeads} trend={stats.kpis.leadTrend} icon={Users} />
          <KpiCard title="Total de Imóveis" value={stats.kpis.totalProperties} icon={Building2} />
          <KpiCard title="Visitas Agendadas" value={stats.kpis.scheduledVisits} trend={stats.kpis.visitTrend} icon={CalendarCheck} />
          <KpiCard title="Propostas Enviadas" value={stats.kpis.proposalsSent} trend={stats.kpis.proposalTrend} icon={FileText} />
          <KpiCard title="Vendas Fechadas" value={stats.kpis.closedSales} trend={stats.kpis.salesTrend} icon={TrendingUp} />
          <KpiCard title="Comissão Prevista" value={stats.kpis.commissionPending} icon={Wallet} />
          <KpiCard title="Comissão Recebida" value={stats.kpis.commissionPaid} icon={DollarSign} />
          <KpiCard title="Taxa de Conversão" value={stats.kpis.conversionRate} trend={stats.kpis.conversionTrend} icon={Percent} />
        </div>
      </section>

      <section aria-labelledby="charts-heading" className="grid gap-4 lg:grid-cols-2">
        <h2 id="charts-heading" className="sr-only">Gráficos de desempenho</h2>
        <SalesChart data={stats.salesByMonth} />
        <SourceChart data={stats.sourceChart} />
      </section>

      <section aria-labelledby="funnel-heading" className="grid gap-4 lg:grid-cols-2">
        <h2 id="funnel-heading" className="sr-only">Funil e ranking de corretores</h2>
        <ConversionFunnel data={stats.funnelData} />
        <BrokerRankingChart data={stats.brokerRanking} />
      </section>

      <section aria-labelledby="activity-heading" className="grid gap-4 lg:grid-cols-2">
        <h2 id="activity-heading" className="sr-only">Atividade recente</h2>
        <Card>
          <CardHeader>
            <CardTitle>Leads recentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.recentLeads.map((lead) => (
                <div key={lead.id} className="flex items-center justify-between rounded-lg border border-border p-3">
                  <div>
                    <p className="font-medium">{lead.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {LEAD_SOURCE_LABELS[lead.source]} · {lead.broker?.name ?? "Sem corretor"}
                    </p>
                  </div>
                  <Badge variant={lead.temperature === "QUENTE" ? "hot" : lead.temperature === "FRIO" ? "cold" : "warning"}>
                    {LEAD_TEMPERATURE_LABELS[lead.temperature]}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Atividades de hoje</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.todayTasks.map((task) => (
                <div key={task.id} className="flex gap-3 rounded-lg border border-border p-3">
                  <div className="text-xs font-medium text-primary">
                    {formatDateTime(task.startAt).split(",")[1]?.trim()}
                  </div>
                  <div>
                    <p className="font-medium">{task.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {TASK_TYPE_LABELS[task.type]}
                      {task.lead ? ` · ${task.lead.name}` : ""}
                    </p>
                  </div>
                </div>
              ))}
              {stats.todayTasks.length === 0 && (
                <p className="text-sm text-muted-foreground">Nenhuma atividade agendada para hoje</p>
              )}
            </div>
          </CardContent>
        </Card>
      </section>

      <section aria-labelledby="featured-heading">
        <h2 id="featured-heading" className="sr-only">Imóveis em destaque</h2>
        <Card>
          <CardHeader>
            <CardTitle>Imóveis em destaque</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {stats.featuredProperties.map((property) => (
                <div key={property.id} className="overflow-hidden rounded-lg border border-border">
                  <div className="flex h-32 items-center justify-center bg-muted">
                    <Building2 className="h-10 w-10 text-muted-foreground" aria-hidden="true" />
                  </div>
                  <div className="p-3">
                    <p className="font-medium line-clamp-1">{property.title}</p>
                    <p className="text-sm font-semibold text-primary">{formatCurrency(Number(property.price))}</p>
                    <p className="text-xs text-muted-foreground">
                      {property.bedrooms} quartos · {property.bathrooms} banheiros · {property.garages} vagas
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>
    </section>
  );
}
