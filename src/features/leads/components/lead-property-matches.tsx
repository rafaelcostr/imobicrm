"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { linkLeadToProperty } from "@/features/leads/matching";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { PROPERTY_TYPE_LABELS } from "@/lib/labels";
import { toast } from "sonner";
import { Link2, ExternalLink } from "lucide-react";
import type { PropertyMatch } from "@/lib/property-match";

interface LeadPropertyMatchesProps {
  leadId: string;
  matches: PropertyMatch[];
  linkedPropertyId: string | null;
  canEdit: boolean;
}

export function LeadPropertyMatches({
  leadId,
  matches,
  linkedPropertyId,
  canEdit,
}: LeadPropertyMatchesProps) {
  const router = useRouter();
  const [linkingId, setLinkingId] = useState<string | null>(null);

  async function handleLink(propertyId: string) {
    setLinkingId(propertyId);
    try {
      await linkLeadToProperty(leadId, propertyId);
      toast.success("Imóvel vinculado ao lead");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao vincular imóvel");
    } finally {
      setLinkingId(null);
    }
  }

  if (matches.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Nenhum imóvel compatível encontrado com base em cidade, faixa de preço e interesse.
      </p>
    );
  }

  return (
    <ul className="space-y-3">
      {matches.map(({ property, score, reasons }) => {
        const isLinked = linkedPropertyId === property.id;

        return (
          <li
            key={property.id}
            className="flex flex-wrap items-start justify-between gap-3 rounded-lg border border-border p-3"
          >
            <div className="min-w-0 flex-1 space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <Link href={`/imoveis/${property.id}`} className="font-medium hover:underline">
                  {property.code} — {property.title}
                </Link>
                <Badge variant="secondary">Score {score}</Badge>
                {isLinked && <Badge variant="default">Vinculado</Badge>}
              </div>
              <p className="text-sm text-muted-foreground">
                {PROPERTY_TYPE_LABELS[property.type]} · {property.city}/{property.state} ·{" "}
                {property.bedrooms} quartos · {formatCurrency(Number(property.price))}
              </p>
              {reasons.length > 0 && (
                <p className="text-xs text-muted-foreground">{reasons.join(" · ")}</p>
              )}
            </div>
            <div className="flex shrink-0 gap-2">
              <Button variant="outline" size="sm" asChild>
                <Link href={`/imoveis/${property.id}`}>
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Ver
                </Link>
              </Button>
              {canEdit && !isLinked && (
                <Button
                  size="sm"
                  onClick={() => handleLink(property.id)}
                  disabled={linkingId === property.id}
                >
                  <Link2 className="mr-2 h-4 w-4" />
                  {linkingId === property.id ? "Vinculando..." : "Vincular"}
                </Button>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
