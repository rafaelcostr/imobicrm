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

export function VitrinePropertyCard({ property }: { property: VitrineProperty }) {
  const cover = property.media[0]?.url;

  return (
    <Link href={`/vitrine/${property.code}`}>
      <Card className="overflow-hidden transition-shadow hover:shadow-md">
        <div className="relative flex h-48 items-center justify-center bg-muted">
          {cover ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={cover} alt="" className="h-full w-full object-cover" />
          ) : (
            <Building2 className="h-12 w-12 text-muted-foreground" aria-hidden="true" />
          )}
          <Badge className="absolute left-3 top-3" variant="secondary">
            {PROPERTY_PURPOSE_LABELS[property.purpose]}
          </Badge>
        </div>
        <CardContent className="space-y-2 p-4">
          <div>
            <p className="font-semibold line-clamp-1">{property.title}</p>
            <p className="text-xs text-muted-foreground">{property.code}</p>
          </div>
          <p className="text-lg font-bold text-primary">{formatCurrency(Number(property.price))}</p>
          <p className="text-xs text-muted-foreground">
            {PROPERTY_TYPE_LABELS[property.type]} · {property.city}/{property.state}
          </p>
          <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Bed className="h-3.5 w-3.5" aria-hidden="true" /> {property.bedrooms}
            </span>
            <span className="flex items-center gap-1">
              <Bath className="h-3.5 w-3.5" aria-hidden="true" /> {property.bathrooms}
            </span>
            <span className="flex items-center gap-1">
              <Car className="h-3.5 w-3.5" aria-hidden="true" /> {property.garages}
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
