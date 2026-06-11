"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createLead } from "@/actions/leads";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LEAD_SOURCE_LABELS } from "@/lib/labels";
import { toast } from "sonner";
import type { LeadSource } from "@prisma/client";

export default function NewLeadPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [source, setSource] = useState<LeadSource>("SITE");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const form = new FormData(e.currentTarget);

    try {
      await createLead({
        name: form.get("name") as string,
        phone: form.get("phone") as string,
        whatsapp: (form.get("whatsapp") as string) || undefined,
        email: (form.get("email") as string) || undefined,
        city: (form.get("city") as string) || undefined,
        state: (form.get("state") as string) || undefined,
        interest: (form.get("interest") as string) || undefined,
        priceRange: (form.get("priceRange") as string) || undefined,
        notes: (form.get("notes") as string) || undefined,
        source,
      });
      toast.success("Lead criado com sucesso!");
      router.push("/leads");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao criar lead");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Novo Lead</h1>
        <p className="text-muted-foreground">Preencha os dados do novo lead</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informações do lead</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Nome *</Label>
                <Input id="name" name="name" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Telefone *</Label>
                <Input id="phone" name="phone" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="whatsapp">WhatsApp</Label>
                <Input id="whatsapp" name="whatsapp" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input id="email" name="email" type="email" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">Cidade</Label>
                <Input id="city" name="city" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">Estado</Label>
                <Input id="state" name="state" maxLength={2} placeholder="SP" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Origem do lead</Label>
              <Select value={source} onValueChange={(v) => setSource(v as LeadSource)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(LEAD_SOURCE_LABELS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="interest">Interesse</Label>
              <Input id="interest" name="interest" placeholder="Ex: Apartamento 3 quartos no centro" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="priceRange">Faixa de preço</Label>
              <Input id="priceRange" name="priceRange" placeholder="Ex: R$ 400.000 - R$ 600.000" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Observações</Label>
              <Textarea id="notes" name="notes" rows={4} />
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={loading}>
                {loading ? "Salvando..." : "Salvar lead"}
              </Button>
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Cancelar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
