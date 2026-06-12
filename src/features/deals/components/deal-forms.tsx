"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createVisit, createProposal, createSale } from "@/features/deals/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

type LeadOption = { id: string; name: string; phone: string };
type PropertyOption = { id: string; title: string; code: string; city: string };

export function VisitForm({
  leads,
  properties,
}: {
  leads: LeadOption[];
  properties: PropertyOption[];
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [leadId, setLeadId] = useState("");
  const [propertyId, setPropertyId] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!leadId || !propertyId) {
      toast.error("Selecione lead e imóvel");
      return;
    }
    setLoading(true);
    const form = new FormData(e.currentTarget);
    try {
      await createVisit({
        leadId,
        propertyId,
        scheduledAt: new Date(form.get("scheduledAt") as string),
        notes: (form.get("notes") as string) || undefined,
      });
      toast.success("Visita agendada!");
      router.refresh();
      (e.target as HTMLFormElement).reset();
      setLeadId("");
      setPropertyId("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao agendar visita");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border border-border p-4">
      <p className="text-sm font-medium">Agendar nova visita</p>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Lead *</Label>
          <Select value={leadId} onValueChange={setLeadId}>
            <SelectTrigger><SelectValue placeholder="Selecione o lead" /></SelectTrigger>
            <SelectContent>
              {leads.map((l) => (
                <SelectItem key={l.id} value={l.id}>{l.name} · {l.phone}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Imóvel *</Label>
          <Select value={propertyId} onValueChange={setPropertyId}>
            <SelectTrigger><SelectValue placeholder="Selecione o imóvel" /></SelectTrigger>
            <SelectContent>
              {properties.map((p) => (
                <SelectItem key={p.id} value={p.id}>{p.code} — {p.title}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="visit-date">Data e hora *</Label>
          <Input id="visit-date" name="scheduledAt" type="datetime-local" required />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="visit-notes">Observações</Label>
        <Textarea id="visit-notes" name="notes" rows={2} />
      </div>
      <Button type="submit" disabled={loading}>{loading ? "Salvando..." : "Agendar visita"}</Button>
    </form>
  );
}

export function ProposalForm({
  leads,
  properties,
}: {
  leads: LeadOption[];
  properties: PropertyOption[];
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [leadId, setLeadId] = useState("");
  const [propertyId, setPropertyId] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!leadId || !propertyId) {
      toast.error("Selecione lead e imóvel");
      return;
    }
    setLoading(true);
    const form = new FormData(e.currentTarget);
    try {
      await createProposal({
        leadId,
        propertyId,
        amount: Number(form.get("amount")),
        notes: (form.get("notes") as string) || undefined,
      });
      toast.success("Proposta registrada!");
      router.refresh();
      (e.target as HTMLFormElement).reset();
      setLeadId("");
      setPropertyId("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao registrar proposta");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border border-border p-4">
      <p className="text-sm font-medium">Registrar proposta</p>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Lead *</Label>
          <Select value={leadId} onValueChange={setLeadId}>
            <SelectTrigger><SelectValue placeholder="Selecione o lead" /></SelectTrigger>
            <SelectContent>
              {leads.map((l) => (
                <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Imóvel *</Label>
          <Select value={propertyId} onValueChange={setPropertyId}>
            <SelectTrigger><SelectValue placeholder="Selecione o imóvel" /></SelectTrigger>
            <SelectContent>
              {properties.map((p) => (
                <SelectItem key={p.id} value={p.id}>{p.code} — {p.title}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="proposal-amount">Valor proposto (R$) *</Label>
          <Input id="proposal-amount" name="amount" type="number" required min={1} />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="proposal-notes">Observações</Label>
        <Textarea id="proposal-notes" name="notes" rows={2} />
      </div>
      <Button type="submit" disabled={loading}>{loading ? "Salvando..." : "Registrar proposta"}</Button>
    </form>
  );
}

export function SaleForm({
  leads,
  properties,
}: {
  leads: LeadOption[];
  properties: PropertyOption[];
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [leadId, setLeadId] = useState("__none__");
  const [propertyId, setPropertyId] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!propertyId) {
      toast.error("Selecione o imóvel");
      return;
    }
    setLoading(true);
    const form = new FormData(e.currentTarget);
    try {
      await createSale({
        leadId: leadId !== "__none__" ? leadId : undefined,
        propertyId,
        amount: Number(form.get("amount")),
        commissionPercentage: Number(form.get("commissionPercentage") || 3),
      });
      toast.success("Venda registrada! Comissão criada automaticamente.");
      router.refresh();
      (e.target as HTMLFormElement).reset();
      setLeadId("__none__");
      setPropertyId("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao registrar venda");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border border-border p-4">
      <p className="text-sm font-medium">Registrar venda</p>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Lead (opcional)</Label>
          <Select value={leadId} onValueChange={setLeadId}>
            <SelectTrigger><SelectValue placeholder="Vincular lead" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="__none__">Sem lead vinculado</SelectItem>
              {leads.map((l) => (
                <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Imóvel *</Label>
          <Select value={propertyId} onValueChange={setPropertyId}>
            <SelectTrigger><SelectValue placeholder="Selecione o imóvel" /></SelectTrigger>
            <SelectContent>
              {properties.map((p) => (
                <SelectItem key={p.id} value={p.id}>{p.code} — {p.title}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="sale-amount">Valor da venda (R$) *</Label>
          <Input id="sale-amount" name="amount" type="number" required min={1} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="commission-pct">Comissão (%)</Label>
          <Input id="commission-pct" name="commissionPercentage" type="number" defaultValue={3} min={0} max={100} step={0.1} />
        </div>
      </div>
      <Button type="submit" disabled={loading}>{loading ? "Salvando..." : "Registrar venda"}</Button>
    </form>
  );
}
