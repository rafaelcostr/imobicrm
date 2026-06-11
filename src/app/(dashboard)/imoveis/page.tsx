import Link from "next/link";
import { getProperties } from "@/actions/properties";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { PROPERTY_STATUS_LABELS, PROPERTY_TYPE_LABELS } from "@/lib/labels";
import { formatCurrency } from "@/lib/utils";
import { Building2, Plus } from "lucide-react";

export const metadata = { title: "Imóveis" };

export default async function PropertiesPage() {
  const properties = await getProperties();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Gestão de Imóveis</h1>
          <p className="text-muted-foreground">Cadastre e gerencie seu portfólio de imóveis</p>
        </div>
        <Button asChild>
          <Link href="/imoveis/novo">
            <Plus className="mr-2 h-4 w-4" />
            Novo Imóvel
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {properties.map((property) => (
          <Link key={property.id} href={`/imoveis/${property.id}`}>
            <Card className="overflow-hidden transition-shadow hover:shadow-md">
              <div className="flex h-40 items-center justify-center bg-muted">
                <Building2 className="h-12 w-12 text-muted-foreground" />
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
      </div>
      {properties.length === 0 && (
        <p className="text-center text-muted-foreground">Nenhum imóvel cadastrado</p>
      )}
    </div>
  );
}
