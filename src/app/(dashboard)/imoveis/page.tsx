import Link from "next/link";
import { getProperties } from "@/actions/properties";
import { PageHeader } from "@/components/layout/page-header";
import { Pagination } from "@/components/layout/pagination";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { pageMetadata } from "@/lib/metadata";
import { PROPERTY_STATUS_LABELS, PROPERTY_TYPE_LABELS } from "@/lib/labels";
import { formatCurrency } from "@/lib/utils";
import { Building2, Plus } from "lucide-react";

export const metadata = pageMetadata("Imóveis", "Cadastre e gerencie seu portfólio de imóveis.");

export default async function PropertiesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page } = await searchParams;
  const result = await getProperties({ page });

  return (
    <section className="space-y-6" aria-labelledby="page-title">
      <PageHeader
        title="Gestão de Imóveis"
        description="Cadastre e gerencie seu portfólio de imóveis"
        actions={
          <Button asChild>
            <Link href="/imoveis/novo">
              <Plus className="mr-2 h-4 w-4" />
              Novo Imóvel
            </Link>
          </Button>
        }
      />

      <section aria-label="Portfólio de imóveis" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {result.items.map((property) => (
          <Link key={property.id} href={`/imoveis/${property.id}`}>
            <Card className="overflow-hidden transition-shadow hover:shadow-md">
              <div className="flex h-40 items-center justify-center bg-muted">
                <Building2 className="h-12 w-12 text-muted-foreground" aria-hidden="true" />
              </div>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold line-clamp-1">{property.title}</p>
                    <p className="text-xs text-muted-foreground">{property.code}</p>
                  </div>
                  <Badge variant="secondary">{PROPERTY_STATUS_LABELS[property.status]}</Badge>
                </div>
                <p className="mt-2 text-lg font-bold text-primary">{formatCurrency(Number(property.price))}</p>
                <p className="text-xs text-muted-foreground">
                  {PROPERTY_TYPE_LABELS[property.type]} · {property.city}/{property.state}
                </p>
                <p className="text-xs text-muted-foreground">
                  {property.bedrooms} quartos · {property.bathrooms} banheiros · {property.garages} vagas
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </section>
      {result.items.length === 0 && (
        <p className="text-center text-muted-foreground">Nenhum imóvel cadastrado</p>
      )}
      <Pagination
        page={result.page}
        totalPages={result.totalPages}
        total={result.total}
        basePath="/imoveis"
      />
    </section>
  );
}
