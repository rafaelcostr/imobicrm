import Link from "next/link";
import { notFound } from "next/navigation";
import { getPublicPropertyByCode } from "@/features/vitrine/actions";
import { publicPageMetadata } from "@/lib/metadata";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PROPERTY_PURPOSE_LABELS, PROPERTY_STATUS_LABELS, PROPERTY_TYPE_LABELS } from "@/lib/labels";
import { formatCurrency } from "@/lib/utils";
import { Bed, Bath, Car, Maximize } from "lucide-react";

export async function generateMetadata({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const property = await getPublicPropertyByCode(code);
  if (!property) return { title: "Imóvel não encontrado" };
  return publicPageMetadata(
    property.title,
    property.description ?? `${PROPERTY_TYPE_LABELS[property.type]} em ${property.city}/${property.state}`,
    `/vitrine/${property.code}`,
  );
}

export default async function VitrineDetailPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const property = await getPublicPropertyByCode(code);
  if (!property) notFound();

  const images = property.media.filter((m) => m.type === "IMAGE");
  const cover = images[0]?.url;

  return (
    <article className="space-y-6" aria-labelledby="property-title">
      <header className="space-y-2">
        <p className="text-sm text-muted-foreground">{property.code}</p>
        <h1 id="property-title" className="text-3xl font-bold">{property.title}</h1>
        <p className="text-2xl font-bold text-primary">{formatCurrency(Number(property.price))}</p>
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary">{PROPERTY_TYPE_LABELS[property.type]}</Badge>
          <Badge variant="secondary">{PROPERTY_PURPOSE_LABELS[property.purpose]}</Badge>
          <Badge>{PROPERTY_STATUS_LABELS[property.status]}</Badge>
        </div>
      </header>

      <section aria-label="Galeria" className="overflow-hidden rounded-xl border border-border">
        {cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={cover} alt={property.title} className="aspect-video w-full object-cover" />
        ) : (
          <div className="flex aspect-video items-center justify-center bg-muted text-muted-foreground">
            Sem fotos disponíveis
          </div>
        )}
        {images.length > 1 && (
          <div className="grid grid-cols-4 gap-2 p-2">
            {images.slice(1, 5).map((img) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={img.id} src={img.url} alt="" className="aspect-video rounded object-cover" />
            ))}
          </div>
        )}
      </section>

      <section aria-label="Características" className="flex flex-wrap gap-6 text-sm">
        <span className="flex items-center gap-2"><Bed className="h-4 w-4" /> {property.bedrooms} quartos</span>
        <span className="flex items-center gap-2"><Bath className="h-4 w-4" /> {property.bathrooms} banheiros</span>
        <span className="flex items-center gap-2"><Car className="h-4 w-4" /> {property.garages} vagas</span>
        <span className="flex items-center gap-2">
          <Maximize className="h-4 w-4" />{" "}
          {property.builtArea ? Number(property.builtArea) : property.totalArea ? Number(property.totalArea) : "—"} m²
        </span>
      </section>

      <section aria-label="Descrição e localização" className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Descrição</CardTitle></CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{property.description ?? "Sem descrição."}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Localização</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>
              <span className="text-muted-foreground">Bairro:</span> {property.neighborhood ?? "—"}
            </p>
            <p>
              <span className="text-muted-foreground">Cidade:</span> {property.city}/{property.state}
            </p>
            <p>
              <span className="text-muted-foreground">Condomínio:</span>{" "}
              {property.condoFee ? formatCurrency(Number(property.condoFee)) : "—"}
            </p>
            <p>
              <span className="text-muted-foreground">IPTU:</span>{" "}
              {property.iptu ? formatCurrency(Number(property.iptu)) : "—"}
            </p>
          </CardContent>
        </Card>
      </section>

      <section aria-label="Interesse" className="rounded-xl border border-primary/30 bg-primary/5 p-6 text-center">
        <h2 className="text-lg font-semibold">Interessado neste imóvel?</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Preencha o formulário e um corretor entrará em contato.
        </p>
        <Button asChild className="mt-4">
          <Link href={`/captura?imovel=${encodeURIComponent(property.code)}`}>
            Tenho interesse
          </Link>
        </Button>
      </section>
    </article>
  );
}
