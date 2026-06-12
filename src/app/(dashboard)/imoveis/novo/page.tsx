import { pageMetadata } from "@/lib/metadata";
import { PageHeader } from "@/components/layout/page-header";
import { NewPropertyForm } from "@/features/properties/components/new-property-form";

export const metadata = pageMetadata("Novo Imóvel", "Cadastre um novo imóvel no portfólio.");

export default function NewPropertyPage() {
  return (
    <section className="mx-auto max-w-3xl space-y-6" aria-labelledby="page-title">
      <PageHeader title="Novo Imóvel" description="Cadastre um novo imóvel no portfólio" />
      <NewPropertyForm />
    </section>
  );
}
