import { getSettingsOverview } from "@/features/settings/actions";
import { SystemConfigForm } from "@/features/settings/components/system-config-form";
import { PageHeader } from "@/components/layout/page-header";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata("Configurações gerais", "Branding e metas do sistema.");

export default async function GeneralSettingsPage() {
  const { config } = await getSettingsOverview();

  return (
    <section className="space-y-6" aria-labelledby="page-title">
      <PageHeader title="Configurações gerais" description="Personalize a identidade e metas padrão" />
      <SystemConfigForm
        defaultValues={{
          companyName: config.companyName,
          tagline: config.tagline,
          defaultMonthlyGoal: config.defaultMonthlyGoal
            ? Number(config.defaultMonthlyGoal)
            : null,
          capturePageTitle: config.capturePageTitle,
        }}
      />
    </section>
  );
}
