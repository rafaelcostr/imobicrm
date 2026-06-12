"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { updateProperty } from "@/actions/properties";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  PROPERTY_PURPOSE_LABELS,
  PROPERTY_STATUS_LABELS,
  PROPERTY_TYPE_LABELS,
} from "@/lib/labels";
import { toast } from "sonner";
import type { Property, PropertyPurpose, PropertyStatus, PropertyType } from "@prisma/client";

type PropertyFormData = Pick<
  Property,
  | "id"
  | "code"
  | "title"
  | "description"
  | "type"
  | "purpose"
  | "price"
  | "condoFee"
  | "iptu"
  | "bedrooms"
  | "bathrooms"
  | "suites"
  | "garages"
  | "totalArea"
  | "builtArea"
  | "street"
  | "number"
  | "neighborhood"
  | "city"
  | "state"
  | "zipCode"
  | "status"
>;

export function EditPropertyForm({ property }: { property: PropertyFormData }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState<PropertyType>(property.type);
  const [purpose, setPurpose] = useState<PropertyPurpose>(property.purpose);
  const [status, setStatus] = useState<PropertyStatus>(property.status);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const form = new FormData(e.currentTarget);

    try {
      await updateProperty(property.id, {
        code: form.get("code") as string,
        title: form.get("title") as string,
        description: (form.get("description") as string) || undefined,
        type,
        purpose,
        status,
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
      toast.success("Imóvel atualizado!");
      router.push(`/imoveis/${property.id}`);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao atualizar imóvel");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader><CardTitle>Editar imóvel</CardTitle></CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="code">Código *</Label>
              <Input id="code" name="code" required defaultValue={property.code} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="title">Título *</Label>
              <Input id="title" name="title" required defaultValue={property.title} />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
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
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as PropertyStatus)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(PROPERTY_STATUS_LABELS).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="price">Valor *</Label>
              <Input id="price" name="price" type="number" required defaultValue={Number(property.price)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="condoFee">Condomínio</Label>
              <Input id="condoFee" name="condoFee" type="number" defaultValue={property.condoFee ? Number(property.condoFee) : ""} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="iptu">IPTU</Label>
              <Input id="iptu" name="iptu" type="number" defaultValue={property.iptu ? Number(property.iptu) : ""} />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-4">
            <div className="space-y-2"><Label htmlFor="bedrooms">Quartos</Label><Input id="bedrooms" name="bedrooms" type="number" defaultValue={property.bedrooms} /></div>
            <div className="space-y-2"><Label htmlFor="bathrooms">Banheiros</Label><Input id="bathrooms" name="bathrooms" type="number" defaultValue={property.bathrooms} /></div>
            <div className="space-y-2"><Label htmlFor="suites">Suítes</Label><Input id="suites" name="suites" type="number" defaultValue={property.suites} /></div>
            <div className="space-y-2"><Label htmlFor="garages">Garagens</Label><Input id="garages" name="garages" type="number" defaultValue={property.garages} /></div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2"><Label htmlFor="city">Cidade *</Label><Input id="city" name="city" required defaultValue={property.city} /></div>
            <div className="space-y-2"><Label htmlFor="state">Estado *</Label><Input id="state" name="state" maxLength={2} required defaultValue={property.state} /></div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2"><Label htmlFor="street">Rua</Label><Input id="street" name="street" defaultValue={property.street ?? ""} /></div>
            <div className="space-y-2"><Label htmlFor="number">Número</Label><Input id="number" name="number" defaultValue={property.number ?? ""} /></div>
          </div>
          <div className="space-y-2"><Label htmlFor="neighborhood">Bairro</Label><Input id="neighborhood" name="neighborhood" defaultValue={property.neighborhood ?? ""} /></div>
          <div className="space-y-2"><Label htmlFor="description">Descrição</Label><Textarea id="description" name="description" rows={4} defaultValue={property.description ?? ""} /></div>
          <div className="flex gap-2">
            <Button type="submit" disabled={loading}>{loading ? "Salvando..." : "Salvar alterações"}</Button>
            <Button type="button" variant="outline" onClick={() => router.back()}>Cancelar</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
