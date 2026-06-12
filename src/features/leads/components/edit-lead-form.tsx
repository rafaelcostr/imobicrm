"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { updateLead } from "@/actions/leads";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LEAD_SOURCE_LABELS, LEAD_STAGE_LABELS, LEAD_TEMPERATURE_LABELS } from "@/lib/labels";
import { toast } from "sonner";
import type { LeadSource, LeadStage, LeadTemperature } from "@prisma/client";

type LeadFormData = {
  id: string;
  name: string;
  phone: string;
  whatsapp: string | null;
  email: string | null;
  city: string | null;
  state: string | null;
  interest: string | null;
  priceRange: string | null;
  notes: string | null;
  source: LeadSource;
  stage: LeadStage;
  temperature: LeadTemperature;
};

export function EditLeadForm({ lead }: { lead: LeadFormData }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [source, setSource] = useState<LeadSource>(lead.source);
  const [stage, setStage] = useState<LeadStage>(lead.stage);
  const [temperature, setTemperature] = useState<LeadTemperature>(lead.temperature);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const form = new FormData(e.currentTarget);

    try {
      await updateLead(lead.id, {
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
        stage,
        temperature,
      });
      toast.success("Lead atualizado!");
      router.push(`/leads/${lead.id}`);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao atualizar lead");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Editar lead</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Nome *</Label>
              <Input id="name" name="name" required defaultValue={lead.name} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Telefone *</Label>
              <Input id="phone" name="phone" required defaultValue={lead.phone} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="whatsapp">WhatsApp</Label>
              <Input id="whatsapp" name="whatsapp" defaultValue={lead.whatsapp ?? ""} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input id="email" name="email" type="email" defaultValue={lead.email ?? ""} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">Cidade</Label>
              <Input id="city" name="city" defaultValue={lead.city ?? ""} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="state">Estado</Label>
              <Input id="state" name="state" maxLength={2} defaultValue={lead.state ?? ""} />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label>Origem</Label>
              <Select value={source} onValueChange={(v) => setSource(v as LeadSource)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(LEAD_SOURCE_LABELS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Etapa</Label>
              <Select value={stage} onValueChange={(v) => setStage(v as LeadStage)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(LEAD_STAGE_LABELS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Temperatura</Label>
              <Select value={temperature} onValueChange={(v) => setTemperature(v as LeadTemperature)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(LEAD_TEMPERATURE_LABELS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="interest">Interesse</Label>
            <Input id="interest" name="interest" defaultValue={lead.interest ?? ""} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="priceRange">Faixa de preço</Label>
            <Input id="priceRange" name="priceRange" defaultValue={lead.priceRange ?? ""} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Observações</Label>
            <Textarea id="notes" name="notes" rows={4} defaultValue={lead.notes ?? ""} />
          </div>
          <div className="flex gap-2">
            <Button type="submit" disabled={loading}>
              {loading ? "Salvando..." : "Salvar alterações"}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancelar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
