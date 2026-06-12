import { notFound } from "next/navigation";
import { getPropertyById } from "@/actions/properties";
import { auth } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PropertyActions } from "@/features/properties/components/property-actions";
import { PROPERTY_PURPOSE_LABELS, PROPERTY_STATUS_LABELS, PROPERTY_TYPE_LABELS } from "@/lib/labels";
import { formatCurrency } from "@/lib/utils";
import { Bed, Bath, Car, Maximize } from "lucide-react";
import type { Role } from "@prisma/client";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const property = await getPropertyById(id);
  return { title: property ? property.title : "Imóvel" };
}

export default async function PropertyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [property, session] = await Promise.all([getPropertyById(id), auth()]);
  if (!property) notFound();

  const role = session?.user?.role as Role | undefined;
  const canEdit = role ? hasPermission(role, "properties:edit") : false;
  const canDelete = role ? hasPermission(role, "properties:delete") : false;

  const address = [
    property.street,
    property.number,
    property.neighborhood,
    `${property.city}/${property.state}`,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <article className="space-y-6" aria-labelledby="page-title">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">{property.code}</p>
          <h1 id="page-title" className="text-2xl font-bold">{property.title}</h1>
          <p className="text-2xl font-bold text-primary">{formatCurrency(Number(property.price))}</p>
        </div>
        <PropertyActions propertyId={property.id} canEdit={canEdit} canDelete={canDelete} />
      </header>

      <section aria-label="Galeria de fotos" className="grid h-64 place-items-center rounded-xl bg-muted">
        <p className="text-muted-foreground">Galeria de fotos ({property.media.length} mídias)</p>
      </section>

      <section aria-label="Características">
        <div className="flex flex-wrap gap-4">
          <Badge variant="secondary">{PROPERTY_TYPE_LABELS[property.type]}</Badge>
          <Badge variant="secondary">{PROPERTY_PURPOSE_LABELS[property.purpose]}</Badge>
          <Badge>{PROPERTY_STATUS_LABELS[property.status]}</Badge>
        </div>

        <div className="mt-4 flex flex-wrap gap-6 text-sm">
        <span className="flex items-center gap-2"><Bed className="h-4 w-4" /> {property.bedrooms} quartos</span>
        <span className="flex items-center gap-2"><Bath className="h-4 w-4" /> {property.bathrooms} banheiros</span>
        <span className="flex items-center gap-2"><Car className="h-4 w-4" /> {property.garages} vagas</span>
        <span className="flex items-center gap-2">
          <Maximize className="h-4 w-4" />{" "}
          {property.builtArea ? Number(property.builtArea) : property.totalArea ? Number(property.totalArea) : "—"} m²
        </span>
        </div>
      </section>

      <section aria-label="Descrição e endereço" className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Descrição</CardTitle></CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{property.description ?? "Sem descrição"}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Endereço e valores</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p><span className="text-muted-foreground">Endereço:</span> {address}</p>
            <p><span className="text-muted-foreground">Condomínio:</span> {property.condoFee ? formatCurrency(Number(property.condoFee)) : "—"}</p>
            <p><span className="text-muted-foreground">IPTU:</span> {property.iptu ? formatCurrency(Number(property.iptu)) : "—"}</p>
            <p><span className="text-muted-foreground">Corretor:</span> {property.broker?.name ?? "—"}</p>
          </CardContent>
        </Card>
      </section>
    </article>
  );
}
