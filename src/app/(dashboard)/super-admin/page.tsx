import {
  getSuperAdminOverview,
  ORGANIZATION_PLAN_LABELS,
} from "@/features/super-admin/actions";
import { SuperAdminPanel } from "@/features/super-admin/components/super-admin-panel";
import { PageHeader } from "@/components/layout/page-header";
import { BRAND } from "@/lib/brand";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata("Super Admin", `Gestão de tenants ${BRAND.platform}`);

export default async function SuperAdminPage() {
  const organizations = await getSuperAdminOverview();

  return (
    <section className="space-y-6" aria-labelledby="page-title">
      <PageHeader
        title="Super Admin"
        description={`${organizations.length} imobiliárias na plataforma`}
      />
      <SuperAdminPanel
        organizations={organizations.map((org) => ({
          id: org.id,
          name: org.name,
          slug: org.slug,
          plan: org.plan,
          isActive: org.isActive,
          trialEndsAt: org.trialEndsAt,
          counts: org._count,
        }))}
        planLabels={ORGANIZATION_PLAN_LABELS}
      />
    </section>
  );
}
