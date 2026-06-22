"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { updateSystemConfig } from "@/features/settings/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export function SystemConfigForm({
  defaultValues,
}: {
  defaultValues: {
    companyName: string;
    tagline?: string | null;
    defaultMonthlyGoal?: number | null;
    capturePageTitle?: string | null;
  };
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const form = new FormData(e.currentTarget);
    try {
      await updateSystemConfig({
        companyName: form.get("companyName") as string,
        tagline: (form.get("tagline") as string) || undefined,
        capturePageTitle: (form.get("capturePageTitle") as string) || undefined,
        defaultMonthlyGoal: form.get("defaultMonthlyGoal")
          ? Number(form.get("defaultMonthlyGoal"))
          : undefined,
      });
      toast.success("Configurações salvas");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao salvar");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-xl space-y-4 rounded-lg border border-border p-4">
      <div className="space-y-2">
        <Label htmlFor="companyName">Nome da empresa *</Label>
        <Input id="companyName" name="companyName" required defaultValue={defaultValues.companyName} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="tagline">Slogan</Label>
        <Input id="tagline" name="tagline" defaultValue={defaultValues.tagline ?? ""} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="capturePageTitle">Título da página de captação</Label>
        <Input
          id="capturePageTitle"
          name="capturePageTitle"
          defaultValue={defaultValues.capturePageTitle ?? ""}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="defaultMonthlyGoal">Meta mensal padrão (R$)</Label>
        <Input
          id="defaultMonthlyGoal"
          name="defaultMonthlyGoal"
          type="number"
          min="0"
          step="0.01"
          defaultValue={defaultValues.defaultMonthlyGoal ?? ""}
        />
      </div>
      <Button type="submit" disabled={loading}>
        {loading ? "Salvando..." : "Salvar configurações"}
      </Button>
    </form>
  );
}
