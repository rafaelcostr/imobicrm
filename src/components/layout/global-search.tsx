"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Building2, Search, UserCircle, Users } from "lucide-react";
import { globalSearch, type SearchResultItem } from "@/features/search/actions";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const TYPE_LABELS: Record<SearchResultItem["type"], string> = {
  lead: "Lead",
  property: "Imóvel",
  broker: "Corretor",
};

const TYPE_ICONS = {
  lead: Users,
  property: Building2,
  broker: UserCircle,
} as const;

export function GlobalSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      setOpen(false);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const data = await globalSearch(query, 8);
        setResults(data.items);
        setOpen(data.items.length > 0 || query.trim().length >= 2);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim().length < 2) return;
    setOpen(false);
    router.push(`/busca?q=${encodeURIComponent(query.trim())}`);
  }

  function handleSelect(href: string) {
    setOpen(false);
    setQuery("");
    router.push(href);
  }

  return (
    <div ref={containerRef} className="relative flex-1 max-w-xl">
      <form onSubmit={handleSubmit}>
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar leads, imóveis, corretores..."
          className="pl-10"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            if (results.length > 0 || query.trim().length >= 2) setOpen(true);
          }}
          aria-label="Busca global"
          aria-expanded={open}
          autoComplete="off"
        />
      </form>

      {open && (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-lg border border-border bg-popover shadow-lg">
          {loading && (
            <p className="px-4 py-3 text-sm text-muted-foreground">Buscando...</p>
          )}
          {!loading && results.length === 0 && query.trim().length >= 2 && (
            <p className="px-4 py-3 text-sm text-muted-foreground">Nenhum resultado</p>
          )}
          {!loading &&
            results.map((item) => {
              const Icon = TYPE_ICONS[item.type];
              return (
                <button
                  key={`${item.type}-${item.id}`}
                  type="button"
                  onClick={() => handleSelect(item.href)}
                  className="flex w-full items-center gap-3 border-b border-border/50 px-4 py-3 text-left transition-colors hover:bg-muted/50"
                >
                  <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{item.title}</p>
                    <p className="truncate text-xs text-muted-foreground">{item.subtitle}</p>
                  </div>
                  <span className="text-[10px] text-muted-foreground">
                    {TYPE_LABELS[item.type]}
                  </span>
                </button>
              );
            })}
          {!loading && query.trim().length >= 2 && (
            <Link
              href={`/busca?q=${encodeURIComponent(query.trim())}`}
              className={cn(
                "block px-4 py-2 text-center text-xs text-primary hover:bg-muted/50",
                results.length === 0 && "py-3",
              )}
              onClick={() => setOpen(false)}
            >
              Ver todos os resultados →
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
