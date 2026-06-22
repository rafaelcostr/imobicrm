import Link from "next/link";
import { LeadSource, LeadStage, LeadTemperature, Role } from "@prisma/client";
import { getLeads } from "@/actions/leads";
import { getActiveBrokers } from "@/lib/lead-assignment";
import { auth } from "@/lib/auth";
import { LeadFilters } from "@/features/leads/components/lead-filters";
import { PageHeader } from "@/components/layout/page-header";
import { Pagination } from "@/components/layout/pagination";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { pageMetadata } from "@/lib/metadata";
import { LEAD_SOURCE_LABELS, LEAD_STAGE_LABELS, LEAD_TEMPERATURE_LABELS } from "@/lib/labels";
import { Plus } from "lucide-react";
import { formatDate } from "@/lib/utils";

export const metadata = pageMetadata("Leads", "Cadastre, filtre e acompanhe todos os seus leads.");

export default async function LeadsPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    page?: string;
    source?: string;
    stage?: string;
    temperature?: string;
    brokerId?: string;
  }>;
}) {
  const params = await searchParams;
  const session = await auth();
  const role = session?.user?.role as Role | undefined;
  const showBrokerFilter = role !== "CORRETOR";

  const [result, brokers] = await Promise.all([
    getLeads({
      search: params.q,
      page: params.page,
      source: params.source as LeadSource | undefined,
      stage: params.stage as LeadStage | undefined,
      temperature: params.temperature as LeadTemperature | undefined,
      brokerId: params.brokerId,
    }),
    showBrokerFilter && session?.user?.organizationId
      ? getActiveBrokers(session.user.organizationId)
      : Promise.resolve([]),
  ]);

  const paginationParams = {
    q: params.q,
    source: params.source,
    stage: params.stage,
    temperature: params.temperature,
    brokerId: params.brokerId,
    page: params.page && params.page !== "1" ? params.page : undefined,
  };

  return (
    <section className="space-y-6" aria-labelledby="page-title">
      <PageHeader
        title="Gestão de Leads"
        description="Cadastre, filtre e acompanhe todos os seus leads"
        actions={
          <Button asChild>
            <Link href="/leads/novo">
              <Plus className="mr-2 h-4 w-4" />
              Novo Lead
            </Link>
          </Button>
        }
      />

      <section aria-label="Lista de leads">
        <Card>
          <CardHeader>
            <LeadFilters
              brokers={brokers}
              showBrokerFilter={showBrokerFilter}
              values={{
                q: params.q,
                source: params.source,
                stage: params.stage,
                temperature: params.temperature,
                brokerId: params.brokerId,
              }}
            />
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <table className="w-full text-sm">
              <caption className="sr-only">Lista de leads cadastrados</caption>
              <thead>
                <tr className="border-b border-border text-left text-muted-foreground">
                  <th scope="col" className="pb-3 pr-4 font-medium">Nome</th>
                  <th scope="col" className="pb-3 pr-4 font-medium">Origem</th>
                  <th scope="col" className="pb-3 pr-4 font-medium">Etapa</th>
                  <th scope="col" className="pb-3 pr-4 font-medium">Último contato</th>
                  <th scope="col" className="pb-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {result.items.map((lead) => (
                  <tr key={lead.id} className="border-b border-border/50 hover:bg-muted/50">
                    <td className="py-3 pr-4">
                      <Link href={`/leads/${lead.id}`} className="font-medium hover:text-primary">
                        {lead.name}
                      </Link>
                      <p className="text-xs text-muted-foreground">{lead.phone}</p>
                    </td>
                    <td className="py-3 pr-4">{LEAD_SOURCE_LABELS[lead.source]}</td>
                    <td className="py-3 pr-4">{LEAD_STAGE_LABELS[lead.stage]}</td>
                    <td className="py-3 pr-4">
                      {lead.lastContactAt ? formatDate(lead.lastContactAt) : "—"}
                    </td>
                    <td className="py-3">
                      <Badge
                        variant={
                          lead.temperature === "QUENTE"
                            ? "hot"
                            : lead.temperature === "FRIO"
                              ? "cold"
                              : "warning"
                        }
                      >
                        {LEAD_TEMPERATURE_LABELS[lead.temperature]}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {result.items.length === 0 && (
              <p className="py-8 text-center text-muted-foreground">Nenhum lead encontrado</p>
            )}
            <Pagination
              page={result.page}
              totalPages={result.totalPages}
              total={result.total}
              basePath="/leads"
              params={paginationParams}
            />
          </CardContent>
        </Card>
      </section>
    </section>
  );
}
