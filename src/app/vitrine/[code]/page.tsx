import Link from "next/link";
import { notFound } from "next/navigation";
import { getPublicPropertyByCode } from "@/features/vitrine/actions";
import { Breadcrumbs } from "@/components/seo/breadcrumbs";
import { JsonLd } from "@/components/seo/json-ld";
import { publicPageMetadata } from "@/lib/metadata";
import {
  buildBreadcrumbJsonLd,
  buildRealEstateListingJsonLd,
} from "@/lib/seo/json-ld-builders";
import { getPublicSeoContext } from "@/lib/seo/public-context";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PROPERTY_PURPOSE_LABELS, PROPERTY_STATUS_LABELS, PROPERTY_TYPE_LABELS } from "@/lib/labels";
import { formatCurrency } from "@/lib/utils";
import { Bed, Bath, Car, Maximize } from "lucide-react";

export async function generateMetadata({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const ctx = await getPublicSeoContext();
  const property = await getPublicPropertyByCode(code, ctx.organizationId ?? undefined);
  if (!property) return { title: "Imóvel não encontrado" };

  const cover = property.media.find((m) => m.type === "IMAGE")?.url;
  const description =
    property.description ??
    `${PROPERTY_TYPE_LABELS[property.type]} para ${PROPERTY_PURPOSE_LABELS[property.purpose].toLowerCase()} em ${property.neighborhood ? `${property.neighborhood}, ` : ""}${property.city}/${property.state}. ${property.bedrooms} quartos, ${property.bathrooms} banheiros.`;

  return publicPageMetadata(property.title, description, `/vitrine/${property.code}`, {
    siteName: ctx.siteName,
    image: cover,
    type: "article",
  });
}

export default async function VitrineDetailPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const ctx = await getPublicSeoContext();
  const property = await getPublicPropertyByCode(code, ctx.organizationId ?? undefined);
  if (!property) notFound();

  const images = property.media.filter((m) => m.type === "IMAGE");
  const cover = images[0]?.url;
  const area = property.builtArea
    ? Number(property.builtArea)
    : property.totalArea
      ? Number(property.totalArea)
      : null;

  const breadcrumbItems = [
    { label: "Vitrine", href: "/vitrine" },
    { label: property.title },
  ];

  return (
    <>
      <JsonLd
        data={[
          buildRealEstateListingJsonLd(property, ctx.siteName),
          buildBreadcrumbJsonLd([
            { name: "Vitrine", path: "/vitrine" },
            { name: property.title, path: `/vitrine/${property.code}` },
          ]),
        ]}
      />

      <article className="space-y-6" aria-labelledby="property-title">
        <Breadcrumbs items={breadcrumbItems} />

        <header className="space-y-2">
          <p className="text-sm text-muted-foreground">
            Código: <span className="font-mono">{property.code}</span>
          </p>
          <h1 id="property-title" className="text-3xl font-bold">
            {property.title}
          </h1>
          <p className="text-2xl font-bold text-primary" aria-label="Preço">
            {formatCurrency(Number(property.price))}
          </p>
          <ul role="list" className="flex list-none flex-wrap gap-2 p-0">
            <li>
              <Badge variant="secondary">{PROPERTY_TYPE_LABELS[property.type]}</Badge>
            </li>
            <li>
              <Badge variant="secondary">{PROPERTY_PURPOSE_LABELS[property.purpose]}</Badge>
            </li>
            <li>
              <Badge>{PROPERTY_STATUS_LABELS[property.status]}</Badge>
            </li>
          </ul>
        </header>

        <section aria-labelledby="galeria-heading">
          <h2 id="galeria-heading" className="sr-only">
            Galeria de fotos
          </h2>
          <figure className="overflow-hidden rounded-xl border border-border">
            {cover ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={cover}
                alt={`Foto principal — ${property.title}`}
                className="aspect-video w-full object-cover"
              />
            ) : (
              <div className="flex aspect-video items-center justify-center bg-muted text-muted-foreground">
                Sem fotos disponíveis
              </div>
            )}
          </figure>
          {images.length > 1 && (
            <ul
              role="list"
              className="mt-2 grid list-none grid-cols-4 gap-2 p-0"
              aria-label="Fotos adicionais"
            >
              {images.slice(1, 5).map((img, index) => (
                <li key={img.id}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={img.url}
                    alt={`${property.title} — foto ${index + 2}`}
                    className="aspect-video rounded object-cover"
                    loading="lazy"
                  />
                </li>
              ))}
            </ul>
          )}
        </section>

        <section aria-labelledby="caracteristicas-heading">
          <h2 id="caracteristicas-heading" className="sr-only">
            Características do imóvel
          </h2>
          <dl className="flex flex-wrap gap-6 text-sm">
            <div className="flex items-center gap-2">
              <dt className="sr-only">Quartos</dt>
              <Bed className="h-4 w-4" aria-hidden="true" />
              <dd>{property.bedrooms} quartos</dd>
            </div>
            <div className="flex items-center gap-2">
              <dt className="sr-only">Banheiros</dt>
              <Bath className="h-4 w-4" aria-hidden="true" />
              <dd>{property.bathrooms} banheiros</dd>
            </div>
            <div className="flex items-center gap-2">
              <dt className="sr-only">Vagas de garagem</dt>
              <Car className="h-4 w-4" aria-hidden="true" />
              <dd>{property.garages} vagas</dd>
            </div>
            <div className="flex items-center gap-2">
              <dt className="sr-only">Área</dt>
              <Maximize className="h-4 w-4" aria-hidden="true" />
              <dd>{area ?? "—"} m²</dd>
            </div>
          </dl>
        </section>

        <div className="grid gap-6 lg:grid-cols-2">
          <section aria-labelledby="descricao-heading" className="rounded-xl border border-border p-6">
            <h2 id="descricao-heading" className="text-lg font-semibold">
              Descrição
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              {property.description ?? "Sem descrição cadastrada para este imóvel."}
            </p>
          </section>

          <section aria-labelledby="localizacao-heading" className="rounded-xl border border-border p-6">
            <h2 id="localizacao-heading" className="text-lg font-semibold">
              Localização
            </h2>
            <dl className="mt-3 space-y-2 text-sm">
              <div className="flex gap-2">
                <dt className="text-muted-foreground">Bairro:</dt>
                <dd>{property.neighborhood ?? "—"}</dd>
              </div>
              <div className="flex gap-2">
                <dt className="text-muted-foreground">Cidade:</dt>
                <dd>
                  {property.city}/{property.state}
                </dd>
              </div>
              <div className="flex gap-2">
                <dt className="text-muted-foreground">Condomínio:</dt>
                <dd>
                  {property.condoFee ? formatCurrency(Number(property.condoFee)) : "—"}
                </dd>
              </div>
              <div className="flex gap-2">
                <dt className="text-muted-foreground">IPTU:</dt>
                <dd>{property.iptu ? formatCurrency(Number(property.iptu)) : "—"}</dd>
              </div>
            </dl>
          </section>
        </div>

        <aside
          aria-labelledby="interesse-heading"
          className="rounded-xl border border-primary/30 bg-primary/5 p-6 text-center"
        >
          <h2 id="interesse-heading" className="text-lg font-semibold">
            Interessado neste imóvel?
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Preencha o formulário e um corretor da {ctx.siteName} entrará em contato.
          </p>
          <Button asChild className="mt-4">
            <Link href={`/captura?imovel=${encodeURIComponent(property.code)}`}>
              Tenho interesse
            </Link>
          </Button>
        </aside>
      </article>
    </>
  );
}
