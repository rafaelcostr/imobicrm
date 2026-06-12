import { notFound } from "next/navigation";
import { getLeadById } from "@/actions/leads";
import { PageHeader } from "@/components/layout/page-header";
import { EditLeadForm } from "@/features/leads/components/edit-lead-form";
import { pageMetadata } from "@/lib/metadata";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const lead = await getLeadById(id);
  return pageMetadata(lead ? `Editar — ${lead.name}` : "Editar lead");
}

export default async function EditLeadPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const lead = await getLeadById(id);
  if (!lead) notFound();

  return (
    <section className="mx-auto max-w-2xl space-y-6" aria-labelledby="page-title">
      <PageHeader title="Editar Lead" description={`Atualize os dados de ${lead.name}`} />
      <EditLeadForm lead={lead} />
    </section>
  );
}
