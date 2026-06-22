import { getCommissions, getCommissionSummary } from "@/features/commissions/actions";
import { CommissionStatusSelect } from "@/features/commissions/components/commission-status-select";
import { PageHeader } from "@/components/layout/page-header";
import { Pagination } from "@/components/layout/pagination";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { pageMetadata } from "@/lib/metadata";
import { formatCurrency, formatDate } from "@/lib/utils";
import { auth } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import type { Role } from "@prisma/client";

export const metadata = pageMetadata("Comissões", "Controle financeiro de comissões por venda.");

export default async function CommissionsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page } = await searchParams;
  const session = await auth();
  const canManage = session?.user?.role
    ? hasPermission(session.user.role as Role, "commissions:manage")
    : false;

  const [result, summary] = await Promise.all([
    getCommissions({ page }),
    getCommissionSummary(),
  ]);

  return (
    <section className="space-y-6" aria-labelledby="page-title">
      <PageHeader title="Comissões" description="Controle financeiro de comissões por venda" />

      <section aria-label="Resumo financeiro" className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-sm text-muted-foreground">Total pendente</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">{formatCurrency(summary.totalPending)}</p></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-sm text-muted-foreground">Total pago (mês)</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold text-emerald-500">{formatCurrency(summary.totalPaid)}</p></CardContent>
        </Card>
      </section>

      <section aria-label="Relatório mensal">
        <Card>
          <CardHeader><CardTitle>Relatório mensal</CardTitle></CardHeader>
          <CardContent className="overflow-x-auto">
            <table className="w-full text-sm">
              <caption className="sr-only">Comissões do mês corrente</caption>
              <thead>
                <tr className="border-b border-border text-left text-muted-foreground">
                  <th scope="col" className="pb-3 pr-4">Imóvel</th>
                  <th scope="col" className="pb-3 pr-4">Corretor</th>
                  <th scope="col" className="pb-3 pr-4">Valor do imóvel</th>
                  <th scope="col" className="pb-3 pr-4">Percentual</th>
                  <th scope="col" className="pb-3 pr-4">Comissão</th>
                  <th scope="col" className="pb-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {result.items.map((c) => (
                  <tr key={c.id} className="border-b border-border/50">
                    <td className="py-3 pr-4">{c.sale.property.title}</td>
                    <td className="py-3 pr-4">{c.broker.name}</td>
                    <td className="py-3 pr-4">{formatCurrency(Number(c.propertyValue))}</td>
                    <td className="py-3 pr-4">{Number(c.percentage)}%</td>
                    <td className="py-3 pr-4 font-semibold">{formatCurrency(Number(c.amount))}</td>
                    <td className="py-3">
                      <CommissionStatusSelect
                        commissionId={c.id}
                        status={c.status}
                        canManage={canManage}
                      />
                      {c.paidAt && (
                        <p className="mt-1 text-xs text-muted-foreground">
                          Pago em {formatDate(c.paidAt)}
                        </p>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {result.items.length === 0 && (
              <p className="py-8 text-center text-muted-foreground">Nenhuma comissão neste período</p>
            )}
            <Pagination
              page={result.page}
              totalPages={result.totalPages}
              total={result.total}
              basePath="/comissoes"
            />
          </CardContent>
        </Card>
      </section>
    </section>
  );
}
