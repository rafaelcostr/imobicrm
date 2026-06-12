import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  page: number;
  totalPages: number;
  total: number;
  basePath: string;
  params?: Record<string, string | undefined>;
}

function buildHref(basePath: string, page: number, params?: Record<string, string | undefined>) {
  const search = new URLSearchParams();
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value) search.set(key, value);
    }
  }
  if (page > 1) search.set("page", String(page));
  else search.delete("page");
  const qs = search.toString();
  return qs ? `${basePath}?${qs}` : basePath;
}

export function Pagination({ page, totalPages, total, basePath, params }: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <nav
      className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4"
      aria-label="Paginação"
    >
      <p className="text-sm text-muted-foreground">
        Página {page} de {totalPages} · {total} registro{total !== 1 ? "s" : ""}
      </p>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" disabled={page <= 1} asChild={page > 1}>
          {page > 1 ? (
            <Link href={buildHref(basePath, page - 1, params)} aria-label="Página anterior">
              <ChevronLeft className="h-4 w-4" />
              Anterior
            </Link>
          ) : (
            <span>
              <ChevronLeft className="mr-1 inline h-4 w-4" />
              Anterior
            </span>
          )}
        </Button>
        <Button variant="outline" size="sm" disabled={page >= totalPages} asChild={page < totalPages}>
          {page < totalPages ? (
            <Link href={buildHref(basePath, page + 1, params)} aria-label="Próxima página">
              Próxima
              <ChevronRight className="h-4 w-4" />
            </Link>
          ) : (
            <span>
              Próxima
              <ChevronRight className="ml-1 inline h-4 w-4" />
            </span>
          )}
        </Button>
      </div>
    </nav>
  );
}
