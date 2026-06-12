import { CaptureForm } from "@/features/captura/components/capture-form";
import { getPublicPropertyByCode } from "@/features/vitrine/actions";

export default async function CapturaPage({
  searchParams,
}: {
  searchParams: Promise<{ imovel?: string }>;
}) {
  const { imovel } = await searchParams;
  const property = imovel ? await getPublicPropertyByCode(imovel) : null;

  return (
    <section aria-labelledby="captura-heading">
      <CaptureForm
        propertyCode={property?.code}
        propertyTitle={property?.title}
        defaultInterest={
          property ? `${property.title} (${property.code})` : undefined
        }
      />
    </section>
  );
}
