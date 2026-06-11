"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createProperty } from "@/actions/properties";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PROPERTY_PURPOSE_LABELS, PROPERTY_TYPE_LABELS } from "@/lib/labels";
import { toast } from "sonner";
import type { PropertyPurpose, PropertyType } from "@prisma/client";

export default function NewPropertyPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState<PropertyType>("APARTAMENTO");
  const [purpose, setPurpose] = useState<PropertyPurpose>("VENDA");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const form = new FormData(e.currentTarget);

    try {
      const property = await createProperty({
        code: form.get("code") as string,
        title: form.get("title") as string,
        description: (form.get("description") as string) || undefined,
        type,
        purpose,
        price: Number(form.get("price")),
        condoFee: form.get("condoFee") ? Number(form.get("condoFee")) : undefined,
        iptu: form.get("iptu") ? Number(form.get("iptu")) : undefined,
        bedrooms: Number(form.get("bedrooms") || 0),
        bathrooms: Number(form.get("bathrooms") || 0),
        suites: Number(form.get("suites") || 0),
        garages: Number(form.get("garages") || 0),
        totalArea: form.get("totalArea") ? Number(form.get("totalArea")) : undefined,
        builtArea: form.get("builtArea") ? Number(form.get("builtArea")) : undefined,
        street: (form.get("street") as string) || undefined,
        number: (form.get("number") as string) || undefined,
        neighborhood: (form.get("neighborhood") as string) || undefined,
        city: form.get("city") as string,
        state: form.get("state") as string,
        zipCode: (form.get("zipCode") as string) || undefined,
      });
      toast.success("Imóvel cadastrado!");
      router.push(`/imoveis/${property.id}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao cadastrar imóvel");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Novo Imóvel</h1>
        <p className="text-muted-foreground">Cadastre um novo imóvel no portfólio</p>
      </div>
      <Card>
        <CardHeader><CardTitle>Dados do imóvel</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2"><Label htmlFor="code">Código *</Label><Input id="code" name="code" required /></div>
              <div className="space-y-2"><Label htmlFor="title">Título *</Label><Input id="title" name="title" required /></div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Tipo</Label>
                <Select value={type} onValueChange={(v) => setType(v as PropertyType)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(PROPERTY_TYPE_LABELS).map(([k, v]) => (
                      <SelectItem key={k} value={k}>{v}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Finalidade</Label>
                <Select value={purpose} onValueChange={(v) => setPurpose(v as PropertyPurpose)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(PROPERTY_PURPOSE_LABELS).map(([k, v]) => (
                      <SelectItem key={k} value={k}>{v}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2"><Label htmlFor="price">Valor *</Label><Input id="price" name="price" type="number" required /></div>
              <div className="space-y-2"><Label htmlFor="condoFee">Condomínio</Label><Input id="condoFee" name="condoFee" type="number" /></div>
              <div className="space-y-2"><Label htmlFor="iptu">IPTU</Label><Input id="iptu" name="iptu" type="number" /></div>
            </div>
            <div className="grid gap-4 sm:grid-cols-4">
              <div className="space-y-2"><Label htmlFor="bedrooms">Quartos</Label><Input id="bedrooms" name="bedrooms" type="number" defaultValue={0} /></div>
              <div className="space-y-2"><Label htmlFor="bathrooms">Banheiros</Label><Input id="bathrooms" name="bathrooms" type="number" defaultValue={0} /></div>
              <div className="space-y-2"><Label htmlFor="suites">Suítes</Label><Input id="suites" name="suites" type="number" defaultValue={0} /></div>
              <div className="space-y-2"><Label htmlFor="garages">Garagens</Label><Input id="garages" name="garages" type="number" defaultValue={0} /></div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2"><Label htmlFor="city">Cidade *</Label><Input id="city" name="city" required /></div>
              <div className="space-y-2"><Label htmlFor="state">Estado *</Label><Input id="state" name="state" maxLength={2} required /></div>
            </div>
            <div className="space-y-2"><Label htmlFor="description">Descrição</Label><Textarea id="description" name="description" rows={4} /></div>
            <div className="flex gap-2">
              <Button type="submit" disabled={loading}>{loading ? "Salvando..." : "Salvar imóvel"}</Button>
              <Button type="button" variant="outline" onClick={() => router.back()}>Cancelar</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
