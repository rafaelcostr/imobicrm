import { getBrokerProfile } from "@/features/broker/actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { pageMetadata } from "@/lib/metadata";
import { formatCurrency } from "@/lib/utils";
import { User, Target, TrendingUp, CalendarCheck, FileText, DollarSign } from "lucide-react";

export const metadata = pageMetadata("Área do Corretor", "Perfil, metas e estatísticas de desempenho.");

export default async function BrokerPage() {
  const profile = await getBrokerProfile();
  if (!profile) return null;

  const stats = [
    { label: "Leads recebidos", value: profile.stats.leadsReceived, icon: User },
    { label: "Leads convertidos", value: profile.stats.leadsConverted, icon: TrendingUp },
    { label: "Visitas realizadas", value: profile.stats.visitsDone, icon: CalendarCheck },
    { label: "Propostas enviadas", value: profile.stats.proposalsSent, icon: FileText },
    { label: "Vendas fechadas", value: profile.stats.salesClosed, icon: Target },
    {
      label: "Comissão gerada",
      value: formatCurrency(profile.stats.commissionGenerated),
      icon: DollarSign,
    },
  ];

  return (
    <section className="space-y-6" aria-labelledby="page-title">
      <header className="flex flex-col gap-6 sm:flex-row sm:items-center">
        <div
          className="flex h-24 w-24 items-center justify-center rounded-full bg-primary/10 text-3xl font-bold text-primary"
          aria-hidden="true"
        >
          {profile.name.charAt(0)}
        </div>
        <div>
          <h1 id="page-title" className="text-2xl font-bold">{profile.name}</h1>
          <p className="text-muted-foreground">CRECI: {profile.creci ?? "—"} · {profile.email}</p>
          <p className="text-muted-foreground">{profile.phone ?? "—"}</p>
          {profile.monthlyGoal && (
            <p className="mt-2 text-sm">
              <span className="text-muted-foreground">Meta mensal:</span>{" "}
              <strong>{formatCurrency(Number(profile.monthlyGoal))}</strong>
            </p>
          )}
        </div>
      </header>

      <section aria-label="Estatísticas do corretor" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{stat.label}</CardTitle>
                <Icon className="h-4 w-4 text-primary" aria-hidden="true" />
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{stat.value}</p>
              </CardContent>
            </Card>
          );
        })}
      </section>
    </section>
  );
}
