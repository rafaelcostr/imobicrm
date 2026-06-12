import { notFound } from "next/navigation";
import { getPropertyById } from "@/actions/properties";
import { PageHeader } from "@/components/layout/page-header";
import { EditPropertyForm } from "@/features/properties/components/edit-property-form";
import { pageMetadata } from "@/lib/metadata";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const property = await getPropertyById(id);
  return pageMetadata(property ? `Editar — ${property.title}` : "Editar imóvel");
}

export default async function EditPropertyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const property = await getPropertyById(id);
  if (!property) notFound();

  return (
    <section className="mx-auto max-w-3xl space-y-6" aria-labelledby="page-title">
      <PageHeader title="Editar Imóvel" description={`Atualize os dados de ${property.title}`} />
      <EditPropertyForm property={property} />
    </section>
  );
}
