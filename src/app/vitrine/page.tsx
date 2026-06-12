import { Suspense } from "react";
import { getPublicProperties, getPublicPropertyFilterOptions } from "@/features/vitrine/actions";
import { VitrinePropertyCard } from "@/features/vitrine/components/vitrine-property-card";
import { VitrineFilters } from "@/features/vitrine/components/vitrine-filters";
import { Pagination } from "@/components/layout/pagination";
import type { PropertyPurpose, PropertyType } from "@prisma/client";

export default async function VitrinePage({
  searchParams,
}: {
  searchParams: Promise<{
    search?: string;
    city?: string;
    type?: PropertyType;
    purpose?: PropertyPurpose;
    page?: string;
  }>;
}) {
  const params = await searchParams;
  const [result, filterOptions] = await Promise.all([
    getPublicProperties(params),
    getPublicPropertyFilterOptions(),
  ]);

  return (
    <section className="space-y-6" aria-labelledby="vitrine-title">
      <header className="space-y-2">
        <h1 id="vitrine-title" className="text-3xl font-bold">
          Imóveis disponíveis
        </h1>
        <p className="text-muted-foreground">
          Encontre o imóvel ideal para comprar ou alugar.
        </p>
      </header>

      <Suspense fallback={null}>
        <VitrineFilters
          cities={filterOptions.cities}
          types={filterOptions.types}
          purposes={filterOptions.purposes}
          current={{
            search: params.search,
            city: params.city,
            type: params.type,
            purpose: params.purpose,
          }}
        />
      </Suspense>

      {result.items.length > 0 ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {result.items.map((property) => (
              <VitrinePropertyCard key={property.id} property={property} />
            ))}
          </div>
          <Pagination
            page={result.page}
            totalPages={result.totalPages}
            total={result.total}
            basePath="/vitrine"
            params={{
              search: params.search,
              city: params.city,
              type: params.type,
              purpose: params.purpose,
            }}
          />
        </>
      ) : (
        <p className="py-12 text-center text-muted-foreground">
          Nenhum imóvel publicado no momento. Volte em breve!
        </p>
      )}
    </section>
  );
}
