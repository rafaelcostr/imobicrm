import Link from "next/link";
import { globalSearch } from "@/features/search/actions";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { pageMetadata } from "@/lib/metadata";
import { Building2, UserCircle, Users } from "lucide-react";

export const metadata = pageMetadata("Busca", "Resultados da busca global.");

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = q?.trim() ?? "";
  const results = query.length >= 2 ? await globalSearch(query, 50) : null;

  return (
    <section className="space-y-6" aria-labelledby="page-title">
      <PageHeader
        title="Busca"
        description={
          query
            ? `Resultados para "${query}"`
            : "Digite pelo menos 2 caracteres na busca do topo"
        }
      />

      {!query && (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            Use a barra de busca no topo para encontrar leads, imóveis e corretores.
          </CardContent>
        </Card>
      )}

      {query && query.length < 2 && (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            Digite pelo menos 2 caracteres para buscar.
          </CardContent>
        </Card>
      )}

      {results && results.items.length === 0 && (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            Nenhum resultado para &quot;{query}&quot;
          </CardContent>
        </Card>
      )}

      {results && results.items.length > 0 && (
        <Card>
          <CardContent className="divide-y divide-border p-0">
            {results.items.map((item) => (
              <Link
                key={`${item.type}-${item.id}`}
                href={item.href}
                className="flex items-center gap-4 px-4 py-4 transition-colors hover:bg-muted/50"
              >
                {item.type === "lead" && <Users className="h-5 w-5 text-primary" />}
                {item.type === "property" && <Building2 className="h-5 w-5 text-primary" />}
                {item.type === "broker" && <UserCircle className="h-5 w-5 text-primary" />}
                <div className="min-w-0 flex-1">
                  <p className="font-medium">{item.title}</p>
                  <p className="text-sm text-muted-foreground">{item.subtitle}</p>
                </div>
                <span className="text-xs text-muted-foreground capitalize">
                  {item.type === "lead" ? "Lead" : item.type === "property" ? "Imóvel" : "Corretor"}
                </span>
              </Link>
            ))}
          </CardContent>
        </Card>
      )}
    </section>
  );
}
