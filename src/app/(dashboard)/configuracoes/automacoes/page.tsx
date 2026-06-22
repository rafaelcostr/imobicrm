import { auth } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import { getAutomationsOverview } from "@/features/automations/actions";
import { AutomationsPanel } from "@/features/automations/components/automations-panel";
import { PageHeader } from "@/components/layout/page-header";
import { pageMetadata } from "@/lib/metadata";
import type { Role } from "@prisma/client";

export const metadata = pageMetadata(
  "Automações",
  "Regras automáticas e distribuição inteligente de leads.",
);

export default async function AutomationsSettingsPage() {
  const session = await auth();
  const role = session?.user?.role as Role;
  const canManage = hasPermission(role, "automations:manage");

  const { automations, config, recentLogs } = await getAutomationsOverview();

  const activeCount = automations.filter((a) => a.isActive).length;

  return (
    <section className="space-y-6" aria-labelledby="page-title">
      <PageHeader
        title="Automações"
        description={`${activeCount} de ${automations.length} regras ativas`}
      />
      <AutomationsPanel
        automations={automations}
        leadAssignmentMode={config.leadAssignmentMode}
        coldLeadDays={config.coldLeadDays}
        recentLogs={recentLogs}
        canManage={canManage}
      />
    </section>
  );
}
