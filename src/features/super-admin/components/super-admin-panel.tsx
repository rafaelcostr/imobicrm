"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  toggleOrganizationActive,
  updateOrganizationPlan,
} from "@/features/super-admin/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDateTime } from "@/lib/utils";
import { toast } from "sonner";
import type { OrganizationPlan } from "@prisma/client";

type Org = {
  id: string;
  name: string;
  slug: string;
  plan: OrganizationPlan;
  isActive: boolean;
  trialEndsAt: Date | null;
  counts: { users: number; leads: number; properties: number };
};

export function SuperAdminPanel({
  organizations,
  planLabels,
}: {
  organizations: Org[];
  planLabels: Record<OrganizationPlan, string>;
}) {
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  async function handleToggle(id: string, active: boolean) {
    setLoadingId(id);
    try {
      await toggleOrganizationActive(id, active);
      toast.success(active ? "Organização ativada" : "Organização desativada");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro");
    } finally {
      setLoadingId(null);
    }
  }

  async function handlePlan(id: string, plan: OrganizationPlan) {
    setLoadingId(id);
    try {
      await updateOrganizationPlan(id, plan);
      toast.success("Plano atualizado");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro");
    } finally {
      setLoadingId(null);
    }
  }

  return (
    <div className="space-y-3">
      {organizations.map((org) => (
        <div
          key={org.id}
          className="rounded-lg border border-border p-4 flex flex-wrap items-start justify-between gap-4"
        >
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-semibold">{org.name}</p>
              <Badge variant={org.isActive ? "success" : "secondary"}>
                {org.isActive ? "Ativa" : "Inativa"}
              </Badge>
              <Badge variant="outline">{planLabels[org.plan]}</Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              Slug: <code>{org.slug}</code> · {org.counts.users} usuários ·{" "}
              {org.counts.leads} leads · {org.counts.properties} imóveis
            </p>
            {org.trialEndsAt && (
              <p className="text-xs text-muted-foreground">
                Trial até {formatDateTime(org.trialEndsAt)}
              </p>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant="outline"
              disabled={loadingId === org.id}
              onClick={() => handleToggle(org.id, !org.isActive)}
            >
              {org.isActive ? "Desativar" : "Ativar"}
            </Button>
            {(["STARTER", "PRO", "ENTERPRISE"] as OrganizationPlan[]).map((plan) => (
              <Button
                key={plan}
                size="sm"
                variant="ghost"
                disabled={loadingId === org.id || org.plan === plan}
                onClick={() => handlePlan(org.id, plan)}
              >
                {planLabels[plan]}
              </Button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
