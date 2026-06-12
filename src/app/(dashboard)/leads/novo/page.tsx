import { pageMetadata } from "@/lib/metadata";
import { PageHeader } from "@/components/layout/page-header";
import { NewLeadForm } from "@/features/leads/components/new-lead-form";

export const metadata = pageMetadata("Novo Lead", "Cadastre um novo lead no ImobiCRM.");

export default function NewLeadPage() {
  return (
    <section className="mx-auto max-w-2xl space-y-6" aria-labelledby="page-title">
      <PageHeader title="Novo Lead" description="Preencha os dados do novo lead" />
      <NewLeadForm />
    </section>
  );
}
