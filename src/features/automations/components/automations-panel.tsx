"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  toggleAutomation,
  updateAutomationSettings,
} from "@/features/automations/actions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ASSIGNMENT_MODE_LABELS,
  TRIGGER_LABELS,
  type AutomationTrigger,
} from "@/lib/automation/types";
import { formatDateTime } from "@/lib/utils";
import { toast } from "sonner";

type Automation = {
  id: string;
  name: string;
  description: string | null;
  trigger: string;
  isActive: boolean;
  isSystem: boolean;
};

type Log = {
  id: string;
  status: string;
  message: string | null;
  createdAt: Date;
  automation: { name: string };
};

export function AutomationsPanel({
  automations,
  leadAssignmentMode,
  coldLeadDays,
  recentLogs,
  canManage,
}: {
  automations: Automation[];
  leadAssignmentMode: string;
  coldLeadDays: number;
  recentLogs: Log[];
  canManage: boolean;
}) {
  const router = useRouter();
  const [mode, setMode] = useState(leadAssignmentMode);
  const [coldDays, setColdDays] = useState(String(coldLeadDays));
  const [savingSettings, setSavingSettings] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  async function handleToggle(id: string, active: boolean) {
    setTogglingId(id);
    try {
      await toggleAutomation(id, active);
      toast.success(active ? "Automação ativada" : "Automação desativada");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao atualizar");
    } finally {
      setTogglingId(null);
    }
  }

  async function handleSaveSettings(e: React.FormEvent) {
    e.preventDefault();
    if (!canManage) return;
    setSavingSettings(true);
    try {
      await updateAutomationSettings({
        leadAssignmentMode: mode as "ROUND_ROBIN" | "BY_LOAD" | "BY_REGION",
        coldLeadDays: Number(coldDays),
      });
      toast.success("Configurações de automação salvas");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao salvar");
    } finally {
      setSavingSettings(false);
    }
  }

  return (
    <div className="space-y-6">
      <form
        onSubmit={handleSaveSettings}
        className="rounded-lg border border-border p-4 space-y-4 max-w-xl"
      >
        <h2 className="font-semibold">Distribuição de leads</h2>
        <div className="space-y-2">
          <Label>Modo de atribuição</Label>
          <Select value={mode} onValueChange={setMode} disabled={!canManage}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(ASSIGNMENT_MODE_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="coldLeadDays">Dias para alerta de lead frio</Label>
          <Input
            id="coldLeadDays"
            type="number"
            min={1}
            max={90}
            value={coldDays}
            onChange={(e) => setColdDays(e.target.value)}
            disabled={!canManage}
          />
        </div>
        {canManage && (
          <Button type="submit" disabled={savingSettings}>
            {savingSettings ? "Salvando..." : "Salvar distribuição"}
          </Button>
        )}
      </form>

      <section className="space-y-3">
        <h2 className="font-semibold">Regras automáticas</h2>
        <div className="space-y-2">
          {automations.map((automation) => (
            <div
              key={automation.id}
              className="flex flex-wrap items-start justify-between gap-3 rounded-lg border border-border p-4"
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-medium">{automation.name}</p>
                  <Badge variant={automation.isActive ? "success" : "secondary"}>
                    {automation.isActive ? "Ativa" : "Inativa"}
                  </Badge>
                  {automation.isSystem && (
                    <Badge variant="outline" className="text-[10px]">
                      Sistema
                    </Badge>
                  )}
                </div>
                {automation.description && (
                  <p className="mt-1 text-sm text-muted-foreground">
                    {automation.description}
                  </p>
                )}
                <p className="mt-1 text-xs text-muted-foreground">
                  Gatilho:{" "}
                  {TRIGGER_LABELS[automation.trigger as AutomationTrigger] ??
                    automation.trigger}
                </p>
              </div>
              {canManage && (
                <Button
                  variant="outline"
                  size="sm"
                  disabled={togglingId === automation.id}
                  onClick={() => handleToggle(automation.id, !automation.isActive)}
                >
                  {automation.isActive ? "Desativar" : "Ativar"}
                </Button>
              )}
            </div>
          ))}
        </div>
      </section>

      {recentLogs.length > 0 && (
        <section className="space-y-2">
          <h2 className="font-semibold">Execuções recentes</h2>
          <div className="rounded-lg border border-border divide-y divide-border">
            {recentLogs.map((log) => (
              <div key={log.id} className="px-4 py-3 text-sm">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-medium">{log.automation.name}</span>
                  <Badge
                    variant={
                      log.status === "success"
                        ? "success"
                        : log.status === "failed"
                          ? "destructive"
                          : "secondary"
                    }
                  >
                    {log.status}
                  </Badge>
                </div>
                {log.message && (
                  <p className="text-muted-foreground">{log.message}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  {formatDateTime(log.createdAt)}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      <p className="text-xs text-muted-foreground max-w-xl">
        Cron de leads frios: configure um agendador para chamar{" "}
        <code className="rounded bg-muted px-1">GET /api/cron/cold-leads</code>{" "}
        com o header <code className="rounded bg-muted px-1">Authorization: Bearer CRON_SECRET</code>
      </p>
    </div>
  );
}
