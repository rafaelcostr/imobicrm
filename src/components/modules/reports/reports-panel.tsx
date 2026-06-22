"use client";

import { useState } from "react";
import { generateReport, exportReportXlsx } from "@/features/reports/actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Download, FileSpreadsheet } from "lucide-react";
import { exportFilename } from "@/lib/brand";
import { downloadTextFile, openReportPdf, reportDataToCsv } from "@/lib/report-export";
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

  async function handleGenerate(
    type: (typeof REPORT_TYPES)[number]["type"],
    format: "json" | "csv" | "xlsx" | "pdf",
  ) {
    setLoading(`${type}-${format}`);
    try {
      const slug = type.toLowerCase();
      const timestamp = Date.now();

      if (format === "xlsx") {
        const exported = await exportReportXlsx(type);
        const binary = atob(exported.base64);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
        const blob = new Blob([bytes], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = exported.filename;
        a.click();
        URL.revokeObjectURL(url);
        toast.success("Relatório Excel exportado");
        return;
      }

      const report = await generateReport(type);

      if (format === "json") {
        downloadTextFile(
          JSON.stringify(report.data, null, 2),
          exportFilename(slug, "json"),
          "application/json",
        );
      } else if (format === "csv") {
        downloadTextFile(
          reportDataToCsv(report.data),
          exportFilename(slug, "csv"),
          "text/csv;charset=utf-8",
        );
      } else {
        openReportPdf(report.title, report.data);
      }

      toast.success(`Relatório "${report.title}" exportado`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao gerar relatório");
    } finally {
      setLoading(null);
    }
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
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                onClick={() => handleGenerate(report.type, "json")}
                disabled={loading === `${report.type}-json`}
              >
                {loading === `${report.type}-json` ? "Gerando..." : "JSON"}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleGenerate(report.type, "xlsx")}
                disabled={loading === `${report.type}-xlsx`}
              >
                <FileSpreadsheet className="mr-1 h-4 w-4" />
                {loading === `${report.type}-xlsx` ? "Gerando..." : "Excel"}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleGenerate(report.type, "csv")}
                disabled={loading === `${report.type}-csv`}
              >
                {loading === `${report.type}-csv` ? "Gerando..." : "CSV"}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleGenerate(report.type, "pdf")}
                disabled={loading === `${report.type}-pdf`}
              >
                <Download className="mr-1 h-4 w-4" />
                {loading === `${report.type}-pdf` ? "Gerando..." : "PDF"}
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
