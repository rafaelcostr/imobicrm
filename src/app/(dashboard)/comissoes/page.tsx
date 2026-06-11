import { getCommissions } from "@/actions/modules";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { COMMISSION_STATUS_LABELS } from "@/lib/labels";
import { formatCurrency, formatDate } from "@/lib/utils";

export const metadata = { title: "Comissões" };

const statusVariant = {
  PENDENTE: "warning" as const,
  EM_PROCESSAMENTO: "secondary" as const,
  PAGO: "success" as const,
};

export default async function CommissionsPage() {
  const commissions = await getCommissions();

  const totalPending = commissions
    .filter((c) => c.status !== "PAGO")
    .reduce((s, c) => s + Number(c.amount), 0);
  const totalPaid = commissions
    .filter((c) => c.status === "PAGO")
    .reduce((s, c) => s + Number(c.amount), 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Comissões</h1>
        <p className="text-muted-foreground">Controle financeiro de comissões por venda</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-sm text-muted-foreground">Total pendente</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">{formatCurrency(totalPending)}</p></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-sm text-muted-foreground">Total pago (mês)</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold text-emerald-500">{formatCurrency(totalPaid)}</p></CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Relatório mensal</CardTitle></CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-muted-foreground">
                <th className="pb-3 pr-4">Imóvel</th>
                <th className="pb-3 pr-4">Corretor</th>
                <th className="pb-3 pr-4">Valor do imóvel</th>
                <th className="pb-3 pr-4">Percentual</th>
                <th className="pb-3 pr-4">Comissão</th>
                <th className="pb-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {commissions.map((c) => (
                <tr key={c.id} className="border-b border-border/50">
                  <td className="py-3 pr-4">{c.sale.property.title}</td>
                  <td className="py-3 pr-4">{c.broker.name}</td>
                  <td className="py-3 pr-4">{formatCurrency(Number(c.propertyValue))}</td>
                  <td className="py-3 pr-4">{Number(c.percentage)}%</td>
                  <td className="py-3 pr-4 font-semibold">{formatCurrency(Number(c.amount))}</td>
                  <td className="py-3">
                    <Badge variant={statusVariant[c.status]}>{COMMISSION_STATUS_LABELS[c.status]}</Badge>
                    {c.paidAt && <p className="text-xs text-muted-foreground">{formatDate(c.paidAt)}</p>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
