"use client";

import { useState } from "react";
import { importLeadsFromCsv } from "@/features/integrations/actions";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Upload } from "lucide-react";

export function LeadCsvImportPanel({ canImport }: { canImport: boolean }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !canImport) return;

    setLoading(true);
    try {
      const content = await file.text();
      const result = await importLeadsFromCsv(content);
      toast.success(`Importação concluída: ${result.created} criados, ${result.skipped} ignorados`);
      if (result.errors.length > 0) {
        toast.message("Alguns registros falharam", {
          description: result.errors.join(" · "),
          duration: 10000,
        });
      }
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro na importação");
    } finally {
      setLoading(false);
      e.target.value = "";
    }
  }

  return (
    <div className="space-y-3 rounded-lg border border-border p-4">
      <div>
        <h3 className="font-medium">Importar leads (CSV)</h3>
        <p className="text-sm text-muted-foreground">
          Colunas: nome, telefone, email, interesse, cidade, estado, origem, portal, codigo_imovel
        </p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="csv-import">Arquivo CSV ou Excel exportado como CSV</Label>
        <input
          id="csv-import"
          type="file"
          accept=".csv,text/csv"
          disabled={!canImport || loading}
          onChange={handleFile}
          className="block w-full text-sm"
        />
      </div>
      {canImport ? (
        <Button variant="outline" size="sm" disabled={loading} asChild>
          <label htmlFor="csv-import" className="cursor-pointer">
            <Upload className="mr-1 h-4 w-4 inline" />
            {loading ? "Importando..." : "Selecionar arquivo"}
          </label>
        </Button>
      ) : (
        <p className="text-xs text-muted-foreground">Sem permissão para importar leads.</p>
      )}
    </div>
  );
}
