"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PROPERTY_PURPOSE_LABELS, PROPERTY_TYPE_LABELS } from "@/lib/labels";
import type { PropertyPurpose, PropertyType } from "@prisma/client";
import { Search } from "lucide-react";

interface VitrineFiltersProps {
  cities: string[];
  types: PropertyType[];
  purposes: PropertyPurpose[];
  current: {
    search?: string;
    city?: string;
    type?: PropertyType;
    purpose?: PropertyPurpose;
  };
}

export function VitrineFilters({ cities, types, purposes, current }: VitrineFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(current.search ?? "");
  const [city, setCity] = useState(current.city ?? "all");
  const [type, setType] = useState(current.type ?? "all");
  const [purpose, setPurpose] = useState(current.purpose ?? "all");

  function applyFilters() {
    const params = new URLSearchParams(searchParams.toString());
    if (search.trim()) params.set("search", search.trim());
    else params.delete("search");
    if (city !== "all") params.set("city", city);
    else params.delete("city");
    if (type !== "all") params.set("type", type);
    else params.delete("type");
    if (purpose !== "all") params.set("purpose", purpose);
    else params.delete("purpose");
    params.delete("page");
    router.push(`/vitrine?${params.toString()}`);
  }

  return (
    <form
      className="grid gap-3 rounded-xl border border-border bg-card p-4 sm:grid-cols-2 lg:grid-cols-5"
      onSubmit={(e) => {
        e.preventDefault();
        applyFilters();
      }}
    >
      <div className="space-y-2 sm:col-span-2">
        <Label htmlFor="vitrine-search">Buscar</Label>
        <Input
          id="vitrine-search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Título, código, bairro..."
        />
      </div>
      <div className="space-y-2">
        <Label>Cidade</Label>
        <Select value={city} onValueChange={setCity}>
          <SelectTrigger><SelectValue placeholder="Todas" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            {cities.map((c) => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>Tipo</Label>
        <Select value={type} onValueChange={setType}>
          <SelectTrigger><SelectValue placeholder="Todos" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            {types.map((t) => (
              <SelectItem key={t} value={t}>{PROPERTY_TYPE_LABELS[t]}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-end gap-2">
        <div className="flex-1 space-y-2">
          <Label>Finalidade</Label>
          <Select value={purpose} onValueChange={setPurpose}>
            <SelectTrigger><SelectValue placeholder="Todas" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              {purposes.map((p) => (
                <SelectItem key={p} value={p}>{PROPERTY_PURPOSE_LABELS[p]}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button type="submit" size="icon" aria-label="Filtrar">
          <Search className="h-4 w-4" />
        </Button>
      </div>
    </form>
  );
}
