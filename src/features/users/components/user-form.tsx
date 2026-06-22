"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createUser, updateUser } from "@/features/users/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ROLE_LABELS } from "@/lib/permissions";
import { toast } from "sonner";

type TenantRole = "ADMIN" | "GESTOR" | "CORRETOR";

const TENANT_ROLES: TenantRole[] = ["ADMIN", "GESTOR", "CORRETOR"];

type TeamOption = { id: string; name: string };

export function UserForm({
  teams,
  mode = "create",
  userId,
  defaultValues,
}: {
  teams: TeamOption[];
  mode?: "create" | "edit";
  userId?: string;
  defaultValues?: {
    name: string;
    email: string;
    role: TenantRole;
    phone?: string | null;
    creci?: string | null;
    teamId?: string | null;
    monthlyGoal?: number | null;
    isActive?: boolean;
    replyToEmail?: string | null;
    emailSignature?: string | null;
  };
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState<TenantRole>(defaultValues?.role ?? "CORRETOR");
  const [teamId, setTeamId] = useState(defaultValues?.teamId ?? "__none__");
  const NONE = "__none__";

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const form = new FormData(e.currentTarget);

    const payload = {
      name: form.get("name") as string,
      email: form.get("email") as string,
      role,
      phone: (form.get("phone") as string) || undefined,
      creci: (form.get("creci") as string) || undefined,
      teamId: teamId !== NONE ? teamId : undefined,
      monthlyGoal: form.get("monthlyGoal")
        ? Number(form.get("monthlyGoal"))
        : undefined,
      ...(mode === "edit" && {
        isActive: form.get("isActive") === "on",
        replyToEmail: (form.get("replyToEmail") as string) || undefined,
        emailSignature: (form.get("emailSignature") as string) || undefined,
      }),
    };

    try {
      if (mode === "edit" && userId) {
        await updateUser(userId, payload);
        toast.success("Usuário atualizado");
        router.push("/configuracoes/usuarios");
      } else {
        const result = await createUser(payload);
        if (result.setupUrl) {
          toast.success("Usuário criado", {
            description: `Link de senha: ${result.setupUrl}`,
            duration: 15000,
          });
        } else if (result.tempPassword) {
          toast.success("Usuário criado", {
            description: `Senha temporária: ${result.tempPassword}`,
            duration: 15000,
          });
        } else {
          toast.success("Usuário criado — e-mail de convite enviado");
        }
        router.push("/configuracoes/usuarios");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao salvar");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-xl space-y-4 rounded-lg border border-border p-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="name">Nome *</Label>
          <Input id="name" name="name" required defaultValue={defaultValues?.name} />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="email">E-mail *</Label>
          <Input
            id="email"
            name="email"
            type="email"
            required
            defaultValue={defaultValues?.email}
            disabled={mode === "edit"}
          />
        </div>
        <div className="space-y-2">
          <Label>Perfil *</Label>
          <Select value={role} onValueChange={(v) => setRole(v as TenantRole)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {TENANT_ROLES.map((r) => (
                <SelectItem key={r} value={r}>{ROLE_LABELS[r]}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Equipe</Label>
          <Select value={teamId} onValueChange={setTeamId}>
            <SelectTrigger><SelectValue placeholder="Nenhuma" /></SelectTrigger>
            <SelectContent>
              <SelectItem value={NONE}>Nenhuma</SelectItem>
              {teams.map((t) => (
                <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Telefone</Label>
          <Input id="phone" name="phone" defaultValue={defaultValues?.phone ?? ""} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="creci">CRECI</Label>
          <Input id="creci" name="creci" defaultValue={defaultValues?.creci ?? ""} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="monthlyGoal">Meta mensal (R$)</Label>
          <Input
            id="monthlyGoal"
            name="monthlyGoal"
            type="number"
            min="0"
            step="0.01"
            defaultValue={defaultValues?.monthlyGoal ?? ""}
          />
        </div>
        {mode === "edit" && (
          <>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="replyToEmail">E-mail de resposta (Reply-To)</Label>
              <Input
                id="replyToEmail"
                name="replyToEmail"
                type="email"
                placeholder="corretor@imobiliaria.com"
                defaultValue={defaultValues?.replyToEmail ?? ""}
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="emailSignature">Assinatura de e-mail</Label>
              <Input
                id="emailSignature"
                name="emailSignature"
                placeholder="João Silva · CRECI 12345"
                defaultValue={defaultValues?.emailSignature ?? ""}
              />
            </div>
            <div className="flex items-center gap-2 sm:col-span-2">
              <input
                id="isActive"
                name="isActive"
                type="checkbox"
                defaultChecked={defaultValues?.isActive ?? true}
                className="h-4 w-4"
              />
              <Label htmlFor="isActive">Usuário ativo</Label>
            </div>
          </>
        )}
      </div>
      <Button type="submit" disabled={loading}>
        {loading ? "Salvando..." : mode === "edit" ? "Salvar" : "Criar usuário"}
      </Button>
    </form>
  );
}
