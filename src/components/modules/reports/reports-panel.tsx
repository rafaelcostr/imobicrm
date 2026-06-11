"use client";

import { useState } from "react";
import { generateReport } from "@/actions/modules";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Download } from "lucide-react";
import { toast } from "sonner";

const REPORT_TYPES = [
  { type: "LEADS" as const, label: "Leads", description: "Todos os leads cadastrados" },
  { type: "VENDAS" as const, label: "Vendas", description: "Histórico de vendas fechadas" },
  { type: "CORRETORES" as const, label: "Corretores", description: "Desempenho por corretor" },
  { type: "IMOVEIS" as const, label: "Imóveis", description: "Portfólio completo de imóveis" },
  { type: "COMISSOES" as const, label: "Comissões", description: "Comissões por status e período" },
];

export function ReportsPanel() {
  const [loading, setLoading] = useState<string | null>(null);

  async function handleGenerate(type: typeof REPORT_TYPES[number]["type"]) {
    setLoading(type);
    try {
      const report = await generateReport(type);
      toast.success(`Relatório "${report.title}" gerado com sucesso`);

      const blob = new Blob([JSON.stringify(report.data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `imobicrm-${type.toLowerCase()}-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error("Erro ao gerar relatório");
    } finally {
      setLoading(null);
    }
  }

  function exportCsv() {
    toast.info("Exportação Excel disponível após conectar biblioteca xlsx em produção");
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {REPORT_TYPES.map((report) => (
        <Card key={report.type}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <FileText className="h-5 w-5 text-primary" />
              {report.label}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">{report.description}</p>
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={() => handleGenerate(report.type)}
                disabled={loading === report.type}
              >
                {loading === report.type ? "Gerando..." : "Gerar PDF/JSON"}
              </Button>
              <Button size="sm" variant="outline" onClick={() => exportCsv()}>
                <Download className="mr-1 h-4 w-4" />
                Excel
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
