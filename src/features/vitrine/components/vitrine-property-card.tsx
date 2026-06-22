import Link from "next/link";
import { Building2, Bed, Bath, Car } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { PROPERTY_PURPOSE_LABELS, PROPERTY_TYPE_LABELS } from "@/lib/labels";
import { formatCurrency } from "@/lib/utils";

type VitrineProperty = {
  code: string;
  title: string;
  type: keyof typeof PROPERTY_TYPE_LABELS;
  purpose: keyof typeof PROPERTY_PURPOSE_LABELS;
  price: { toString(): string } | number;
  city: string;
  state: string;
  bedrooms: number;
  bathrooms: number;
  garages: number;
  media: Array<{ url: string }>;
};

function buildImageAlt(property: VitrineProperty): string {
  return `${property.title} — ${PROPERTY_TYPE_LABELS[property.type]} para ${PROPERTY_PURPOSE_LABELS[property.purpose].toLowerCase()} em ${property.city}/${property.state}`;
}

export function VitrinePropertyCard({ property }: { property: VitrineProperty }) {
  const cover = property.media[0]?.url;
  const headingId = `property-title-${property.code}`;
  const imageAlt = buildImageAlt(property);

  return (
    <article aria-labelledby={headingId} className="h-full">
      <Link
        href={`/vitrine/${property.code}`}
        className="block h-full rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        <Card className="h-full overflow-hidden transition-shadow hover:shadow-md">
          <div className="relative flex h-48 items-center justify-center bg-muted">
            {cover ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={cover}
                alt={imageAlt}
                className="h-full w-full object-cover"
                loading="lazy"
              />
            ) : (
              <>
                <Building2 className="h-12 w-12 text-muted-foreground" aria-hidden="true" />
                <span className="sr-only">{imageAlt}</span>
              </>
            )}
            <Badge className="absolute left-3 top-3" variant="secondary">
              {PROPERTY_PURPOSE_LABELS[property.purpose]}
            </Badge>
          </div>
          <CardContent className="space-y-2 p-4">
            <header>
              <h2 id={headingId} className="font-semibold line-clamp-2">
                {property.title}
              </h2>
              <p className="text-xs text-muted-foreground">
                Código: <span className="font-mono">{property.code}</span>
              </p>
            </header>
            <p className="text-lg font-bold text-primary">
              <span className="sr-only">Preço: </span>
              {formatCurrency(Number(property.price))}
            </p>
            <p className="text-xs text-muted-foreground">
              {PROPERTY_TYPE_LABELS[property.type]} · {property.city}/{property.state}
            </p>
            <dl className="flex flex-wrap gap-3 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <dt className="sr-only">Quartos</dt>
                <Bed className="h-3.5 w-3.5" aria-hidden="true" />
                <dd>{property.bedrooms}</dd>
              </div>
              <div className="flex items-center gap-1">
                <dt className="sr-only">Banheiros</dt>
                <Bath className="h-3.5 w-3.5" aria-hidden="true" />
                <dd>{property.bathrooms}</dd>
              </div>
              <div className="flex items-center gap-1">
                <dt className="sr-only">Vagas</dt>
                <Car className="h-3.5 w-3.5" aria-hidden="true" />
                <dd>{property.garages}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>
      </Link>
    </article>
  );
}
