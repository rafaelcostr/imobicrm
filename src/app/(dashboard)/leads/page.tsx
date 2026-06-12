import Link from "next/link";
import { getLeads } from "@/actions/leads";
import { PageHeader } from "@/components/layout/page-header";
import { Pagination } from "@/components/layout/pagination";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { pageMetadata } from "@/lib/metadata";
import { LEAD_SOURCE_LABELS, LEAD_STAGE_LABELS, LEAD_TEMPERATURE_LABELS } from "@/lib/labels";
import { Plus, Search } from "lucide-react";
import { formatDate } from "@/lib/utils";

export const metadata = pageMetadata("Leads", "Cadastre, filtre e acompanhe todos os seus leads.");

export default async function LeadsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const { q, page } = await searchParams;
  const result = await getLeads({ search: q, page });

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
            <form className="flex gap-2" role="search">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
                <Input name="q" defaultValue={q} placeholder="Buscar por nome, e-mail ou telefone..." className="pl-10" />
              </div>
              <Button type="submit" variant="secondary">
                Buscar
              </Button>
            </form>
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
                    <td className="py-3 pr-4">{lead.lastContactAt ? formatDate(lead.lastContactAt) : "—"}</td>
                    <td className="py-3">
                      <Badge variant={lead.temperature === "QUENTE" ? "hot" : lead.temperature === "FRIO" ? "cold" : "warning"}>
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
              params={{ q }}
            />
          </CardContent>
        </Card>
      </section>
    </section>
  );
}
